import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, Eye, EyeOff } from 'lucide-react'

import NavBar from '@/components/NavBar'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'

  const emailOk = /\S+@\S+\.\S+/.test(email)
  const passOk = password.length >= 6
  const canSubmit = emailOk && passOk

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      setLoading(true)
      const r = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', r.data.token)
      localStorage.setItem('user', JSON.stringify(r.data.user))
      navigate(from, { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.message
      if (msg === 'verification_required') {
        // salva o e-mail e manda direto para a etapa de verificação do Register
        sessionStorage.setItem('verifyEmail', email.trim())
        navigate('/register?verify=1', { replace: true })
        return
      }
      if (msg === 'invalid_credentials') {
        alert('Credenciais inválidas. Verifique e tente novamente.')
      } else if (msg === 'validation_error') {
        alert('Dados inválidos. Revise e tente novamente.')
      } else {
        alert('Não foi possível entrar agora. Tente novamente em instantes.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* blobs de fundo */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-slate-200 dark:bg-slate-800 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-200 dark:bg-slate-800 blur-3xl opacity-60" />

      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          {/* Lado marketing (igual Register) */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="hidden md:block"
          >
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-lg rounded-3xl h-full">
              <CardContent className="p-8 flex flex-col justify-center h-full">
                <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-max">
                  <Sparkles className="h-3.5 w-3.5" />
                  Bem-vindo de volta
                </div>
                <h1 className="text-4xl font-bold leading-tight mt-4 text-slate-900 dark:text-slate-100">
                  Acesse sua conta e <span className="text-slate-600 dark:text-slate-300">gerencie seus eventos</span>.
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-3">
                  Venda ingressos, gere QR codes e acompanhe tudo em tempo real.
                </p>
                <ul className="mt-6 space-y-3 text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-slate-100" />Publicação rápida de eventos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-slate-100" />Checkout e emissão de ingressos</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-slate-900 dark:text-slate-100" />Check-in por QR code</li>
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          {/* Form de Login com moldura e blur como no Register */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <div className="rounded-[28px] p-[1px] bg-gradient-to-b from-slate-200 via-white to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.12)]">
              <div className="rounded-[26px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                <Card className="border-0 shadow-none rounded-[26px] bg-transparent">
                  <CardHeader className="pb-0">
                    <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 w-max">
                      🔐 Entrar
                    </div>
                    <CardTitle className="text-[26px] leading-8 mt-3 text-slate-900 dark:text-slate-100">Acesse sua conta</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Use seu email e senha.</p>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-1.5">
                        <Label className="text-slate-800 dark:text-slate-200">Email</Label>
                        <Input
                          className="h-11 rounded-xl bg-white dark:bg-slate-900"
                          placeholder="voce@email.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-slate-800 dark:text-slate-200">Senha</Label>
                        <div className="relative">
                          <Input
                            className="h-11 rounded-xl pr-12 bg-white dark:bg-slate-900"
                            type={showPass ? 'text' : 'password'}
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(v => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm"
                          >
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showPass ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-600 dark:text-slate-300">
                          Não tem conta? <Link to="/register" className="underline hover:text-slate-900 dark:hover:text-white">Criar conta</Link>
                        </div>
                        <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" href="#">Esqueci minha senha</a>
                      </div>

                      <Button className="w-full h-12 rounded-2xl text-base shadow-sm hover:shadow" disabled={!canSubmit || loading}>
                        {loading ? 'Entrando…' : 'Entrar'}
                      </Button>
                    </form>
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