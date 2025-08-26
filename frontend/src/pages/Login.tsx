import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react'

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

  const canSubmit = /\S+@\S+\.\S+/.test(email) && password.length >= 6

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      setLoading(true)
      const r = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', r.data.token)
      localStorage.setItem('user', JSON.stringify(r.data.user))
      navigate('/')
    } catch {
      alert('Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 relative overflow-hidden">
      {/* blobs decorativos */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-slate-200 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-200 blur-3xl opacity-60" />

      <NavBar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          {/* LADO ESQUERDO — hero */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="hidden md:block"
          >
            <Card className="bg-white/70 backdrop-blur-xl border-slate-200/70 shadow-lg rounded-3xl h-full">
              <CardContent className="p-8 flex flex-col justify-center h-full">
                <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-slate-900 text-white w-max">
                  <Sparkles className="h-3.5 w-3.5" />
                  Ticketa para organizadores
                </div>

                <h1 className="text-4xl font-bold leading-tight mt-4">
                  Faça login para gerenciar <span className="text-slate-600">seus eventos</span> e ingressos.
                </h1>

                <p className="text-slate-600 mt-3">
                  Acompanhe vendas em tempo real e realize check-in por QR code com uma experiência fluida.
                </p>

                <ul className="mt-6 space-y-3 text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-900" />
                    Checkout pronto para integração
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-900" />
                    Emissão de QR único por ingresso
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-900" />
                    Dashboard de vendas e check-ins
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          {/* LADO DIREITO — card do formulário */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            {/* wrapper com borda em gradiente */}
            <div className="rounded-[28px] p-[1px] bg-gradient-to-b from-slate-200 via-white to-slate-200 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.12)]">
              {/* card “glass” */}
              <div className="rounded-[26px] bg-white/90 backdrop-blur-xl">
                <Card className="border-0 shadow-none rounded-[26px]">
                  <CardHeader className="pb-0">
                    <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-slate-900 text-white w-max">
                      🔐 Área segura
                    </div>
                    <CardTitle className="text-[26px] leading-8 mt-3">Entrar</CardTitle>
                    <p className="text-sm text-slate-600">Bem-vindo de volta 👋</p>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label>Email</Label>
                        <Input
                          placeholder="voce@email.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 rounded-xl"
                        />
                      </div>

                      {/* Senha */}
                      <div className="space-y-1.5">
                        <Label>Senha</Label>
                        <div className="relative">
                          <Input
                            className="h-11 rounded-xl pr-12"
                            type={showPass ? 'text' : 'password'}
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-sm"
                          >
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showPass ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                      </div>

                      {/* Ações secundárias */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-600">
                          Novo aqui?{' '}
                          <Link to="/register" className="underline hover:text-slate-900">
                            Criar conta
                          </Link>
                        </div>
                        <a className="text-slate-500 hover:text-slate-900" href="#">
                          Esqueci minha senha
                        </a>
                      </div>

                      {/* CTA */}
                      <Button
                        className="w-full h-12 rounded-2xl text-base shadow-sm hover:shadow"
                        disabled={!canSubmit || loading}
                      >
                        {loading ? 'Entrando…' : 'Entrar'}
                      </Button>

                      {/* rodapé sutil */}
                      <p className="text-xs text-slate-500 text-center">
                        Protegido por autenticação JWT • Não compartilhe suas credenciais
                      </p>
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
