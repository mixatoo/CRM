import { Button } from '@/design-system/components/Button'
import { useToast, type ToastIntent } from '@/design-system/components/Toast'
import { cn } from '@/shared/utils/cn'

const INTENT_BUTTONS: Array<{
  intent: ToastIntent
  label: string
  title: string
  description?: string
  cta?: { label: string }
}> = [
  {
    intent: 'updated',
    label: 'Updated',
    title: 'Client updated',
    description: 'CL-2048 · Nile Horizon Travel',
  },
  {
    intent: 'cloned',
    label: 'Cloned',
    title: '2 trips cloned',
    description: '#504567, #504568',
  },
  {
    intent: 'deleted',
    label: 'Deleted',
    title: '3 trips deleted',
    description: 'Removed from this workspace',
  },
  {
    intent: 'deleted',
    label: 'Deleted + Undo',
    title: 'Service fee removed',
    cta: { label: 'Undo' },
  },
  {
    intent: 'failed',
    label: 'Failed',
    title: 'Could not save flight ticket',
    description: 'Passenger passport number is required.',
  },
  {
    intent: 'info',
    label: 'Info',
    title: 'Export started',
    description: 'You will get a download link when the file is ready.',
  },
]

export function ToastPlayground({ compact = false }: { compact?: boolean }) {
  const { toast } = useToast()

  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      <div
        className={cn(
          'rounded-[var(--radius-md)] border border-[var(--color-accent)]/20 bg-[var(--color-accent-muted)]/50 px-3 py-2.5',
          compact && 'py-2',
        )}
      >
        <p className="text-xs leading-relaxed text-[var(--color-foreground)]">
          <span className="font-semibold">Ops Signal:</span> Dark stacked cards slide in from the bottom-right.
          Up to 4 visible. Hover to pause the countdown ring, swipe right or tap × to dismiss.
        </p>
      </div>

      <div className={cn('grid gap-3 sm:grid-cols-2', compact && 'sm:grid-cols-3')}>
        {INTENT_BUTTONS.map((item) => (
          <button
            key={`${item.intent}-${item.label}`}
            type="button"
            onClick={() =>
              toast({
                intent: item.intent,
                title: item.title,
                description: item.description,
                cta: item.cta ? { label: item.cta.label, onClick: () => {} } : undefined,
              })
            }
            className={cn(
              'group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition-colors',
              'hover:border-[var(--color-accent)]/35 hover:bg-[var(--color-surface-elevated)]',
            )}
          >
            <span className="block text-xs font-semibold text-[var(--color-foreground)]">{item.label}</span>
            <span className="mt-1 block text-[11px] leading-snug text-[var(--color-muted)]">{item.title}</span>
            {item.description ? (
              <span className="mt-0.5 block truncate text-[10px] text-[var(--color-subtle)]">{item.description}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-3">
        <span className="text-[11px] font-medium text-[var(--color-muted)]">Quick fire:</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            toast({ intent: 'updated', title: 'Saving…' })
            setTimeout(() => toast({ intent: 'updated', title: 'Trip updated', description: '#504567' }), 600)
            setTimeout(
              () =>
                toast({
                  intent: 'failed',
                  title: 'Sync failed',
                  description: 'Network timeout — try again.',
                }),
              1200,
            )
          }}
        >
          Sequence (stack)
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            toast({ intent: 'updated', title: 'Client updated' })
            toast({ intent: 'updated', title: 'Client updated' })
          }}
        >
          Duplicate (debounced)
        </Button>
      </div>
    </div>
  )
}
