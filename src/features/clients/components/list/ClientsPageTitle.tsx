import { CLIENT_STATUS_LABELS, type ClientStatus } from '@/domain/entities/client'
import { ClientReferenceCopy } from '@/features/clients/components/ClientReferenceCopy'
import { ClientStatusBadge } from '@/features/clients/components/ClientStatusBadge'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { cn } from '@/shared/utils/cn'

interface ClientsPageTitleProps {
  /** Defaults to {@link CRM_LABELS.allAccounts}. */
  title?: string
  matchCount?: number
  status?: ClientStatus | 'all'
  hasFilters?: boolean
  isFetching?: boolean
  /** Secondary chip segment — e.g. client reference + "ID" on workspace nav. */
  secondaryValue?: string
  secondaryLabel?: string
  /** Count noun overrides — defaults to account / accounts. */
  countSingular?: string
  countPlural?: string
  /** Heading level — `h2` for nested workspace tab toolbars. */
  headingLevel?: 'h1' | 'h2'
  className?: string
}

function countNoun(
  count: number,
  hasFilters: boolean,
  status: ClientStatus | 'all',
  singular: string,
  plural: string,
) {
  if (hasFilters && status === 'all') return 'matched'
  return count === 1 ? singular : plural
}

function screenReaderLabel(
  matchCount: number,
  hasFilters: boolean,
  status: ClientStatus | 'all',
  singular: string,
  plural: string,
) {
  const noun = countNoun(matchCount, hasFilters, status, singular, plural)
  const statusPart = status !== 'all' ? `, status ${CLIENT_STATUS_LABELS[status]}` : ''
  const filterPart = hasFilters && status === 'all' ? ', filtered' : ''
  return `${matchCount} ${noun}${statusPart}${filterPart}`
}

export function ClientsPageTitle({
  title,
  matchCount,
  status = 'all',
  hasFilters = false,
  isFetching,
  secondaryValue,
  secondaryLabel,
  countSingular,
  countPlural,
  headingLevel = 'h1',
  className,
}: ClientsPageTitleProps) {
  const heading = title ?? CRM_LABELS.allAccounts
  const singular = countSingular ?? CRM_LABELS.account.toLowerCase()
  const plural = countPlural ?? CRM_LABELS.accounts.toLowerCase()
  const showCount = typeof matchCount === 'number'
  const showSecondary = Boolean(secondaryValue?.trim())
  const isFilteredView = hasFilters || status !== 'all'
  const noun = showCount ? countNoun(matchCount, hasFilters, status, singular, plural) : null
  const HeadingTag = headingLevel

  return (
    <div
      className={cn(
        'relative inline-flex h-8 max-w-full min-w-0 items-stretch overflow-hidden rounded-[var(--radius-md)]',
        'border border-[var(--color-border)]/90 bg-[var(--color-surface)]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_1px_2px_rgba(15,23,42,0.04)]',
        'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_2px_rgba(0,0,0,0.2)]',
        className,
      )}
    >
      <div
        className={cn(
          'w-[3px] shrink-0 bg-gradient-to-b',
          isFilteredView
            ? 'from-[var(--color-warning)] via-[var(--color-warning)]/80 to-[var(--color-warning)]/25'
            : 'from-[var(--color-accent)] via-[var(--color-accent)]/75 to-[var(--color-accent)]/20',
        )}
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 items-center gap-2.5 bg-gradient-to-r from-[var(--color-accent-muted)]/25 via-transparent to-transparent px-2.5 sm:px-3">
        <HeadingTag className="shrink-0 text-[13px] font-medium leading-none tracking-[-0.01em] text-[var(--color-foreground)]">
          {heading}
        </HeadingTag>

        {showCount ? (
          <>
            <span className="h-3 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />

            <div className="flex min-w-0 items-baseline gap-1 leading-none">
              <span className="font-mono text-[13px] font-medium tabular-nums tracking-tight text-[var(--color-foreground)]">
                {matchCount}
              </span>
              <span className="truncate text-[11px] font-normal tracking-wide text-[var(--color-muted)]">
                {noun}
              </span>
            </div>
          </>
        ) : showSecondary ? (
          <>
            <span className="h-3 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />
            <div className="flex min-w-0 items-baseline gap-1 leading-none">
              <ClientReferenceCopy
                reference={secondaryValue!}
                variant="inline"
                className="text-[13px] font-medium tracking-tight text-[var(--color-foreground)] hover:text-[var(--color-foreground)]/80"
              />
              {secondaryLabel?.trim() ? (
                <span className="truncate text-[11px] font-normal tracking-wide text-[var(--color-muted)]">
                  {secondaryLabel}
                </span>
              ) : null}
            </div>
          </>
        ) : isFetching ? (
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="h-3 w-8 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]" />
            <span className="h-2.5 w-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]/80" />
          </span>
        ) : null}

        {status !== 'all' ? (
          <ClientStatusBadge status={status} className="ml-0.5 h-5 shrink-0 px-1.5 text-[10px]" />
        ) : null}
      </div>

      <span className="sr-only">
        {showCount
          ? screenReaderLabel(matchCount, hasFilters, status, singular, plural)
          : showSecondary
            ? `${heading}, ${secondaryValue}${secondaryLabel?.trim() ? ` ${secondaryLabel}` : ''}`
          : isFetching
            ? `Loading ${heading.toLowerCase()}`
            : heading}
      </span>
    </div>
  )
}
