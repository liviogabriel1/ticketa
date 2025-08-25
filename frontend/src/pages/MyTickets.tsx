import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function MyTickets() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    api.get('/me/tickets', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setOrders(r.data))
  }, [])

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-4">Meus Ingressos</h1>
      {orders.map((o) => (
        <div className="card" key={o.id}>
          <p className="font-semibold">Pedido #{o.id} — R$ {(o.amount_cents/100).toFixed(2)}</p>
          <ul className="mt-2">
            {o.Tickets?.map((t:any) => (
              <li key={t.id} className="py-1">
                <span className="font-mono">{t.qr_code}</span>
                {t.used_at ? <span className="ml-2 text-red-600">[USADO]</span> : <span className="ml-2 text-green-700">[VÁLIDO]</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {orders.length === 0 && <p>Nenhuma compra ainda.</p>}
    </div>
  )
}
