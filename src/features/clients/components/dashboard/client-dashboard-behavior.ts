import { useMemo, useState } from 'react'
import type { ClientDashboardAnalytics } from '@/features/clients/utils/client-dashboard-analytics'

export function resolveDashboardHealth(metrics: ClientDashboardAnalytics | undefined): {
  label: string
  tone: 'success' | 'warning' | 'accent'
} {
  if (!metrics) {
    return { label: 'Loading account health', tone: 'accent' }
  }

  const collection = metrics.collectionRatePercent ?? 0
  const openTrips = metrics.openTrips
  const outstanding = metrics.outstandingBalance

  if (outstanding > 0 && collection < 60) {
    return { label: 'Collections need attention', tone: 'warning' }
  }

  if (openTrips > 0 && collection >= 60) {
    return { label: 'Active pipeline', tone: 'accent' }
  }

  if (collection >= 85) {
    return { label: 'Healthy collections', tone: 'success' }
  }

  return { label: 'Account monitoring', tone: 'accent' }
}

export function useChartPointHover<T extends { key: string }>(points: T[]) {
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const activePoint = useMemo(
    () => points.find((point) => point.key === activeKey) ?? null,
    [activeKey, points],
  )

  return {
    activeKey,
    activePoint,
    setActiveKey,
    clearActive: () => setActiveKey(null),
  }
}
