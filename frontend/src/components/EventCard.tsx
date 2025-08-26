import React from 'react'
import { Link } from 'react-router-dom'

type Props = {
    id: number
    title: string
    description?: string
    date_start: string
    date_end: string
}
export default function EventCard(e: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold">{e.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        {new Date(e.date_start).toLocaleString()} — {new Date(e.date_end).toLocaleString()}
                    </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 border">Publicado</span>
            </div>
            {e.description && <p className="mt-4 text-slate-700 line-clamp-2">{e.description}</p>}
            <div className="mt-6">
                <Link to={`/event/${e.id}`} className="inline-flex px-3 py-2 rounded-lg border bg-slate-50 hover:bg-slate-100">
                    Ver detalhes
                </Link>
            </div>
        </div>
    )
}
