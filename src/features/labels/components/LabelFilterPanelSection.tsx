import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { SearchField } from '@/design-system/components/SearchField'
import type { LabelTargetType } from '@/domain/entities/label'
import { resolveLabelColorVisual } from '@/domain/entities/label'
import { useLabelsForTarget } from '@/features/labels/hooks/use-labels'
import { cn } from '@/shared/utils/cn'

const STICKY_BAR_CLASS =
  'bg-[var(--color-surface)]/95 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--color-surface)]/90'

interface LabelFilterPanelSectionProps {
  value: string[]
  onChange: (value: string[]) => void
  targetType: LabelTargetType
  searchPlaceholder?: string
  searchAriaLabel?: string
}

export function LabelFilterPanelSection({
  value,
  onChange,
  targetType,
  searchPlaceholder = 'Search labels…',
  searchAriaLabel = 'Filter labels by name',
}: LabelFilterPanelSectionProps) {
  const [query, setQuery] = useState('')
  const { data: labels = [] } = useLabelsForTarget(targetType)
  const selectedSet = useMemo(() => new Set(value), [value])

  const filteredLabels = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return labels
    return labels.filter((label) => label.name.toLowerCase().includes(q))
  }, [labels, query])

  const toggle = (labelId: string) => {
    onChange(
      value.includes(labelId) ? value.filter((id) => id !== labelId) : [...value, labelId],
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 pb-2">
        <SearchField
          value={query}
          onValueChange={setQuery}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          density="compact"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div
          className={cn(
            'shrink-0 border-b border-[var(--color-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-subtle)]',
            STICKY_BAR_CLASS,
          )}
        >
          Labels
        </div>

        <button
          type="button"
          onClick={() => onChange([])}
          className={cn(
            'flex w-full items-center gap-2 border-b border-[var(--color-border)] px-2.5 py-1.5 text-left transition-colors',
            value.length === 0
              ? 'bg-[var(--color-accent-muted)]/35'
              : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]',
          )}
        >
          <span
            className={cn(
              'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
              value.length === 0
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
            )}
            aria-hidden
          >
            {value.length === 0 && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          </span>
          <span className="truncate text-xs font-medium text-[var(--color-foreground)]">All labels</span>
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {labels.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] font-normal text-[var(--color-muted)]">
              No active labels available. Create labels in Settings.
            </p>
          ) : filteredLabels.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] font-normal text-[var(--color-muted)]">
              No labels match your search
            </p>
          ) : (
            filteredLabels.map((label) => {
              const isSelected = selectedSet.has(label.id)
              const visual = resolveLabelColorVisual(label.color)
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggle(label.id)}
                  className={cn(
                    'flex w-full items-center gap-2 border-t border-[var(--color-border)] px-2.5 py-1.5 text-left transition-colors first:border-t-0',
                    isSelected
                      ? 'bg-[var(--color-accent-muted)]/35'
                      : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
                      isSelected
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                        : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
                    )}
                    aria-hidden
                  >
                    {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', visual.swatch)} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-xs font-normal text-[var(--color-foreground)]">
                    {label.name}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
