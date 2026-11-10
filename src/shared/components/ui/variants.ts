import { cva, type VariantProps } from 'class-variance-authority'

export const controlVariants = cva(
  [
    'flex w-full min-w-0 items-center text-base text-ink outline-none',
    'transition-[border-color,box-shadow,background-color] duration-150 ease-ui',
    'placeholder:text-muted focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:text-muted',
  ],
  {
    variants: {
      variant: {
        default: [
          'rounded-control border border-line-strong bg-(--field-bg)',
          'focus-visible:border-action focus-visible:ring-3 focus-visible:ring-action-soft',
          'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger-soft',
          'disabled:bg-sunken',
        ],
        line: [
          'rounded-none border-0 border-b border-line-strong bg-transparent',
          'focus-visible:border-action focus-visible:shadow-(--underline-action)',
          'aria-invalid:border-danger aria-invalid:focus-visible:shadow-(--underline-danger)',
        ],
      },
      size: {
        default: 'h-11 pointer-fine:h-10',
        sm: 'h-9 text-sm',
      },
    },
    compoundVariants: [
      { variant: 'default', size: 'default', className: 'px-3.5' },
      { variant: 'default', size: 'sm', className: 'px-3' },
      { variant: 'line', className: 'px-0' },
    ],
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type ControlVariantProps = VariantProps<typeof controlVariants>
