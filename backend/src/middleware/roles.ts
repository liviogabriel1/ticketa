import type { Response, NextFunction } from 'express'
import type { AuthedRequest } from './auth.js'

export const requireRole =
  (...roles: string[]) =>
  (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }

export default requireRole
