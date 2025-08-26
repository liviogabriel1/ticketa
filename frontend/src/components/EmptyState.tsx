import React from 'react'
import { Link } from 'react-router-dom'

export default function EmptyState() {
    return (
        <div className="text-center py-24 bg-white rounded-2xl border">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-2xl">🎫</span>
            </div>
            <h2 className="text-xl font-semibold">Nenhum evento publicado ainda</h2>
            <p className="text-slate-600 mt-1">Crie um evento e comece a vender ingressos.</p>
            <div className="mt-6 flex items-center justify-center gap-2">
                <Link to="/login" className="px-3 py-2 rounded-lg border hover:bg-slate-50">Entrar</Link>
                <Link to="/register" className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">Criar conta</Link>
            </div>
        </div>
    )
}
