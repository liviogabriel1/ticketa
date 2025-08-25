import { Router } from 'express';
import { auth, AuthedRequest } from '../middleware/auth.js';
import { Order, Ticket, TicketType, Event } from '../models/index.js';

const router = Router();

router.get('/tickets', auth, async (req: AuthedRequest, res) => {
  const orders = await Order.findAll({
    where: { user_id: req.user!.id, status: 'paid' },
    include: [{ model: Ticket, include: [{ model: TicketType }, { model: Order, include: [Event] }] }],
  });
  res.json(orders);
});

export default router;
