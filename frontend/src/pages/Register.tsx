import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, Eye, EyeOff, Ticket, Building2, Loader2 } from 'lucide-react'

import NavBar from '@/components/NavBar'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Role = 'attendee' | 'organizer'

const onlyDigits = (s: string) => s.replace(/\D/g, '')
const maskCnpj = (v: string) => {
  v = onlyDigits(v).slice(0, 14)
  return v
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}
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

export default function Register() {
  const [step, setStep] = useState<'form' | 'verify'>('form')

  // form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [role, setRole] = useState<Role>('attendee')
  const [companyName, setCompanyName] = useState('')
  const [cnpj, setCnpj] = useState('')

  // verify
  const [emailForVerify, setEmailForVerify] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const navigate = useNavigate()
  const location = useLocation()

  const emailOk = /\S+@\S+\.\S+/.test(email)
  const passOk = password.length >= 6
  const match = password === confirm
  const nameOk = name.trim().length >= 3
  const cnpjOk = role === 'organizer' ? isValidCNPJ(cnpj) : true
  const companyOk = role === 'organizer' ? companyName.trim().length >= 2 : true
  const canSubmit = emailOk && passOk && match && nameOk && cnpjOk && companyOk

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      setLoading(true)
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      }
      if (role === 'organizer') {
        payload.company_name = companyName.trim()
        payload.cnpj = onlyDigits(cnpj)
      }
      const r = await api.post('/auth/signup', payload)
      if (r.data?.message === 'verification_sent') {
        setEmailForVerify(email.trim())
        setStep('verify')
        setResendCooldown(60) // cooldown visual para reenviar
      } else {
        alert('Resposta inesperada do servidor.')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message
      if (msg === 'email_in_use') {
        alert('Este e-mail já está em uso.')
      } else if (msg === 'validation_error') {
        alert('Revise os campos e tente novamente.')
      } else {
        alert('Não foi possível criar sua conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // --- verify step helpers ---
  useEffect(() => {
    let t: any
    if (step === 'verify' && resendCooldown > 0) {
      t = setInterval(() => setResendCooldown(s => (s > 0 ? s - 1 : 0)), 1000)
    }
    return () => clearInterval(t)
  }, [step, resendCooldown])

  function handleCodeChange(i: number, v: string) {
    const d = v.replace(/\D/g, '').slice(0, 1)
    const next = [...code]
    next[i] = d
    setCode(next)
    if (d && inputsRef.current[i + 1]) inputsRef.current[i + 1]?.focus()
  }
  function handleBackspace(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[i] && inputsRef.current[i - 1]) {
      inputsRef.current[i - 1]?.focus()
    }
  }
  const codeStr = code.join('')
  const codeOk = /^\d{6}$/.test(codeStr)

  async function doVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!codeOk) return
    try {
      setVerifying(true)
      const r = await api.post('/auth/verify-email', { email: emailForVerify, code: codeStr })
      localStorage.setItem('token', r.data.token)
      localStorage.setItem('user', JSON.stringify(r.data.user))
      sessionStorage.removeItem('verifyEmail')
      navigate('/') // ou /event/new se preferir para organizer
    } catch (err: any) {
      const msg = err?.response?.data?.message
      if (msg === 'invalid_code') alert('Código inválido.')
      else if (msg === 'code_expired') alert('Código expirado. Clique em “Reenviar”.')
      else alert('Não foi possível verificar. Tente novamente.')
    } finally {
      setVerifying(false)
    }
  }

  async function resend() {
    if (resendCooldown > 0) return
    try {
      setResendCooldown(60)
      await api.post('/auth/resend-code', { email: emailForVerify })
      alert('Enviamos um novo código para seu e-mail.')
      setCode(['', '', '', '', '', ''])
      inputsRef.current[0]?.focus()
    } catch {
      alert('Não foi possível reenviar agora.')
      setResendCooldown(0)
    }
  }

  // >>> OPCIONAL: abrir direto na etapa de verificação quando vier do Login
  useEffect(() => {
    const wantsVerify = new URLSearchParams(location.search).get('verify')
    const saved = sessionStorage.getItem('verifyEmail')
    if (wantsVerify && saved) {
      setEmailForVerify(saved)
      setStep('verify')
      setResendCooldown(60)
      // foca no primeiro campo do código
      setTimeout(() => inputsRef.current[0]?.focus(), 0)
    }
  }, [location.search])

  const RoleCard = ({
    value, title, desc, icon: Icon,
  }: { value: Role; title: string; desc: string; icon: any }) => {
    const active = role === value
    return (
      <button
        type="button"
        onClick={() => setRole(value)}
        className={[
          'w-full text-left rounded-2xl border p-4 transition',
          'bg-white dark:bg-slate-900',
          active
            ? 'border-slate-900 dark:border-slate-100 shadow'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
        ].join(' ')}
      >
        <div className="flex items-center gap-3">
          <div className={[
            'rounded-xl p-2',
            active ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
          ].join(' ')}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{desc}</div>
          </div>
          <div className="ml-auto">
            <span className={[
              'inline-flex items-center justify-center h-5 w-5 rounded-full text-xs',
              active ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
            ].join(' ')}>{active ? '✓' : ''}</span>
          </div>
        </div>
      </button>
    )
  }

  // ---- RENDER ----
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-slate-200 dark:bg-slate-800 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-200 dark:bg-slate-800 blur-3xl opacity-60" />

      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="hidden md:block">
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-lg rounded-3xl h-full">
              <CardContent className="p-8 flex flex-col justify-center h-full">
                <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-max">
                  <Sparkles className="h-3.5 w-3.5" />
                  Comece em minutos
                </div>
                <h1 className="text-4xl font-bold leading-tight mt-4 text-slate-900 dark:text-slate-100">
                  {step === 'form' ? (
                    <>Crie sua conta e publique <span className="text-slate-600 dark:text-slate-300">seus eventos</span>.</>
                  ) : (
                    <>Confirme seu <span className="text-slate-600 dark:text-slate-300">e-mail</span>.</>
                  )}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-3">
                  {step === 'form'
                    ? 'Venda ingressos, gere QR codes e acompanhe tudo em tempo real.'
                    : `Enviamos um código para ${emailForVerify}.`}
                </p>
                <ul className="mt-6 space-y-3 text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-slate-100" />Publicação rápida de eventos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-slate-100" />Checkout e emissão de ingressos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-slate-100" />Check-in por QR code</li>
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <div className="rounded-[28px] p-[1px] bg-gradient-to-b from-slate-200 via-white to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.12)]">
              <div className="rounded-[26px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                <Card className="border-0 shadow-none rounded-[26px] bg-transparent">
                  <CardHeader className="pb-0">
                    <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-max">
                      ✨ {step === 'form' ? 'Bem-vindo' : 'Verificação'}
                    </div>
                    <CardTitle className="text-[26px] leading-8 mt-3 text-slate-900 dark:text-slate-100">
                      {step === 'form' ? 'Criar conta' : 'Digite o código'}
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {step === 'form' ? 'Leva menos de 1 minuto.' : `Se não encontrou, verifique a caixa de spam.`}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {step === 'form' ? (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Tipo de conta */}
                        <div>
                          <Label className="text-slate-800 dark:text-slate-200">Tipo de conta</Label>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <RoleCard value="attendee" title="Comprador" desc="Comprar ingressos e ver meus tickets." icon={Ticket} />
                            <RoleCard value="organizer" title="Organizador de eventos" desc="Criar e gerenciar eventos e ingressos." icon={Building2} />
                          </div>
                        </div>

                        {role === 'organizer' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label>Nome da empresa</Label>
                              <Input placeholder="Razão social / Nome fantasia" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label>CNPJ</Label>
                              <Input placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(maskCnpj(e.target.value))} />
                              {!cnpjOk && <span className="text-xs text-red-600">CNPJ inválido</span>}
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <Label className="text-slate-800 dark:text-slate-200">Nome</Label>
                          <Input className="h-11 rounded-xl bg-white dark:bg-slate-900" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-800 dark:text-slate-200">Email</Label>
                          <Input className="h-11 rounded-xl bg-white dark:bg-slate-900" placeholder="voce@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-800 dark:text-slate-200">Senha</Label>
                          <div className="relative">
                            <Input className="h-11 rounded-xl pr-12 bg-white dark:bg-slate-900" type={showPass ? 'text' : 'password'} placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm">
                              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              {showPass ? 'Ocultar' : 'Mostrar'}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-800 dark:text-slate-200">Confirmar senha</Label>
                          <div className="relative">
                            <Input className="h-11 rounded-xl pr-12 bg-white dark:bg-slate-900" type={showConfirm ? 'text' : 'password'} placeholder="••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm">
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              {showConfirm ? 'Ocultar' : 'Mostrar'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="text-slate-600 dark:text-slate-300">
                            Já tem conta? <Link to="/login" className="underline hover:text-slate-900 dark:hover:text-white">Entrar</Link>
                          </div>
                          <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" href="#">Termos de uso</a>
                        </div>

                        <Button className="w-full h-12 rounded-2xl text-base shadow-sm hover:shadow" disabled={!canSubmit || loading}>
                          {loading ? 'Cadastrando…' : 'Cadastrar'}
                        </Button>

                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                          Ao continuar, você concorda com os Termos e a Política de Privacidade.
                        </p>
                      </form>
                    ) : (
                      <form onSubmit={doVerify} className="space-y-5">
                        <div className="space-y-1.5">
                          <Label className="text-slate-800 dark:text-slate-200">Código de verificação</Label>
                          <div className="flex gap-2 justify-between">
                            {code.map((c, i) => (
                              <Input
                                key={i}
                                ref={el => (inputsRef.current[i] = el)}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                className="h-12 w-12 text-center text-lg rounded-xl"
                                value={c}
                                onChange={(e) => handleCodeChange(i, e.target.value)}
                                onKeyDown={(e) => handleBackspace(i, e)}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Enviamos para <strong>{emailForVerify}</strong>. {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : (
                              <button type="button" onClick={resend} className="underline">Reenviar código</button>
                            )}
                          </p>
                        </div>

                        <Button className="w-full h-12 rounded-2xl text-base shadow-sm hover:shadow" disabled={!codeOk || verifying}>
                          {verifying ? (<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verificando…</span>) : 'Confirmar e criar conta'}
                        </Button>

                        <div className="text-center text-sm">
                          <button type="button" className="text-slate-600 dark:text-slate-300 underline" onClick={() => setStep('form')}>
                            Voltar e editar dados
                          </button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}