import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    asChild?: boolean
}

export function Label({ asChild, className, ...props }: LabelProps) {
    const Comp = asChild ? Slot : 'label'
    return <Comp className={cn('text-sm font-medium leading-none', className)} {...props} />
}