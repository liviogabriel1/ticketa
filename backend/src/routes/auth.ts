import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { User } from '../models/index.js'
import { UniqueConstraintError } from 'sequelize'
import { sendMail } from '../utils/mailer.js'

const router = Router()
const EMAIL_CODE_TTL_MIN = 15

// Modo demo (portfólio)
const isDemo = () => process.env.DEMO_MODE === 'true'
const isAutoVerify = () => process.env.DEMO_AUTO_VERIFY === 'true'

// Map auxiliar para consulta rápida do OTP em DEMO_MODE (não é usado na verificação)
const devOtp = new Map<string, { code: string; expires: Date }>()

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6 dígitos
}
function signToken(u: any) {
  return jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' })
}

/** SIGNUP: cria/atualiza usuário NÃO VERIFICADO e envia código */
router.post('/signup', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['attendee', 'organizer']).optional().default('attendee'),
      company_name: z.string().optional(),
      cnpj: z.string().optional(),
    })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        message: 'validation_error',
        issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
      })
    }
    const { name, email, password, role, company_name, cnpj } = parsed.data

    const exists: any = await User.findOne({ where: { email } })
    if (exists && exists.email_verified_at) {
      return res.status(409).json({ message: 'email_in_use' })
    }

    // DEMO_AUTO_VERIFY: cria/atualiza e já loga (sem OTP)
    if (isAutoVerify()) {
      const password_hash = await bcrypt.hash(password, 10)
      let user: any = exists
      if (!user) {
        user = await User.create({
          name, email, password_hash, role,
          org_name: company_name || null,
          org_cnpj: cnpj || null,
          email_verified_at: new Date(),
        })
      } else {
        await user.update({
          name, password_hash, role,
          org_name: company_name || user.org_name || null,
          org_cnpj: cnpj || user.org_cnpj || null,
          email_verified_at: new Date(),
          verify_code_hash: null,
          verify_code_expires_at: null,
        })
      }
      const token = signToken({ id: user.id, role: user.role })
      const safe = { id: user.id, name: user.name, email: user.email, role: user.role }
      return res.status(201).json({ message: 'auto_verified', token, user: safe })
    }

    // Fluxo normal / demo com OTP
    const password_hash = await bcrypt.hash(password, 10)
    let user: any = exists
    if (!user) {
      user = await User.create({
        name, email, password_hash, role,
        org_name: company_name || null,
        org_cnpj: cnpj || null,
      })
    } else {
      await user.update({
        name, password_hash, role,
        org_name: company_name || user.org_name || null,
        org_cnpj: cnpj || user.org_cnpj || null,
      })
    }

    const code = genCode()
    const verify_code_hash = await bcrypt.hash(code, 10)
    const exp = new Date(Date.now() + EMAIL_CODE_TTL_MIN * 60 * 1000)
    await user.update({ verify_code_hash, verify_code_expires_at: exp })

    // DEMO_MODE: não envia e-mail, retorna o código para facilitar avaliação
    if (isDemo()) {
      devOtp.set(email.toLowerCase(), { code, expires: exp })
      return res.status(201).json({
        message: 'verification_sent',
        email,
        demo: { code, expires_at: exp.toISOString() },
      })
    }

    // Modo real: enviar e-mail
    const html = `
      <div style="font-family:system-ui,Segoe UI,Arial">
        <h2>Seu código do Ticketa</h2>
        <p>Use o código abaixo para confirmar seu e-mail. Ele expira em ${EMAIL_CODE_TTL_MIN} minutos.</p>
        <div style="font-size:32px;letter-spacing:6px;font-weight:700">${code}</div>
        <p>Se não foi você, ignore este e-mail.</p>
      </div>
    `
    await sendMail({ to: email, subject: 'Confirme seu e-mail', html })
    return res.status(201).json({ message: 'verification_sent', email })
  } catch (e: any) {
    if (e instanceof UniqueConstraintError) {
      return res.status(409).json({ message: 'email_in_use' })
    }
    console.error('SIGNUP ERROR', e)
    return res.status(500).json({ message: 'server_error' })
  }
})

