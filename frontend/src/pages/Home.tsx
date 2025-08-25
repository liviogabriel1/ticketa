import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Home() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    api.get('/events').then(r => setEvents(r.data))
  }, [])

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-4">Ticketa</h1>
      <div className="grid gap-4">
        {events.map((e) => (
          <div key={e.id} className="card">
            <h2 className="text-xl font-semibold">{e.title}</h2>
            <p className="text-sm opacity-70">{new Date(e.date_start).toLocaleString()} — {new Date(e.date_end).toLocaleString()}</p>
            <p className="mt-2">{e.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <Link to={`/event/${e.id}`} className="btn">Ver detalhes</Link>
            </div>
          </div>
        ))}
        {events.length === 0 && <p>Nenhum evento publicado ainda.</p>}
      </div>
    </div>
  )
}
