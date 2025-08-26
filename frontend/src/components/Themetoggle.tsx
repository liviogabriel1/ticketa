import React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const isDark = (theme === 'dark') || (theme === 'system' && resolvedTheme === 'dark')

    return (
        <Button
            variant="outline"
            size="sm"
            className="rounded-full px-3"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    )
}