/** VERIFY: checa código e finaliza, devolvendo token + user */
router.post('/verify-email', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      code: z.string().regex(/^\d{6}$/),
    })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ message: 'validation_error' })
    const { email, code } = parsed.data

    const user: any = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'user_not_found' })
    if (!user.verify_code_hash || !user.verify_code_expires_at) {
      return res.status(400).json({ message: 'no_pending_verification' })
    }
    if (new Date(user.verify_code_expires_at).getTime() < Date.now()) {
      return res.status(400).json({ message: 'code_expired' })
    }

    const ok = await bcrypt.compare(code, user.verify_code_hash)
    if (!ok) return res.status(400).json({ message: 'invalid_code' })

    await user.update({
      email_verified_at: new Date(),
      verify_code_hash: null,
      verify_code_expires_at: null,
    })

    const token = signToken({ id: user.id, role: user.role })
    const safe = { id: user.id, name: user.name, email: user.email, role: user.role }
    return res.json({ token, user: safe })
  } catch (e) {
    console.error('VERIFY ERROR', e)
    return res.status(500).json({ message: 'server_error' })
  }
})

/** RESEND: reenvia código (em DEMO sem enviar e-mail) */
router.post('/resend-code', async (req, res) => {
  try {
    const schema = z.object({ email: z.string().email() })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ message: 'validation_error' })
    const { email } = parsed.data

    const user: any = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'user_not_found' })
    if (user.email_verified_at) return res.status(400).json({ message: 'already_verified' })

    // DEMO: reenvia sem cooldown e sem e-mail, devolvendo o código
    if (isDemo()) {
      const code = genCode()
      const verify_code_hash = await bcrypt.hash(code, 10)
      const exp = new Date(Date.now() + EMAIL_CODE_TTL_MIN * 60 * 1000)
      await user.update({ verify_code_hash, verify_code_expires_at: exp })
      devOtp.set(email.toLowerCase(), { code, expires: exp })
      return res.json({ message: 'verification_sent', demo: { code, expires_at: exp.toISOString() } })
    }

    // Modo real: manter cooldown ~1 min antes do último expirar
    const now = Date.now()
    const lastExp = user.verify_code_expires_at ? new Date(user.verify_code_expires_at).getTime() : 0
    if (lastExp && now < lastExp - (EMAIL_CODE_TTL_MIN - 1) * 60 * 1000) {
      return res.status(429).json({ message: 'too_soon' })
    }

    const code = genCode()
    const verify_code_hash = await bcrypt.hash(code, 10)
    const exp = new Date(Date.now() + EMAIL_CODE_TTL_MIN * 60 * 1000)
    await user.update({ verify_code_hash, verify_code_expires_at: exp })

    const html = `
      <div style="font-family:system-ui,Segoe UI,Arial">
        <h2>Seu código do Ticketa</h2>
        <p>Use o código abaixo para confirmar seu e-mail. Ele expira em ${EMAIL_CODE_TTL_MIN} minutos.</p>
        <div style="font-size:32px;letter-spacing:6px;font-weight:700">${code}</div>
      </div>
    `
    await sendMail({ to: email, subject: 'Seu novo código do Ticketa', html })
    return res.json({ message: 'verification_sent' })
  } catch (e) {
    console.error('RESEND ERROR', e)
    return res.status(500).json({ message: 'server_error' })
  }
})

/** LOGIN: só permite após verificação */
router.post('/login', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ message: 'validation_error' })

    const { email, password } = parsed.data
    const user: any = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ message: 'invalid_credentials' })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ message: 'invalid_credentials' })

    if (!user.email_verified_at) {
      return res.status(403).json({ message: 'verification_required' })
    }

    const token = signToken({ id: user.id, role: user.role })
    const safe = { id: user.id, name: user.name, email: user.email, role: user.role }
    return res.json({ token, user: safe })
  } catch (e) {
    console.error('LOGIN ERROR', e)
    return res.status(500).json({ message: 'server_error' })
  }
})

/** DEV: consultar último OTP gerado (apenas quando DEMO_MODE=true) */
router.get('/dev/otp', async (req, res) => {
  if (!isDemo()) return res.status(404).json({ message: 'not_found' })
  const email = String(req.query.email || '').toLowerCase()
  if (!email) return res.status(400).json({ message: 'email_required' })
  const item = devOtp.get(email)
  if (!item) return res.status(404).json({ message: 'not_found' })
  return res.json({ email, code: item.code, expires_at: item.expires.toISOString() })
})

export default router