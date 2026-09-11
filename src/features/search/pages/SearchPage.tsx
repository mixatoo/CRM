import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { Building2, ExternalLink, Inbox, MapPin, Search, User, Bell, Users } from 'lucide-react'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { SearchField } from '@/design-system/components/SearchField'
import { Skeleton } from '@/design-system/components/Skeleton'
import { useGlobalSearch, type SearchResultKind } from '@/features/search/hooks/use-global-search'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { cn } from '@/shared/utils/cn'

const KIND_META: Record<SearchResultKind, { label: string; icon: typeof MapPin }> = {
  trip: { label: 'Trips', icon: MapPin },
  client: { label: 'Clients', icon: User },
  supplier: { label: 'Suppliers', icon: Building2 },
  reminder: { label: 'Reminders', icon: Bell },
  traveler: { label: 'Travelers', icon: Users },
}

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [input, setInput] = useState(params.get('q') ?? '')
  const query = useDebouncedValue(input, 300)

  useEffect(() => {
    const next = query.trim()
    if (next) setParams({ q: next }, { replace: true })
    else setParams({}, { replace: true })
  }, [query, setParams])

  const { data, isLoading, isFetching } = useGlobalSearch(query)
  const results = data?.results ?? []
  const grouped = useMemo(() => {
    const map = new Map<SearchResultKind, typeof results>()
    for (const result of results) {
      const bucket = map.get(result.kind) ?? []
      bucket.push(result)
      map.set(result.kind, bucket)
    }
    return [...map.entries()]
  }, [results])

  return (
    <Page className="min-w-0 max-w-3xl">
      <PageHeader title="Search" description="Find trips, clients, suppliers, travelers, and reminders in one place." />
      <SearchField
        value={input}
        onValueChange={setInput}
        placeholder="Search by name, reference, email, destination…"
        density="global"
        collapsible={false}
      />
      <p className="mt-2 text-[10px] text-[var(--color-muted)]">Tip: press Ctrl+K from anywhere to focus search.</p>

      <div className="mt-6">
        {!query.trim() ? (
          <EmptyState icon={Search} message="Start typing to search across your workspace." />
        ) : isLoading || isFetching ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState icon={Inbox} message={`No results for "${query.trim()}".`} />
        ) : (
          <div className="space-y-5">
            {grouped.map(([kind, items]) => {
              const meta = KIND_META[kind]
              const Icon = meta.icon
              return (
                <section key={kind}>
                  <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                    <span className="rounded-full bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-[10px]">{items.length}</span>
                  </h2>
                  <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                    {items.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={item.href}
                          className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-muted)]/40"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            <p className="truncate text-xs text-[var(--color-muted)]">{item.subtitle}</p>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </Page>
  )
}

function EmptyState({ icon: Icon, message }: { icon: typeof Search; message: string }) {
  return (
    <div className={cn('rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] px-6 py-12 text-center')}>
      <Icon className="mx-auto mb-3 h-8 w-8 text-[var(--color-muted)]" />
      <p className="text-sm text-[var(--color-muted)]">{message}</p>
    </div>
  )
}
