import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Calendar, Check, ChevronDown, LayoutGrid, Plus } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS, type ServiceCategory } from '@/domain/entities'
import {
  TRIP_SERVICE_STATUSES,
  TRIP_SERVICE_STATUS_LABELS,
  type TripServiceStatus,
} from '@/domain/entities/trip-service'
import { Button } from '@/design-system/components/Button'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { EmbeddedFormDatePicker } from '@/design-system/components/DatePickerField'
import {
  compositeFieldClassName,
  formFieldPrefixClassName,
  formInputClassName,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'
import { TripServiceStatusBadge } from '@/features/trips/components/services/TripServiceStatusBadge'
import {
  TRIP_SERVICE_CATEGORY_ICON,
  TRIP_SERVICE_CATEGORY_SHELL,
  TRIP_SERVICE_CATEGORY_VISUAL,
  TRIP_SERVICE_STATUS_ROW_ACCENT,
  TRIP_SERVICE_STATUS_VISUAL,
} from '@/features/trips/components/services/service-styles'
import type { CreateTripServiceInput } from '@/features/trips/utils/create-trip-service'
import { formatDate, formatDateParts } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

interface TripServicesAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStartDate: string
  isPending?: boolean
  onCreate: (input: CreateTripServiceInput) => void
}

const MENU_ITEM_CLASS =
  'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-xs transition-colors'

function OptionRadio({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
          : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]',
      )}
      aria-hidden
    >
      {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
    </span>
  )
}

