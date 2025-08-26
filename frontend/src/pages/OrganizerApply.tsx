import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '@/components/NavBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'

const onlyDigits = (s: string) => s.replace(/\D/g, '')
const maskCnpj = (v: string) => {
    v = onlyDigits(v).slice(0, 14)
    return v
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
}
const isValidCNPJ = (cnpjIn: string) => {
    const cnpj = onlyDigits(cnpjIn)
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false
    const calc = (base: string, pos: number) => {
        let sum = 0, p = pos
        for (let i = 0; i < base.length; i++) { sum += Number(base[i]) * p--; if (p < 2) p = 9 }
        const r = sum % 11
        return (r < 2) ? 0 : 11 - r
    }
    const d1 = calc(cnpj.slice(0, 12), 5)
    const d2 = calc(cnpj.slice(0, 12) + String(d1), 6)
    return cnpj.endsWith(`${d1}${d2}`)
}

export default function OrganizerApply() {
    const [companyName, setCompanyName] = useState('')
    const [cnpj, setCnpj] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const valid = companyName.trim().length >= 2 && isValidCNPJ(cnpj)

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        if (!valid) return
        try {
            setLoading(true)
            const r = await api.post('/me/become-organizer', {
                company_name: companyName.trim(),
                cnpj: onlyDigits(cnpj),
            })
            // atualiza user no localStorage
            const prev = localStorage.getItem('user')
            const merged = { ...(prev ? JSON.parse(prev) : {}), ...r.data.user }
            localStorage.setItem('user', JSON.stringify(merged))
            navigate('/event/new')
        } catch (err: any) {
            const msg = err?.response?.data?.message
            if (msg === 'cnpj_in_use') alert('Este CNPJ já está em uso.')
            else if (msg === 'already_organizer') alert('Sua conta já é de organizador.')
            else if (msg === 'invalid_cnpj') alert('CNPJ inválido.')
            else alert('Não foi possível atualizar sua conta.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <NavBar />
            <main className="mx-auto max-w-3xl px-4 py-10">
                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>Quero criar eventos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Nome da empresa</Label>
                                <Input
                                    placeholder="Razão social / Nome fantasia"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>CNPJ</Label>
                                <Input
                                    placeholder="00.000.000/0000-00"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(maskCnpj(e.target.value))}
                                />
                                {cnpj && !isValidCNPJ(cnpj) && (
                                    <span className="text-xs text-red-600">CNPJ inválido</span>
                                )}
                            </div>
                            <Button disabled={!valid || loading} className="h-11 rounded-xl">
                                {loading ? 'Atualizando…' : 'Tornar-me organizador'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}