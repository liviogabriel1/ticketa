import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

export interface AuthedRequest extends Request {
  user?: { id: number; role: string }
}

export const auth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'Unauthorized' })

  const m = header.match(/^Bearer\s+(.+)/i)
  if (!m) return res.status(401).json({ error: 'Unauthorized' })

  const token = m[1].trim()
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any
    req.user = { id: payload.id, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export default auth
