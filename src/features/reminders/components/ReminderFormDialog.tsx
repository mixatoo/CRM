import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as Dialog from '@radix-ui/react-dialog'
import type { Reminder } from '@/domain/entities/reminder'
import {
  REMINDER_CATEGORIES,
  REMINDER_CATEGORY_LABELS,
  REMINDER_PRIORITIES,
  REMINDER_PRIORITY_LABELS,
  REMINDER_STATUSES,
  REMINDER_STATUS_LABELS,
} from '@/domain/entities/reminder'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { CrmInputCell } from '@/design-system/layout/CrmPanel'
import { useReminderMutations } from '@/features/reminders/hooks/use-reminder-mutations'
import { useQuery } from '@tanstack/react-query'
import { db } from '@/infrastructure/database/db'
import { useDatabaseReady } from '@/app/providers'

interface ReminderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reminder: Reminder | null
}

type ReminderFormValues = {
  title: string
  description: string
  status: Reminder['status']
  priority: Reminder['priority']
  category: Reminder['category']
  dueAt: string
  tripId: string
  assigneeName: string
}

function toLocalInputValue(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ReminderFormDialog({ open, onOpenChange, reminder }: ReminderFormDialogProps) {
  const dbReady = useDatabaseReady()
  const { createReminder, updateReminder, isPending } = useReminderMutations()
  const { register, handleSubmit, reset, control } = useForm<ReminderFormValues>()

  const { data: trips = [] } = useQuery({
    queryKey: ['reminders', 'trip-options'],
    queryFn: () => db.trips.orderBy('updatedAt').reverse().limit(30).toArray(),
    enabled: dbReady && open,
  })

  useEffect(() => {
    if (!open) return
    reset({
      title: reminder?.title ?? '',
      description: reminder?.description ?? '',
      status: reminder?.status ?? 'open',
      priority: reminder?.priority ?? 'normal',
      category: reminder?.category ?? 'operations',
      dueAt: toLocalInputValue(reminder?.dueAt ?? new Date().toISOString()),
      tripId: reminder?.tripId ?? '',
      assigneeName: reminder?.assigneeName ?? '',
    })
  }, [open, reminder, reset])

  const onSubmit = handleSubmit((values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      status: values.status,
      priority: values.priority,
      category: values.category,
      dueAt: new Date(values.dueAt).toISOString(),
      tripId: values.tripId || undefined,
      assigneeName: values.assigneeName.trim() || undefined,
    }

    if (reminder) {
      updateReminder.mutate(
        { id: reminder.id, patch: payload },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }

    createReminder.mutate(payload, { onSuccess: () => onOpenChange(false) })
  })

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(32rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-2xl outline-none">
          <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
            {reminder ? 'Edit reminder' : 'New reminder'}
          </Dialog.Title>

          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <CrmInputCell label="Title">
              <Input {...register('title', { required: true })} />
            </CrmInputCell>
            <CrmInputCell label="Description">
              <Input {...register('description')} />
            </CrmInputCell>
            <div className="grid gap-3 sm:grid-cols-2">
              <CrmInputCell label="Due">
                <Input type="datetime-local" {...register('dueAt', { required: true })} />
              </CrmInputCell>
              <CrmInputCell label="Assignee">
                <Input {...register('assigneeName')} />
              </CrmInputCell>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <CrmInputCell label="Status">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormPicklist
                      value={field.value}
                      onChange={field.onChange}
                      options={REMINDER_STATUSES.map((value) => ({
                        value,
                        label: REMINDER_STATUS_LABELS[value],
                      }))}
                      panelTitle="Status"
                      ariaLabel="Reminder status"
                    />
                  )}
                />
              </CrmInputCell>
              <CrmInputCell label="Priority">
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <FormPicklist
                      value={field.value}
                      onChange={field.onChange}
                      options={REMINDER_PRIORITIES.map((value) => ({
                        value,
                        label: REMINDER_PRIORITY_LABELS[value],
                      }))}
                      panelTitle="Priority"
                      ariaLabel="Reminder priority"
                    />
                  )}
                />
              </CrmInputCell>
              <CrmInputCell label="Category">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormPicklist
                      value={field.value}
                      onChange={field.onChange}
                      options={REMINDER_CATEGORIES.map((value) => ({
                        value,
                        label: REMINDER_CATEGORY_LABELS[value],
                      }))}
                      panelTitle="Category"
                      ariaLabel="Reminder category"
                    />
                  )}
                />
              </CrmInputCell>
            </div>
            <CrmInputCell label="Linked trip">
              <Controller
                name="tripId"
                control={control}
                render={({ field }) => (
                  <FormPicklist
                    value={field.value}
                    onChange={field.onChange}
                    options={trips.map((trip) => ({
                      value: trip.id,
                      label: `${trip.reference} — ${trip.name}`,
                    }))}
                    placeholder="No trip"
                    emptyOption={{ value: '', label: 'No trip' }}
                    panelTitle="Linked trip"
                    ariaLabel="Linked trip"
                    searchable
                    searchPlaceholder="Search trips…"
                  />
                )}
              />
            </CrmInputCell>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isPending}>
                {isPending ? 'Saving…' : reminder ? 'Save changes' : 'Create reminder'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
