import 'dotenv/config'
import { Sequelize } from 'sequelize'
import dns from 'dns'

// Evita timeouts tentando IPv6 primeiro
dns.setDefaultResultOrder('ipv4first')

const {
  DATABASE_URL,
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'ticketa',
  DB_USER = 'ticketa',
  DB_PASS = 'ticketa',
  NODE_ENV = 'development',
} = process.env as Record<string, string>

export const sequelize =
  DATABASE_URL
    ? new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
      define: { underscored: true, timestamps: true },
    })
    : new Sequelize(DB_NAME, DB_USER, DB_PASS, {
      host: DB_HOST,
      port: Number(DB_PORT),
      dialect: 'postgres',
      logging: NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl:
          NODE_ENV === 'production'
            ? { require: true, rejectUnauthorized: false }
            : undefined,
      },
      define: { underscored: true, timestamps: true },
    })
