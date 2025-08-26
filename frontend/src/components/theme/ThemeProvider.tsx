import { ThemeProvider as NextThemes } from 'next-themes'
import type { ReactNode } from 'react'

export default function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <NextThemes
            attribute="class"          // aplica/remove .dark no <html>
            defaultTheme="system"
            enableSystem
            storageKey="ticketa-theme"
            disableTransitionOnChange
        >
            {children}
        </NextThemes>
    )
}