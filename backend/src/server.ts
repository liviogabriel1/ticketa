import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { sequelize } from './config/database.js';
import './models/index.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import checkoutRoutes from './routes/checkout.js';
import ticketRoutes from './routes/tickets.js';
import meRoutes from './routes/me.js';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get('/healthz', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/tickets', ticketRoutes);
app.use('/me', meRoutes);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // dev: cria/atualiza tabelas
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}
start();
