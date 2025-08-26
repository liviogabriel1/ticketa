import * as React from 'react'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'

export const toast = sonnerToast

export function Toaster() {
    return <SonnerToaster richColors position="top-right" closeButton />
}