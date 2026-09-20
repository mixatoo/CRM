import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import type { Reminder } from '@/domain/entities/reminder'
import { nextReminderReference } from '@/infrastructure/database/reminder-seed'
import { useToast } from '@/design-system/components/Toast'

export function useReminderMutations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['reminders'] })
  }

  const createReminder = useMutation({
    mutationFn: async (input: Omit<Reminder, 'id' | 'reference' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString()
      const reference = await nextReminderReference()
      return appContainer.uow.reminders.create({
        ...input,
        reference,
        createdAt: now,
        updatedAt: now,
      })
    },
    onSuccess: (reminder) => {
      invalidate()
      toast({ intent: 'updated', title: 'Reminder created', description: reminder.reference })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not create reminder', description: error.message })
    },
  })

  const updateReminder = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Reminder> }) => {
      return appContainer.uow.reminders.update(id, { ...patch, updatedAt: new Date().toISOString() })
    },
    onSuccess: (reminder) => {
      invalidate()
      toast({ intent: 'updated', title: 'Reminder updated', description: reminder?.reference })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not update reminder', description: error.message })
    },
  })

  const deleteReminder = useMutation({
    mutationFn: (id: string) => appContainer.uow.reminders.delete(id),
    onSuccess: () => {
      invalidate()
      toast({ intent: 'deleted', title: 'Reminder deleted' })
    },
    onError: (error: Error) => {
      toast({ intent: 'failed', title: 'Could not delete reminder', description: error.message })
    },
  })

  return {
    createReminder,
    updateReminder,
    deleteReminder,
    isPending: createReminder.isPending || updateReminder.isPending || deleteReminder.isPending,
  }
}
