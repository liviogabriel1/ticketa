import { Router } from 'express'
import { z } from 'zod'
import auth from '../middleware/auth.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { User } from '../models/index.js'

const router = Router()

// helpers
const onlyDigits = (s: string) => s.replace(/\D/g, '')
const isValidCNPJ = (cnpjIn: string) => {
  const cnpj = onlyDigits(cnpjIn)
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false
  const calc = (base: string, pos: number) => {
    let sum = 0, p = pos
    for (let i = 0; i < base.length; i++) { sum += Number(base[i]) * p--; if (p < 2) p = 9 }
    const r = sum % 11
    return (r < 2) ? 0 : 11 - r
  }
  const d1 = calc(cnpj.slice(0, 12), 5)
  const d2 = calc(cnpj.slice(0, 12) + String(d1), 6)
  return cnpj.endsWith(`${d1}${d2}`)
}

// GET /me — dados do usuário autenticado
router.get('/', auth, async (req: AuthedRequest, res) => {
  const user = await User.findByPk(req.user!.id, {
    attributes: { exclude: ['password_hash'] },
  })
  if (!user) return res.status(404).json({ message: 'not_found' })
  res.json({ user })
})

// POST /me/become-organizer — promove para organizador
router.post('/become-organizer', auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    company_name: z.string().min(2, 'company_name_required').transform(s => s.trim()),
    cnpj: z.string().transform(v => onlyDigits(v)),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: 'validation_error',
      issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
    })
  }

  const { company_name, cnpj } = parsed.data
  if (!isValidCNPJ(cnpj)) {
    return res.status(400).json({ message: 'invalid_cnpj' })
  }

  const user = await User.findByPk(req.user!.id)
  if (!user) return res.status(404).json({ message: 'not_found' })

  const currentRole = user.get('role') as string
  if (currentRole === 'organizer' || currentRole === 'admin') {
    return res.status(409).json({ message: 'already_organizer' })
  }

  // CNPJ único entre usuários que já são/serão organizadores
  const cnpjExists = await User.findOne({ where: { org_cnpj: cnpj } })
  if (cnpjExists) return res.status(409).json({ message: 'cnpj_in_use' })

  await user.update({
    role: 'organizer',
    org_name: company_name,
    org_cnpj: cnpj,
  })

  const safe = {
    id: user.get('id'),
    name: user.get('name'),
    email: user.get('email'),
    role: user.get('role'),
    org_name: user.get('org_name'),
    org_cnpj: user.get('org_cnpj'),
  }
  return res.json({ user: safe })
})

export default router
