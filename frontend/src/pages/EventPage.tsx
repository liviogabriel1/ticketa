import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function EventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<any | null>(null)
  const [ticketTypeId, setTicketTypeId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    api.get('/events').then(r => {
      const e = r.data.find((x:any) => String(x.id) === String(id))
      setEvent(e || null)
      if (e?.TicketTypes?.[0]) setTicketTypeId(e.TicketTypes[0].id)
    })
  }, [id])

  const buy = async () => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    const r = await api.post('/checkout/mock', {
      event_id: Number(id), ticket_type_id: ticketTypeId, quantity
    }, { headers: { Authorization: `Bearer ${token}` } })
    alert('Compra confirmada! Tickets emitidos: ' + r.data.tickets.map((t:any)=>t.qr_code).join(', '))
    navigate('/me/tickets')
  }

  if (!event) return <div className="container"><p>Carregando...</p></div>
  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      <p>{event.description}</p>
      <div className="card mt-4">
        <h3 className="font-semibold mb-2">Comprar</h3>
        <div className="flex gap-2 items-center">
          <select className="input" value={ticketTypeId ?? ''} onChange={e => setTicketTypeId(Number(e.target.value))}>
            {event.TicketTypes?.map((tt:any) => (
              <option key={tt.id} value={tt.id}>
                {tt.name} — R$ {(tt.price_cents/100).toFixed(2)}
              </option>
            ))}
          </select>
          <input className="input" type="number" min={1} max={10} value={quantity} onChange={e=>setQuantity(Number(e.target.value))} />
          <button className="btn" onClick={buy}>Comprar (mock)</button>
        </div>
      </div>
    </div>
  )
}
