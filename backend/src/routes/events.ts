import { Router } from 'express';
import { z } from 'zod';
import { auth, AuthedRequest } from '../middleware/auth.js';
import { Event, TicketType } from '../models/index.js';

const router = Router();

router.get('/', async (_req, res) => {
  const events = await Event.findAll({ include: [{ model: TicketType }] });
  res.json(events);
});

router.post('/', auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    date_start: z.string(),
    date_end: z.string(),
    venue: z.string().optional(),
    banner_url: z.string().optional(),
    ticket_types: z.array(z.object({
      name: z.string().min(1),
      price_cents: z.number().int().nonnegative(),
      qty_total: z.number().int().positive(),
    })).min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const e = await Event.create({
    owner_id: req.user!.id,
    title: parsed.data.title,
    description: parsed.data.description,
    date_start: new Date(parsed.data.date_start),
    date_end: new Date(parsed.data.date_end),
    venue: parsed.data.venue,
    banner_url: parsed.data.banner_url,
    status: 'published',
  });
  for (const tt of parsed.data.ticket_types) {
    await TicketType.create({ event_id: e.get('id'), ...tt });
  }
  const full = await Event.findByPk(e.get('id') as number, { include: [{ model: TicketType }] });
  res.status(201).json(full);
});

export default router;
