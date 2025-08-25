import { Router } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth.js';
import { Ticket } from '../models/index.js';

const router = Router();

router.post('/validate', auth, async (req, res) => {
  const schema = z.object({ qr_code: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const t = await Ticket.findOne({ where: { qr_code: parsed.data.qr_code } });
  if (!t) return res.status(404).json({ valid: false, reason: 'not_found' });
  if (t.get('used_at')) return res.status(409).json({ valid: false, reason: 'already_used' });

  await t.update({ used_at: new Date() });
  res.json({ valid: true, ticket_id: t.get('id') });
});

export default router;
