import React, { useEffect, useMemo, useState } from 'react'
import NavBar from '@/components/NavBar'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type EventType = {
  id: number
  title: string
  description?: string
  date_start: string
  date_end: string
  banner_url?: string
}

export default function Home() {
  const [events, setEvents] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)

  const { isLogged, userName, role, isOrganizer } = useMemo(() => {
    const token = !!localStorage.getItem('token')
    let name = ''
    let role: string | undefined
    try {
      const u = localStorage.getItem('user')
      if (u) {
        const parsed = JSON.parse(u)
        name = parsed?.name ?? ''
        role = parsed?.role
      }
    } catch { }
    const isOrg = role === 'organizer' || role === 'admin'
    return { isLogged: token, userName: name, role, isOrganizer: isOrg }
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/events')
        setEvents(Array.isArray(r.data) ? r.data : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80">
          <div className="hero-band" />
          <CardContent className="p-6 -mt-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Ticketa</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Crie eventos, venda ingressos, faça check-in com QR code — tudo em um só lugar.
            </p>
          </CardContent>
        </Card>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-44 animate-pulse bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl border bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-sm p-10 text-center">
              <span className="flex justify-center mb-4">
                <span className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">🎫</span>
              </span>

              {isLogged ? (
                isOrganizer ? (
                  <>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Nenhum evento publicado ainda</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {userName ? `Olá, ${userName}. ` : ''}Que tal criar seu primeiro evento?
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <a href="/event/new">
                        <Button className="rounded-xl h-10">Criar evento</Button>
                      </a>
                      <a href="/me/tickets">
                        <Button variant="outline" className="rounded-xl h-10">Meus ingressos</Button>
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Nenhum evento publicado ainda</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {userName ? `Olá, ${userName}. ` : ''}Acesse seus tickets ou torne-se organizador para criar eventos.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <a href="/me/tickets">
                        <Button className="rounded-xl h-10">Meus ingressos</Button>
                      </a>
                      <a href="/organizer/apply">
                        <Button variant="outline" className="rounded-xl h-10">Quero criar eventos</Button>
                      </a>
                    </div>
                  </>
                )
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Nenhum evento publicado ainda</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Crie um evento e comece a vender ingressos.</p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <a href="/login">
                      <Button variant="outline" className="rounded-xl h-10">Entrar</Button>
                    </a>
                    <a href="/register">
                      <Button className="rounded-xl h-10">Criar conta</Button>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <Card key={e.id} className="hover:shadow-md transition border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {e.banner_url ? (
                  <img src={e.banner_url} alt={e.title} className="h-36 w-full object-cover rounded-t-2xl" />
                ) : (
                  <div className="h-36 w-full bg-slate-100 dark:bg-slate-800 rounded-t-2xl flex items-center justify-center text-3xl">🎟️</div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 dark:text-slate-100">{e.title}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(e.date_start).toLocaleString()} — {new Date(e.date_end).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-slate-700 dark:text-slate-300">{e.description}</p>
                  <div className="mt-4">
                    <a href={`/event/${e.id}`}><Button variant="outline" className="rounded-xl">Ver detalhes</Button></a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
