import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'ground',
        'surface',
        'sunken',
        'ink',
        'muted',
        'line',
        'line-strong',
        'action',
        'action-ink',
        'action-soft',
        'action-text',
        'ok',
        'ok-soft',
        'warn',
        'warn-soft',
        'danger',
        'danger-soft',
        'neutral-soft',
      ],
      text: ['label'],
      radius: ['control', 'panel', 'card'],
      animate: ['skeleton', 'spin-1s', 'toast-in', 'pop-in'],
      ease: ['ui', 'enter'],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
