import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function RequireRole({
    allowed,
    children,
}: { allowed: string[]; children: ReactNode }) {
    const location = useLocation()
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }
    const role = (() => {
        try { return JSON.parse(userStr).role as string } catch { return undefined }
    })()

    if (!role || !allowed.includes(role)) {
        // manda para a tela de virar organizador (ou home)
        return <Navigate to="/organizer/apply" replace />
    }

    return <>{children}</>
}
