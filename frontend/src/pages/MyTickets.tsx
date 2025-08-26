import React, { useEffect, useState } from 'react'
import NavBar from '@/components/NavBar'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Ticket = { id: number; qr_code: string; used_at: string | null }
type Order = { id: number; amount_cents: number; Tickets?: Ticket[] }

export default function MyTickets() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ; (async () => {
      try {
        let r = await api.get('/me/orders').catch(() => null)
        if (!r) r = await api.get('/orders').catch(() => null)
        setOrders(Array.isArray(r?.data) ? r!.data : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Meus ingressos</h1>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-28 animate-pulse bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="py-16 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">🎟️</div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Você ainda não possui ingressos</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Quando comprar, eles aparecerão aqui.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-slate-100">
                    Pedido #{o.id} — R$ {(o.amount_cents / 100).toFixed(2)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {o.Tickets?.length ? (
                    <ul className="space-y-2">
                      {o.Tickets.map((t) => (
                        <li key={t.id} className="flex items-center justify-between rounded-lg border p-3 border-slate-200 dark:border-slate-700">
                          <span className="font-mono text-sm text-slate-800 dark:text-slate-200">{t.qr_code}</span>
                          {t.used_at ? (
                            <span className="text-red-700 dark:text-red-400 text-xs px-2 py-0.5 rounded border border-red-200 dark:border-red-700">USADO</span>
                          ) : (
                            <span className="text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded border border-green-200 dark:border-green-700">VÁLIDO</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">Sem ingressos vinculados a este pedido.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}