import { useMemo } from 'react'
import { useClients } from '@/features/clients/hooks/use-clients'
import type { ClientPanelFilters } from '@/repositories/interfaces'

export interface ClientFilterOptionItem {
  value: string
  count: number
}

function facetMap(clients: Array<{ country?: string; city?: string; company?: string }>, field: 'country' | 'city' | 'company') {
  const map = new Map<string, number>()
  for (const client of clients) {
    const raw = client[field]?.trim()
    if (!raw) continue
    map.set(raw, (map.get(raw) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

export function countActiveClientPanelFilters(filters: ClientPanelFilters) {
  let count = 0
  if (filters.status !== 'all') count += 1
  if (filters.type !== 'all') count += 1
  if (filters.country !== 'all') count += 1
  if (filters.city !== 'all') count += 1
  if (filters.company !== 'all') count += 1
  if ((filters.labelIds?.length ?? 0) > 0) count += 1
  return count
}

export function useClientFilterOptions() {
  const { data: clients = [] } = useClients()

  return useMemo(() => {
    return {
      totalClients: clients.length,
      countries: facetMap(clients, 'country'),
      cities: facetMap(clients, 'city'),
      companies: facetMap(clients, 'company'),
    }
  }, [clients])
}
