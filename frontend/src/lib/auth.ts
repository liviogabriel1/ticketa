export type User = { id: number; name: string; email: string; role: string }

export function getToken(): string | null {
    return localStorage.getItem('token')
}

export function getUser(): User | null {
    const raw = localStorage.getItem('user')
    try { return raw ? JSON.parse(raw) as User : null } catch { return null }
}

export function isLoggedIn(): boolean {
    return !!getToken()
}

export function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/' // força recarregar UI
}