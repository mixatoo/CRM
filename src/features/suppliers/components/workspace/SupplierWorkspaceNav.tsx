import { NavLink, useParams } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { layout } from '@/design-system/tokens/layout'
import { SUPPLIER_WORKSPACE_TABS } from '@/features/suppliers/config/workspace-tabs'

export function SupplierWorkspaceNav() {
  const { supplierId } = useParams()

  return (
    <nav className="overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      <div className="flex flex-col md:flex-row md:items-center">
        <div
          className={cn(
            'flex shrink-0 items-center gap-1 border-b border-[var(--color-border)] px-2 py-2 md:border-r md:border-b-0 md:py-0 md:pr-3 md:pl-3',
            layout.scrollX,
            layout.hideScrollbar,
          )}
        >
          <NavLink
            to="/suppliers"
            className={({ isActive }) =>
              cn(
                'shrink-0 rounded-[var(--radius-sm)] px-3 py-2 text-xs transition-colors sm:py-1.5',
                isActive
                  ? 'bg-[var(--color-accent-muted)] font-medium text-[var(--color-accent)]'
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)] hover:bg-[var(--color-border)]',
              )
            }
            end
          >
            All Suppliers
          </NavLink>
        </div>

        <div className={cn('flex flex-1 gap-1 px-2 py-2 md:pl-2', layout.scrollX, layout.hideScrollbar)}>
          {SUPPLIER_WORKSPACE_TABS.map(({ id, label, icon: Icon }) => (
            <NavLink
              key={id}
              to={`/suppliers/${supplierId}/${id}`}
              end={id === 'overview'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-9 shrink-0 items-center gap-1 rounded-[var(--radius-md)] px-2.5 py-2 text-xs whitespace-nowrap transition-colors sm:py-1.5',
                  isActive
                    ? 'bg-[var(--color-accent-muted)] font-semibold text-[var(--color-accent)]'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]',
                )
              }
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
