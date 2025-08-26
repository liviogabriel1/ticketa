import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { api } from '../services/api'

type TicketType = { id: number; name: string; price_cents: number; qty_total?: number; qty_sold?: number }
type EventType = {
  id: number
  title: string
  description?: string
  date_start: string
  date_end: string
  venue?: string
  banner_url?: string
  TicketTypes?: TicketType[]
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-48 bg-white rounded-2xl border animate-pulse" />
            <div className="h-40 bg-white rounded-2xl border animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-white rounded-2xl border animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function EventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<EventType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<number | ''>('')
  const [qty, setQty] = useState(1)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/events')
        const list: EventType[] = Array.isArray(r.data) ? r.data : []
        const e = list.find((x) => String(x.id) === String(id)) || null
        setEvent(e)
        if (e?.TicketTypes && e.TicketTypes.length > 0) {
          setTicketId(e.TicketTypes[0].id)
        }
      } catch (e: any) {
        setError('Falha ao carregar o evento.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const selectedTT = useMemo(
    () => (event?.TicketTypes || []).find((t) => t.id === ticketId),
    [event, ticketId]
  )

  const totalBRL = useMemo(() => {
    const price = selectedTT?.price_cents ?? 0
    return (price * qty) / 100
  }, [selectedTT, qty])

  async function buy() {
    if (!token) {
      navigate('/login')
      return
    }
    if (!event || !ticketId || qty < 1) return

    try {
      const r = await api.post(
        '/checkout/mock',
        { event_id: Number(event.id), ticket_type_id: Number(ticketId), quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Compra confirmada! Tickets: ' + r.data.tickets.map((t: any) => t.qr_code).join(', '))
      navigate('/me/tickets')
    } catch (err: any) {
      const msg = err?.response?.data?.error
        ? typeof err.response.data.error === 'string'
          ? err.response.data.error
          : JSON.stringify(err.response.data.error)
        : 'Não foi possível concluir a compra.'
      alert(msg)
    }
  }

  if (loading) return <Skeleton />

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-2xl border bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold mb-2">Evento não encontrado</h1>
            <p className="text-slate-600 mb-6">{error || 'Verifique o link ou volte para a página inicial.'}</p>
            <Link to="/" className="px-4 py-2 rounded-xl border bg-slate-50 hover:bg-slate-100">Voltar</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {/* COLUNA ESQUERDA: banner e descrição */}
          <section className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-white overflow-hidden">
              {event.banner_url ? (
                <img src={event.banner_url} alt={event.title} className="w-full h-56 object-cover" />
              ) : (
                <div className="h-56 bg-gradient-to-br from-white to-slate-100 flex items-center justify-center">
                  <span className="text-4xl">🎫</span>
                </div>
              )}
              <div className="p-6">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <p className="text-slate-600 mt-2">
                  {new Date(event.date_start).toLocaleString()} — {new Date(event.date_end).toLocaleString()}
                  {event.venue ? <> · <span className="font-medium">{event.venue}</span></> : null}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold">Sobre o evento</h2>
              <p className="text-slate-700 mt-2 whitespace-pre-line">
                {event.description || 'Sem descrição.'}
              </p>
            </div>
          </section>

          {/* COLUNA DIREITA: compra */}
          <aside className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 sticky top-20">
              <h3 className="text-xl font-semibold">Comprar ingresso</h3>

              <div className="mt-4 space-y-4">
                {/* seletor de lote */}
                <div>
                  <label className="block text-sm font-medium mb-1">Lote</label>
                  <select
                    className="input-field"
                    value={ticketId}
                    onChange={(e) => setTicketId(Number(e.target.value))}
                  >
                    {(event.TicketTypes || []).map((tt) => (
                      <option key={tt.id} value={tt.id}>
                        {tt.name} — R$ {(tt.price_cents / 100).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* quantidade */}
                <div>
                  <label className="block text-sm font-medium mb-1">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="input-field"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  />
                </div>

                {/* resumo */}
                <div className="rounded-xl bg-slate-50 border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">R$ {totalBRL.toFixed(2)}</span>
                  </div>
                  <p className="text-slate-500 mt-2">
                    * Checkout mock: pagamento simulado apenas para testes.
                  </p>
                </div>

                <button
                  onClick={buy}
                  className="btn-primary w-full"
                >
                  Confirmar compra
                </button>

                {!token && (
                  <p className="text-xs text-slate-600 text-center">
                    Você precisa <Link to="/login" className="underline">entrar</Link> para finalizar a compra.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h4 className="font-semibold mb-2">Informações</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Ingresso digital com QR code único</li>
                <li>• Validação de entrada em tempo real</li>
                <li>• Reembolso e suporte pelo organizador</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}