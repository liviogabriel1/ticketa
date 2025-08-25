import { Router } from 'express';
import { z } from 'zod';
import { auth, AuthedRequest } from '../middleware/auth.js';
import { Event, Order, Ticket, TicketType } from '../models/index.js';
import { randomToken } from '../utils/random.js';

const router = Router();

// Mock de checkout: cria Order e Tickets localmente (sem provedor)
router.post('/mock', auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    event_id: z.number().int(),
    ticket_type_id: z.number().int(),
    quantity: z.number().int().positive().max(10),
    coupon_code: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { event_id, ticket_type_id, quantity } = parsed.data;

  const tt = await TicketType.findByPk(ticket_type_id);
  if (!tt || tt.get('event_id') !== event_id) return res.status(400).json({ error: 'Ticket type inválido' });
  const remaining = (tt.get('qty_total') as number) - (tt.get('qty_sold') as number);
  if (remaining < quantity) return res.status(400).json({ error: 'Sem estoque suficiente' });

  const amount_cents = (tt.get('price_cents') as number) * quantity;
  const order = await Order.create({
    user_id: req.user!.id,
    event_id,
    amount_cents,
    status: 'paid', // mock já paga
    provider: 'mock',
    provider_ref: 'mock-' + randomToken(8),
  });

  const tickets = [];
  for (let i = 0; i < quantity; i++) {
    const t = await Ticket.create({
      order_id: order.get('id'),
      ticket_type_id,
      qr_code: 'TCK-' + randomToken(16),
    });
    tickets.push(t);
  }
  await tt.update({ qty_sold: (tt.get('qty_sold') as number) + quantity });

  res.status(201).json({ order, tickets });
});

export default router;
