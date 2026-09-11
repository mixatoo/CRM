import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDatabaseReady } from '@/app/providers'
import { appContainer } from '@/app/container'
import type { AppSettings } from '@/domain/entities'

export function useAppSettings() {
  const dbReady = useDatabaseReady()
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const settings = await appContainer.uow.settings.findById('SET-001')
      if (!settings) throw new Error('Settings not found')
      return settings
    },
    enabled: dbReady,
  })
}

export function useSettingsMutations() {
  const queryClient = useQueryClient()
  const updateSettings = useMutation({
    mutationFn: (data: Partial<AppSettings>) => appContainer.uow.settings.update('SET-001', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })
  return { updateSettings, isPending: updateSettings.isPending }
}
