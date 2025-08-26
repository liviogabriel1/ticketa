import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

export function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
    return <AvatarPrimitive.Root className={cn('relative inline-flex h-10 w-10 overflow-hidden rounded-full', className)} {...props} />
}

export function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
    return <AvatarPrimitive.Image className={cn('h-full w-full object-cover', className)} {...props} />
}

export function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
    return (
        <AvatarPrimitive.Fallback
            className={cn('flex h-full w-full items-center justify-center bg-muted text-muted-foreground', className)}
            {...props}
        />
    )
}