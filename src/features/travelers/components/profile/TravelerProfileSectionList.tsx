import { Check, ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { TravelerProfileInput } from '@/features/travelers/hooks/use-traveler-mutations'
import {
  TRAVELER_PROFILE_SECTIONS,
  type TravelerProfileSectionId,
} from '@/features/travelers/components/profile/traveler-profile-sections'
import { isTravelerProfileSectionComplete } from '@/features/travelers/components/profile/traveler-profile-form'
import {
  clientProfileListHeaderClassName,
  clientProfileListItemClassName,
  clientProfileListItemIconClassName,
  clientProfileListItemLabelClassName,
  clientProfileListNavClassName,
} from '@/features/clients/components/profile/client-profile-browse-ui'
import { cn } from '@/shared/utils/cn'

interface TravelerProfileSectionListProps {
  section: TravelerProfileSectionId
  form: TravelerProfileInput
  onSectionChange: (section: TravelerProfileSectionId) => void
  className?: string
}

export function TravelerProfileSectionList({
  section,
  form,
  onSectionChange,
  className,
}: TravelerProfileSectionListProps) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    itemRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [section])

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <p className={clientProfileListHeaderClassName}>Sections</p>
      <nav aria-label="Passenger profile sections" className={clientProfileListNavClassName}>
        {TRAVELER_PROFILE_SECTIONS.map((item) => {
          const isActive = item.id === section
          const isComplete = isTravelerProfileSectionComplete(form, item.id)

          return (
            <button
              key={item.id}
              ref={(node) => {
                itemRefs.current[item.id] = node
              }}
              type="button"
              aria-current={isActive ? 'step' : undefined}
              onClick={() => onSectionChange(item.id)}
              className={clientProfileListItemClassName(isActive)}
            >
              <span className={clientProfileListItemIconClassName(isActive, isComplete)}>
                {isComplete && !isActive ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                ) : (
                  <item.icon className="h-3.5 w-3.5" aria-hidden />
                )}
              </span>
              <span className={clientProfileListItemLabelClassName(isActive)}>{item.label}</span>
              <ChevronRight
                className={cn(
                  'hidden h-3.5 w-3.5 shrink-0 text-[var(--color-subtle)] transition-opacity md:block',
                  isActive ? 'text-[var(--color-accent)] opacity-100' : 'opacity-0 group-hover:opacity-60',
                )}
                aria-hidden
              />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
