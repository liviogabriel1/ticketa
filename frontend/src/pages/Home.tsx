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

  const isLogged = useMemo(() => !!localStorage.getItem('token'), [])
  const userName = useMemo(() => {
    try {
      const u = localStorage.getItem('user')
      return u ? (JSON.parse(u).name as string) : ''
    } catch {
      return ''
    }
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
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <Card className="overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-slate-100 via-white to-slate-100" />
          <CardContent className="p-6 -mt-10">
            <h1 className="text-3xl font-bold">Ticketa</h1>
            <p className="text-muted-foreground mt-2">
              Crie eventos, venda ingressos, faça check-in com QR code — tudo em um só lugar.
            </p>
          </CardContent>
        </Card>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Card key={i} className="h-44 animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-16 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">🎫</div>

              {isLogged ? (
                <>
                  <h2 className="text-xl font-semibold">Nenhum evento publicado ainda</h2>
                  <p className="text-muted-foreground mt-1">
                    {userName ? `Olá, ${userName}. ` : ''}Que tal criar seu primeiro evento?
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    {/* aponte para a rota que você usar para criar evento */}
                    <a href="/event/new"><Button>Criar evento</Button></a>
                    <a href="/me/tickets"><Button variant="outline">Meus ingressos</Button></a>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">Nenhum evento publicado ainda</h2>
                  <p className="text-muted-foreground mt-1">
                    Crie um evento e comece a vender ingressos.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <a href="/login"><Button variant="outline">Entrar</Button></a>
                    <a href="/register"><Button>Criar conta</Button></a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <Card key={e.id} className="hover:shadow-md transition">
                {e.banner_url ? (
                  <img src={e.banner_url} alt={e.title} className="h-36 w-full object-cover rounded-t-2xl" />
                ) : (
                  <div className="h-36 w-full bg-slate-100 rounded-t-2xl flex items-center justify-center text-3xl">🎟️</div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{e.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(e.date_start).toLocaleString()} — {new Date(e.date_end).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{e.description}</p>
                  <div className="mt-4">
                    <a href={`/event/${e.id}`}><Button variant="outline">Ver detalhes</Button></a>
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
