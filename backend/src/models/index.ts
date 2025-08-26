import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'attendee' },

  // NOVOS CAMPOS
  email_verified_at: { type: DataTypes.DATE, allowNull: true },
  verify_code_hash: { type: DataTypes.STRING, allowNull: true },
  verify_code_expires_at: { type: DataTypes.DATE, allowNull: true },

  // dados opcionais do organizer (mantém compatível)
  org_name: { type: DataTypes.STRING, allowNull: true },
  org_cnpj: { type: DataTypes.STRING, allowNull: true, unique: false },
});

export const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  owner_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  date_start: { type: DataTypes.DATE, allowNull: false },
  date_end: { type: DataTypes.DATE, allowNull: false },
  venue: { type: DataTypes.STRING, allowNull: true },
  banner_url: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'draft' },
});

export const TicketType = sequelize.define('TicketType', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  price_cents: { type: DataTypes.INTEGER, allowNull: false },
  qty_total: { type: DataTypes.INTEGER, allowNull: false },
  qty_sold: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  sales_start: { type: DataTypes.DATE, allowNull: true },
  sales_end: { type: DataTypes.DATE, allowNull: true },
});

export const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  amount_cents: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' }, // pending|paid|canceled
  provider: { type: DataTypes.STRING, allowNull: true },
  provider_ref: { type: DataTypes.STRING, allowNull: true },
});

export const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  ticket_type_id: { type: DataTypes.INTEGER, allowNull: false },
  qr_code: { type: DataTypes.STRING, allowNull: false, unique: true },
  used_at: { type: DataTypes.DATE, allowNull: true },
});

export const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  event_id: { type: DataTypes.INTEGER, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  pct_off: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  max_uses: { type: DataTypes.INTEGER, allowNull: true },
  uses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
});

// Associations
User.hasMany(Event, { foreignKey: 'owner_id' });
Event.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Event.hasMany(TicketType, { foreignKey: 'event_id' });
TicketType.belongsTo(Event, { foreignKey: 'event_id' });

Event.hasMany(Order, { foreignKey: 'event_id' });
Order.belongsTo(Event, { foreignKey: 'event_id' });

Order.hasMany(Ticket, { foreignKey: 'order_id' });
Ticket.belongsTo(Order, { foreignKey: 'order_id' });

TicketType.hasMany(Ticket, { foreignKey: 'ticket_type_id' });
Ticket.belongsTo(TicketType, { foreignKey: 'ticket_type_id' });

Event.hasMany(Coupon, { foreignKey: 'event_id' });
Coupon.belongsTo(Event, { foreignKey: 'event_id' });

export { sequelize }