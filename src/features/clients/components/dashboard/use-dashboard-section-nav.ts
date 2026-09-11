import { useCallback, useEffect, useState } from 'react'
import type { DashboardSectionId } from '@/features/clients/components/dashboard/client-dashboard-modern-ui'

function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null

  while (current) {
    const style = window.getComputedStyle(current)
    const scrollable =
      /(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight

    if (scrollable) return current
    current = current.parentElement
  }

  return null
}

export function useDashboardSectionNav(sectionIds: DashboardSectionId[]) {
  const [activeSection, setActiveSection] = useState<DashboardSectionId>(sectionIds[0])

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(`dashboard-section-${id}`))
      .filter((node): node is HTMLElement => Boolean(node))

    if (elements.length === 0) return

    const scrollRoot = findScrollParent(elements[0])

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        const top = visible[0]?.target.id.replace('dashboard-section-', '') as DashboardSectionId | undefined
        if (top && sectionIds.includes(top)) {
          setActiveSection(top)
        }
      },
      {
        root: scrollRoot,
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0.15, 0.4, 0.65],
      },
    )

    for (const element of elements) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [sectionIds])

  const scrollToSection = useCallback((sectionId: DashboardSectionId) => {
    const element = document.getElementById(`dashboard-section-${sectionId}`)
    if (!element) return

    setActiveSection(sectionId)
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return { activeSection, scrollToSection }
}
