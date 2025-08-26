import { Router } from 'express'
import { z } from 'zod'
import auth from '../middleware/auth.js'
import { requireRole } from '../middleware/roles.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { Event, TicketType } from '../models/index.js'

const router = Router()

const ticketSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  sales_start: z.string().datetime().optional(),
  sales_end: z.string().datetime().optional(),
})

const eventSchema = z.object({
  title: z.string().min(3),
  venue: z.string().min(1),
  date_start: z.string().datetime(),
  date_end: z.string().datetime(),
  banner_url: z.string().url().optional(),
  description: z.string().optional(),
  ticket_types: z.array(ticketSchema).min(1),
})

router.post('/', auth, requireRole('organizer', 'admin'), async (req: AuthedRequest, res) => {
  const parsed = eventSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: 'validation_error',
      issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
    })
  }
  const data = parsed.data
  try {
    const ev = await Event.create({
      owner_id: req.user!.id,
      title: data.title,
      venue: data.venue,
      date_start: data.date_start,
      date_end: data.date_end,
      banner_url: data.banner_url,
      description: data.description,
      status: 'published',
    })

    for (const t of data.ticket_types) {
      await TicketType.create({
        event_id: ev.get('id') as number,
        name: t.name,
        price_cents: Math.round(t.price * 100),
        qty_total: t.quantity,
        qty_sold: 0,
        sales_start: t.sales_start ?? null,
        sales_end: t.sales_end ?? null,
      })
    }
    return res.status(201).json({ id: ev.get('id') })
  } catch (e) {
    console.error('EVENT CREATE ERROR', e)
    return res.status(500).json({ message: 'db_error' })
  }
})

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid_id' })

  const ev = await Event.findByPk(id, {
    include: [{ model: TicketType }],
  })
  if (!ev) return res.status(404).json({ message: 'not_found' })
  return res.json(ev)
})

export default router