export function TripServicesAddDialog({
  open,
  onOpenChange,
  defaultStartDate,
  isPending,
  onCreate,
}: TripServicesAddDialogProps) {
  const [category, setCategory] = useState<ServiceCategory>('activity')
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [status, setStatus] = useState<TripServiceStatus>('proposal')
  const [categoryOpen, setCategoryOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setCategory('activity')
    setStartDate(defaultStartDate)
    setStatus('proposal')
    setCategoryOpen(false)
  }, [defaultStartDate, open])

  const canSubmit = startDate.length > 0
  const previewName = useMemo(() => `New ${SERVICE_CATEGORY_LABELS[category]}`, [category])
  const previewDate = useMemo(() => formatDate(startDate), [startDate])
  const previewWeekday = useMemo(() => {
    const { weekday, valid } = formatDateParts(startDate)
    return valid ? weekday : null
  }, [startDate])
  const CategoryIcon = TRIP_SERVICE_CATEGORY_ICON[category]

  const handleSubmit = () => {
    if (!canSubmit) return
    onCreate({ category, startDate, status })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[601] w-[min(44rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 sm:w-[min(44rem,calc(100vw-2rem))]',
            'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none',
          )}
        >
          <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">Add service</Dialog.Title>
              <Dialog.Description className="sr-only">
                Choose service type, schedule date, and initial status for a new trip service line.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton className="shrink-0" />
            </Dialog.Close>
          </header>

          <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_13.5rem] sm:items-stretch">
            <CrmPanel title="Configuration" className="min-h-0">
              <div className="grid gap-3 p-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                    Service type
                  </span>
                  <DropdownMenu.Root open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-9 w-full justify-between gap-2 px-2.5 font-normal"
                        aria-label={`Service type. ${SERVICE_CATEGORY_LABELS[category]}`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border',
                              TRIP_SERVICE_CATEGORY_SHELL[category],
                            )}
                          >
                            <CategoryIcon className={cn('h-3.5 w-3.5', TRIP_SERVICE_CATEGORY_VISUAL[category])} aria-hidden />
                          </span>
                          <span className="truncate">{SERVICE_CATEGORY_LABELS[category]}</span>
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--color-subtle)]" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="z-[620] w-[var(--radix-dropdown-menu-trigger-width)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg"
                        align="start"
                        sideOffset={4}
                      >
                        <div className="max-h-[min(16rem,40vh)] overflow-y-auto p-0.5" role="radiogroup" aria-label="Service type">
                          {SERVICE_CATEGORIES.map((option) => {
                            const selected = category === option
                            const Icon = TRIP_SERVICE_CATEGORY_ICON[option]
                            return (
                              <button
                                key={option}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                className={cn(
                                  MENU_ITEM_CLASS,
                                  selected
                                    ? 'bg-[var(--color-accent-muted)]/40 font-medium text-[var(--color-foreground)]'
                                    : 'font-normal text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]',
                                )}
                                onClick={() => {
                                  setCategory(option)
                                  setCategoryOpen(false)
                                }}
                              >
                                <OptionRadio selected={selected} />
                                <span
                                  className={cn(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border',
                                    TRIP_SERVICE_CATEGORY_SHELL[option],
                                  )}
                                >
                                  <Icon className={cn('h-3 w-3', TRIP_SERVICE_CATEGORY_VISUAL[option])} aria-hidden />
                                </span>
                                <span className="min-w-0 flex-1 truncate">{SERVICE_CATEGORY_LABELS[option]}</span>
                              </button>
                            )
                          })}
                        </div>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                    Schedule date
                  </span>
                  <div className={compositeFieldClassName}>
                    <span className={formFieldPrefixClassName}>
                      <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <EmbeddedFormDatePicker
                        value={startDate}
                        onChange={setStartDate}
                        aria-label="Service date"
                        inputClassName={cn(formInputClassName, 'pr-7 pl-2 tabular-nums')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                    Initial status
                  </span>
                  <div className="flex gap-1.5" role="radiogroup" aria-label="Service status">
                    {TRIP_SERVICE_STATUSES.map((option) => {
                      const visual = TRIP_SERVICE_STATUS_VISUAL[option]
                      const selected = status === option
                      return (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setStatus(option)}
                          className={cn(
                            'flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border px-2 py-2 text-center text-xs transition-colors',
                            selected
                              ? cn('ring-1 ring-inset ring-[var(--color-accent)]/20', visual.shell, visual.text)
                              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]',
                          )}
                        >
                          <span className={cn('size-1.5 shrink-0 rounded-full', visual.dot)} aria-hidden />
                          <span className="truncate font-normal">{TRIP_SERVICE_STATUS_LABELS[option]}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CrmPanel>

            <CrmPanel title="List preview" className="flex min-h-0 flex-col">
              <div
                className={cn(
                  'flex min-h-[7.5rem] flex-1 flex-col justify-center gap-3 border-l-[3px] px-3 py-3',
                  TRIP_SERVICE_STATUS_ROW_ACCENT[status],
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border',
                    TRIP_SERVICE_CATEGORY_SHELL[category],
                  )}
                  aria-hidden
                >
                  <CategoryIcon className={cn('h-4 w-4', TRIP_SERVICE_CATEGORY_VISUAL[category])} />
                </span>
                <div className="min-w-0 space-y-2">
                  <p className="truncate text-sm font-semibold leading-snug text-[var(--color-foreground)]">{previewName}</p>
                  <p className="flex min-w-0 items-center gap-1 text-[11px] text-[var(--color-muted)]">
                    <LayoutGrid className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="truncate">{SERVICE_CATEGORY_LABELS[category]}</span>
                  </p>
                  <TripServiceStatusBadge status={status} className="w-full max-w-none" />
                  <time dateTime={startDate} className="block truncate text-[11px] tabular-nums text-[var(--color-foreground)]">
                    {previewDate}
                    {previewWeekday ? (
                      <span className="font-normal text-[var(--color-muted)]">{` · ${previewWeekday}`}</span>
                    ) : null}
                  </time>
                </div>
              </div>
            </CrmPanel>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-4 py-3">
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm" className="min-w-[5.5rem] font-normal" disabled={isPending}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="primary"
              size="sm"
              className="min-w-[5.5rem] gap-1.5"
              loading={isPending}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {isPending ? 'Adding…' : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Add service
                </>
              )}
            </Button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
