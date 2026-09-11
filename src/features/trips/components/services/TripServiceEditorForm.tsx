import { useEffect, useMemo, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TripService } from '@/domain/entities/trip-service'
import {
  TRIP_SERVICE_STATUSES,
} from '@/domain/entities/trip-service'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { layout, responsiveGrid } from '@/design-system/tokens/layout'
import { TripServiceCategoryFields } from '@/features/trips/components/services/TripServiceCategoryFields'
import {
  CategoryFieldGrid,
  CompositeDateField,
  CompositeNumberField,
  CompositeTextField,
  CompositeTextareaField,
  categoryFieldSectionTitle,
} from '@/features/trips/components/services/TripServiceFormFields'
import { TripServiceStatusBadge } from '@/features/trips/components/services/TripServiceStatusBadge'
import {
  TRIP_SERVICE_STATUS_ROW_ACCENT,
} from '@/features/trips/components/services/service-styles'
import { tripServiceMargin, tripServiceMarginPercent, tripServiceSelling } from '@/features/trips/components/services/trip-service-financial'
import { useSaveTripServiceEditor } from '@/features/trips/hooks/use-update-trip-service'
import {
  tripServiceEditorSchema,
  type TripServiceEditorFormValues,
} from '@/features/trips/schemas/trip-service-editor.schema'
import {
  tripServiceToEditorValues,
} from '@/features/trips/utils/trip-service-editor'
import { formatAccountingAmount } from '@/features/trips/utils/format'
import { cn } from '@/shared/utils/cn'

export interface TripServiceEditorActions {
  save: () => void
  isDirty: boolean
  isSaving: boolean
}

interface TripServiceEditorFormProps {
  tripId: string
  service: TripService
  onActionsChange?: (actions: TripServiceEditorActions) => void
}

function MarginPreview({
  cost,
  selling: sellingInput,
  currency,
  status,
}: Pick<TripServiceEditorFormValues, 'cost' | 'selling' | 'currency' | 'status'>) {
  const preview = {
    cost,
    selling: sellingInput,
  }
  const selling = tripServiceSelling(preview)
  const margin = tripServiceMargin(preview)
  const marginPercent = tripServiceMarginPercent(preview)
  const canceled = status === 'canceled'

  if (canceled) {
    return <span className="text-[var(--color-muted)]">—</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] tabular-nums">
      <span>
        Selling {formatAccountingAmount(selling)} {currency}
      </span>
      <span className="text-[var(--color-muted)]">·</span>
      <span>
        Margin {formatAccountingAmount(margin)} {currency}
      </span>
      <span className="text-[var(--color-muted)]">·</span>
      <span className={marginPercent >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
        {marginPercent >= 0 ? '+' : ''}
        {marginPercent.toFixed(1)}%
      </span>
    </div>
  )
}

export function TripServiceEditorForm({ tripId, service, onActionsChange }: TripServiceEditorFormProps) {
  const resetKey = `${service.id}:${service.updatedAt}`
  const initialValues = useMemo(
    () => tripServiceToEditorValues(service),
    [resetKey],
  )
  const { saveEditor, isPending } = useSaveTripServiceEditor(tripId, service)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<TripServiceEditorFormValues>({
    resolver: zodResolver(tripServiceEditorSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    reset(initialValues)
  }, [reset, resetKey, initialValues])

  const marginValues = watch(['cost', 'selling', 'currency', 'status'])

  const onSubmit = handleSubmit((formValues) => {
    saveEditor(formValues)
  })

  const submitRef = useRef(onSubmit)
  submitRef.current = onSubmit

  useEffect(() => {
    onActionsChange?.({
      save: () => {
        void submitRef.current()
      },
      isDirty,
      isSaving: isPending,
    })
  }, [isDirty, isPending, onActionsChange])

  return (
    <form
      className={cn('space-y-3', layout.stackTight)}
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit()
      }}
    >
      <CrmPanel title="Identity">
        <div className="space-y-3 p-3">
          <CategoryFieldGrid columns={2}>
            <CompositeTextField control={control} name="name" label="Name" />
            <CompositeTextField control={control} name="supplierName" label="Supplier" />
          </CategoryFieldGrid>

          <div className="space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">Status</span>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Service status">
                  {TRIP_SERVICE_STATUSES.map((status) => {
                    const selected = field.value === status
                    return (
                      <button
                        key={status}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border px-2 py-1 transition-colors',
                          selected
                            ? cn(TRIP_SERVICE_STATUS_ROW_ACCENT[status], 'border-transparent')
                            : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]',
                        )}
                        onClick={() => field.onChange(status)}
                      >
                        <TripServiceStatusBadge status={status} />
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>
        </div>
      </CrmPanel>

      <CrmPanel title="Schedule">
        <div className="p-3">
          <CategoryFieldGrid>
            <CompositeDateField control={control} name="startDate" label="Start" />
            <CompositeDateField control={control} name="endDate" label="End" />
          </CategoryFieldGrid>
        </div>
      </CrmPanel>

      <CrmPanel title={categoryFieldSectionTitle(service.category)}>
        <div className="p-3">
          <TripServiceCategoryFields category={service.category} control={control} />
        </div>
      </CrmPanel>

      <CrmPanel title="Financial">
        <div className="space-y-3 p-3">
          <div className={cn('grid min-w-0 gap-2', responsiveGrid.cols3)}>
            <CompositeNumberField control={control} name="cost" label="Cost" decimals={2} />
            <CompositeNumberField control={control} name="selling" label="Selling" decimals={2} />
            <CompositeTextField control={control} name="currency" label="Currency" mono />
          </div>
          <MarginPreview
            cost={marginValues[0] ?? 0}
            selling={marginValues[1]}
            currency={marginValues[2] ?? service.currency}
            status={marginValues[3] ?? service.status}
          />
        </div>
      </CrmPanel>

      <CrmPanel title="Notes">
        <div className="p-3">
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <CompositeTextareaField value={field.value} onChange={field.onChange} label="Internal notes" />
            )}
          />
        </div>
      </CrmPanel>
    </form>
  )
}
