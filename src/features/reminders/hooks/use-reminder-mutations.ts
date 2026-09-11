import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appContainer } from '@/app/container'
import type { Reminder } from '@/domain/entities/reminder'
import { nextReminderReference } from '@/infrastructure/database/reminder-seed'

export function useReminderMutations() {
  const queryClient = useQueryClient()

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
    onSuccess: invalidate,
  })

  const updateReminder = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Reminder> }) => {
      return appContainer.uow.reminders.update(id, { ...patch, updatedAt: new Date().toISOString() })
    },
    onSuccess: invalidate,
  })

  const deleteReminder = useMutation({
    mutationFn: (id: string) => appContainer.uow.reminders.delete(id),
    onSuccess: invalidate,
  })

  return {
    createReminder,
    updateReminder,
    deleteReminder,
    isPending: createReminder.isPending || updateReminder.isPending || deleteReminder.isPending,
  }
}
