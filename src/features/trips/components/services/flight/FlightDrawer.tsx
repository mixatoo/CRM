import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'

interface FlightDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'md' | 'lg' | 'xl'
  /** Child manages its own scroll regions (e.g. fixed sidebar + scrolling main pane). */
  embedBody?: boolean
}

const WIDTH_CLASS = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function FlightDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = 'lg',
  embedBody = false,
}: FlightDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 right-0 z-[501] flex w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl',
            WIDTH_CLASS[width],
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className={cn('mt-0.5', layout.caption)}>{description}</Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close asChild>
              <CloseButton className="shrink-0" />
            </Dialog.Close>
          </div>

          <div
            className={cn(
              'min-h-0 flex-1',
              embedBody ? 'flex flex-col overflow-hidden' : 'overflow-y-auto px-4 py-4',
            )}
          >
            {children}
          </div>

          {footer ? (
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface FlightModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'md' | 'lg'
}

export function FlightModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}: FlightModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[601] flex max-h-[90vh] w-full -translate-x-1/2 -translate-y-1/2 flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl',
            size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold">{title}</Dialog.Title>
              {description ? <Dialog.Description className={cn('mt-0.5', layout.caption)}>{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
          {footer ? (
            <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">{footer}</div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
