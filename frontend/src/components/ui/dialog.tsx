import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

// ❗️Portal não recebe className — não tente estilizar aqui
export function DialogPortal(props: DialogPrimitive.DialogPortalProps) {
    return <DialogPrimitive.Portal {...props} />
}

export function DialogOverlay(props: DialogPrimitive.DialogOverlayProps) {
    const { className, ...rest } = props
    return (
        <DialogPrimitive.Overlay
            className={cn(
                'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm',
                'data-[state=open]:animate-in data-[state=open]:fade-in-0',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                className
            )}
            {...rest}
        />
    )
}

export function DialogContent(props: DialogPrimitive.DialogContentProps) {
    const { className, ...rest } = props
    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
                    'rounded-2xl border bg-background p-6 shadow-lg',
                    'data-[state=open]:animate-in data-[state=open]:zoom-in-95',
                    'data-[state=closed]:animate-out',
                    className
                )}
                {...rest}
            />
        </DialogPortal>
    )
}

export function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
    const { className, ...rest } = props
    return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...rest} />
}

export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
    const { className, ...rest } = props
    return <h2 className={cn('text-lg font-semibold', className)} {...rest} />
}

export function DialogDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
    const { className, ...rest } = props
    return <p className={cn('text-sm text-muted-foreground', className)} {...rest} />
}