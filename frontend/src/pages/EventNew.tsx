import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '@/components/NavBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import { X } from 'lucide-react'

type TicketTypeForm = {
    name: string
    priceMasked: string   // "R$ 20,00"
    quantity: number
    sales_start: string
    sales_end: string
}

/** helpers */
const onlyDigits = (s: string) => s.replace(/\D/g, '')
const centsToNumber = (cents: string) => (Number(cents) || 0) / 100
const formatBRL = (valueNumber: number) =>
    valueNumber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const maskBRL = (raw: string) => {
    const digits = onlyDigits(raw).slice(0, 12) // até trilhões rs
    const n = centsToNumber(digits)
    return formatBRL(n)
}
const parseBRLToNumber = (masked: string) => {
    // "R$ 1.234,56" -> 1234.56
    const digits = onlyDigits(masked)
    return centsToNumber(digits)
}

export default function EventNew() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        title: '',
        description: '',
        date_start: '',
        date_end: '',
        venue: '',
        banner_url: '',
    })
    const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([{
        name: 'Ingresso',
        priceMasked: formatBRL(0),
        quantity: 0,
        sales_start: '',
        sales_end: '',
    }])

    /** derivadas */
    const bannerOk = useMemo(
        () => form.banner_url && /^https?:\/\/.+/i.test(form.banner_url),
        [form.banner_url]
    )

    const errors = useMemo(() => {
        const list: string[] = []
        if (!form.title.trim()) list.push('Informe o título do evento.')
        if (!form.venue.trim()) list.push('Informe o local do evento.')
        if (!form.date_start) list.push('Defina a data/hora de início.')
        if (!form.date_end) list.push('Defina a data/hora de término.')
        if (form.date_start && form.date_end && new Date(form.date_end) < new Date(form.date_start)) {
            list.push('O término não pode ser antes do início.')
        }
        const validTickets = ticketTypes.filter(t =>
            t.name.trim() && parseBRLToNumber(t.priceMasked) >= 0 && t.quantity > 0
        )
        if (validTickets.length === 0) list.push('Cadastre ao menos 1 tipo de ingresso com nome, preço e quantidade > 0.')
        // vendas
        ticketTypes.forEach((t, i) => {
            if (t.sales_start && t.sales_end && new Date(t.sales_end) < new Date(t.sales_start)) {
                list.push(`No ingresso ${i + 1}, o fim das vendas é anterior ao início.`)
            }
        })
        return list
    }, [form, ticketTypes])

    /** atualizadores */
    const updateForm = (k: keyof typeof form, v: string) =>
        setForm(prev => ({ ...prev, [k]: v }))

    const updateTicket = <K extends keyof TicketTypeForm>(idx: number, key: K, value: TicketTypeForm[K]) => {
        setTicketTypes(prev => {
            const next = [...prev]
            next[idx][key] = value
            return next
        })
    }

    const addTicket = () =>
        setTicketTypes(prev => [...prev, { name: '', priceMasked: formatBRL(0), quantity: 0, sales_start: '', sales_end: '' }])

    const removeTicket = (i: number) =>
        setTicketTypes(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev)

    /** submissão */
    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (errors.length) return
        setLoading(true)
        try {
            const toISO = (s: string) => new Date(s).toISOString()

            const payloadRaw = {
                date_start: form.date_start ? toISO(form.date_start) : undefined,
                date_end: form.date_end ? toISO(form.date_end) : undefined,
                title: form.title.trim(),
                venue: form.venue.trim(),
                banner_url: form.banner_url.trim() ? form.banner_url.trim() : undefined,
                description: form.description.trim() ? form.description.trim() : undefined,
                ticket_types: ticketTypes
                    .filter(t => t.name.trim() && Number(t.quantity) > 0)
                    .map(t => ({
                        name: t.name.trim(),
                        price: parseBRLToNumber(t.priceMasked),
                        quantity: Number(t.quantity) || 0,
                        sales_start: t.sales_start ? new Date(t.sales_start).toISOString() : new Date().toISOString(),
                        sales_end: t.sales_end ? new Date(t.sales_end).toISOString() : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                    })),
            }

            // remove chaves undefined ou string vazia (defensivo)
            const payload = Object.fromEntries(
                Object.entries(payloadRaw).filter(([_, v]) => v !== undefined && v !== '')
            )

            const r = await api.post('/events', payload)
            const created = r.data
            if (created?.id) navigate(`/event/${created.id}`)
            else alert('Evento criado, mas não foi possível abrir a página.')
        } catch (err: any) {
            const data = err?.response?.data
            console.error('POST /events error (raw):', data ?? err)

            // tenta extrair mensagens do backend
            const issueMsgs = Array.isArray(data?.issues)
                ? data.issues.map((i: any) => `${i.path}: ${i.message}`).join('\n')
                : undefined

            const msg = issueMsgs
                || data?.message
                || err?.message
                || 'Falha ao criar evento.'

            alert(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <NavBar />
            <main className="mx-auto max-w-5xl px-4 py-8">
                <Card className="bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-2xl">Criar evento</CardTitle>
                    </CardHeader>
                    <CardContent>

                        {/* erros */}
                        {errors.length > 0 && (
                            <div className="mb-6 rounded-xl border border-red-300/60 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
                                <b>Corrija antes de salvar:</b>
                                <ul className="list-disc ml-5 mt-1 space-y-1">
                                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-8">
                            {/* seção: informações básicas */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold">Informações</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="title">Título</Label>
                                        <Input id="title" value={form.title}
                                            onChange={e => updateForm('title', e.target.value)}
                                            placeholder="Ex: Show da Banda X" />
                                    </div>

                                    <div>
                                        <Label htmlFor="venue">Local</Label>
                                        <Input id="venue" value={form.venue}
                                            onChange={e => updateForm('venue', e.target.value)}
                                            placeholder="Ex: Arena Centro" />
                                    </div>

                                    <div>
                                        <Label htmlFor="date_start">Início</Label>
                                        <Input id="date_start" type="datetime-local"
                                            value={form.date_start}
                                            onChange={e => {
                                                const v = e.target.value
                                                updateForm('date_start', v)
                                                if (form.date_end && new Date(form.date_end) < new Date(v)) {
                                                    updateForm('date_end', v)
                                                }
                                            }} />
                                    </div>

                                    <div>
                                        <Label htmlFor="date_end">Término</Label>
                                        <Input id="date_end" type="datetime-local"
                                            min={form.date_start || undefined}
                                            value={form.date_end}
                                            onChange={e => updateForm('date_end', e.target.value)} />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="banner_url">Banner (URL)</Label>
                                        <Input id="banner_url" value={form.banner_url}
                                            onChange={e => updateForm('banner_url', e.target.value)}
                                            placeholder="https://..." />
                                        {bannerOk && (
                                            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                                {/* preview */}
                                                <img src={form.banner_url} alt="Pré-visualização do banner" className="w-full max-h-64 object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="description">Descrição</Label>
                                        <textarea
                                            id="description"
                                            value={form.description}
                                            onChange={e => updateForm('description', e.target.value)}
                                            placeholder="Detalhes do evento"
                                            className="w-full rounded-xl border px-3 py-2 bg-transparent outline-none border-slate-200 dark:border-slate-800 min-h-[120px]"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* seção: tipos de ingresso */}
                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold">Tipos de ingresso</h3>

                                {ticketTypes.map((t, idx) => (
                                    <div key={idx}
                                        className="grid md:grid-cols-12 gap-3 items-end border rounded-xl p-3 bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800">

                                        <div className="md:col-span-3">
                                            <Label>Nome</Label>
                                            <Input value={t.name}
                                                onChange={e => updateTicket(idx, 'name', e.target.value)}
                                                placeholder="Pista, VIP..." />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label>Preço</Label>
                                            <Input
                                                inputMode="numeric"
                                                value={t.priceMasked}
                                                onChange={e => updateTicket(idx, 'priceMasked', maskBRL(e.target.value))}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label>Quantidade</Label>
                                            <Input type="number" min="0" value={t.quantity}
                                                onChange={e => updateTicket(idx, 'quantity', Number(e.target.value))} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label>Vendas de</Label>
                                            <Input type="datetime-local" value={t.sales_start}
                                                onChange={e => updateTicket(idx, 'sales_start', e.target.value)} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label>até</Label>
                                            <Input type="datetime-local" value={t.sales_end}
                                                min={t.sales_start || undefined}
                                                onChange={e => updateTicket(idx, 'sales_end', e.target.value)} />
                                        </div>

                                        <div className="md:col-span-1 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => removeTicket(idx)}
                                                disabled={ticketTypes.length === 1}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <div>
                                    <Button type="button" variant="outline" onClick={addTicket}>
                                        Adicionar tipo de ingresso
                                    </Button>
                                </div>
                            </section>

                            {/* ações */}
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => navigate('/')}>Cancelar</Button>
                                <Button type="submit" disabled={loading || errors.length > 0} className="rounded-xl h-10">
                                    {loading ? 'Criando...' : 'Criar evento'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}