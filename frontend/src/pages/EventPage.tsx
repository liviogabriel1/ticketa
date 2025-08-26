import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import NavBar from '@/components/NavBar'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

type TicketType = {
  id: number
  name: string
  price_cents: number
  qty_total?: number
  qty_sold?: number
}
type EventFull = {
  id: number
  title: string
  description?: string
  banner_url?: string
  venue?: string
  date_start?: string
  date_end?: string
  TicketTypes?: TicketType[]
}

const fmtBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''

export default function EventPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketTypeId, setTicketTypeId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!id) { setError('ID ausente'); setLoading(false); return }
    setLoading(true); setError(null)
    api.get(`/events/${id}`)
      .then(r => {
        const ev: EventFull = r.data
        setEvent(ev)
        if (ev?.TicketTypes?.[0]) setTicketTypeId(ev.TicketTypes[0].id)
      })
      .catch(err => {
        console.error('GET /events/:id', err?.response?.data ?? err)
        setError('Evento não encontrado ou erro ao carregar.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const selected = useMemo(
    () => event?.TicketTypes?.find(t => t.id === ticketTypeId) || null,
    [event, ticketTypeId]
  )

  const total = useMemo(
    () => selected ? (selected.price_cents * quantity) : 0,
    [selected, quantity]
  )

  const buy = () => {
    if (!selected) return alert('Selecione um tipo de ingresso.')
    alert(`Comprar ${quantity} × ${selected.name} (${fmtBRL(total)}) — fluxo em breve 😉`)
  }

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><NavBar /><div className="mx-auto max-w-5xl px-4 py-12">Carregando…</div></div>
  if (error) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><NavBar /><div className="mx-auto max-w-5xl px-4 py-12 text-red-600">{error}</div></div>
  if (!event) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />

      {/* HERO */}
      <section className="relative">
        {event.banner_url ? (
          <div className="h-64 w-full overflow-hidden">
            <img src={event.banner_url} className="h-full w-full object-cover" alt={event.title} />
          </div>
        ) : <div className="h-24" />}

        <div className="mx-auto max-w-5xl px-4">
          <div className="-mt-10 md:-mt-12">
            <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 p-6 shadow">
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <div className="mt-2 text-slate-600 dark:text-slate-300 flex flex-wrap gap-x-6 gap-y-1">
                {event.venue && <span>📍 {event.venue}</span>}
                {event.date_start && <span>🗓️ {fmtDate(event.date_start)}{event.date_end ? ` — ${fmtDate(event.date_end)}` : ''}</span>}
              </div>
              {event.description && (
                <p className="mt-3 text-slate-700 dark:text-slate-300">{event.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-5xl px-4 py-8 grid gap-6 md:grid-cols-3">
        {/* COMPRA */}
        <Card className="md:col-span-2 order-2 md:order-1 border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle>Ingressos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.TicketTypes?.length ? (
              <>
                <div className="grid sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <Label>Tipo</Label>
                    <select
                      className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 outline-none border-slate-200 dark:border-slate-800"
                      value={ticketTypeId ?? ''}
                      onChange={e => setTicketTypeId(Number(e.target.value))}
                    >
                      {event.TicketTypes.map(tt => (
                        <option key={tt.id} value={tt.id}>
                          {tt.name} — {fmtBRL(tt.price_cents)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      className="mt-1"
                      type="number"
                      min={1}
                      max={10}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Number(e.target.value || '1')))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Total
                    <div className="text-xl font-semibold text-slate-900 dark:text-white">
                      {fmtBRL(total)}
                    </div>
                  </div>
                  <Button className="h-11 rounded-xl px-5" onClick={buy} disabled={!selected}>
                    Comprar
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-slate-600 dark:text-slate-300">Nenhum tipo de ingresso disponível.</p>
            )}
          </CardContent>
        </Card>

        {/* SIDEBAR / INFO RÁPIDA */}
        <div className="order-1 md:order-2 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
              {event.venue && <p><b>Local:</b> {event.venue}</p>}
              {event.date_start && <p><b>Início:</b> {fmtDate(event.date_start)}</p>}
              {event.date_end && <p><b>Término:</b> {fmtDate(event.date_end)}</p>}
              {selected && (
                <p className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <b>Ingresso selecionado:</b> {selected.name}<br />
                  <b>Preço:</b> {fmtBRL(selected.price_cents)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
