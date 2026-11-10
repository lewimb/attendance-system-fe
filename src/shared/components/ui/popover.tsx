import type { ComponentProps } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/shared/lib/utils'

function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />
}

function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 6,
  collisionPadding = 16,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          'glass-strong z-50 rounded-card p-3 text-ink outline-none',
          'origin-(--radix-popover-content-transform-origin) data-[state=open]:animate-pop-in',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
