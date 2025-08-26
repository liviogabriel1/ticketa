import React from 'react'
import NavBar from '@/components/NavBar'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50">
            <NavBar />
            <main className="mx-auto max-w-6xl px-4 py-16 text-center">
                <h1 className="text-3xl font-bold">Página não encontrada</h1>
                <p className="text-muted-foreground mt-2">A rota que você acessou não existe.</p>
                <a href="/" className="inline-block mt-6 underline">Voltar para a home</a>
            </main>
        </div>
    )
}
