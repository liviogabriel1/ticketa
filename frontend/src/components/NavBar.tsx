import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Ticket } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function NavBar() {
    const location = useLocation()
    const navigate = useNavigate()

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const name = (() => { try { return rawUser ? (JSON.parse(rawUser).name as string) : '' } catch { return '' } })()

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/')
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl
                       border-slate-200 dark:border-slate-800
                       dark:bg-slate-900/70">
            <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
                <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl tracking-tight">
                    <Ticket className="h-6 w-6 text-slate-900 dark:text-slate-100" />
                    <span className="bg-gradient-to-r from-slate-900 to-slate-600
                           dark:from-slate-100 dark:to-slate-300
                           bg-clip-text text-transparent">
                        Ticketa
                    </span>
                </Link>

                <nav className="flex items-center gap-3">
                    <ThemeToggle />

                    {!token ? (
                        <>
                            <Link to="/login">
                                <Button
                                    variant={location.pathname === '/login' ? 'default' : 'outline'}
                                    size="sm"
                                    className="rounded-full px-5"
                                >
                                    Entrar
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button
                                    variant={location.pathname === '/register' ? 'default' : 'outline'}
                                    size="sm"
                                    className="rounded-full px-5"
                                >
                                    Criar conta
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">
                                Olá, <b>{name || 'usuário'}</b>
                            </span>
                            <Link to="/me/tickets">
                                <Button variant="outline" size="sm" className="rounded-full px-5">
                                    Meus ingressos
                                </Button>
                            </Link>
                            <Button size="sm" className="rounded-full px-5" onClick={logout}>
                                Sair
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}
