import type { ClientCreditCard } from '@/domain/entities/client-credit-card'
import {
  formatClientCreditCardExpiry,
  formatClientCreditCardMask,
  getClientCreditCardBrandLabel,
  getClientCreditCardExpiryStatus,
} from '@/domain/entities/client-credit-card'
import { clientCreditCardBrandTone } from '@/features/clients/components/credit-cards/client-credit-card-ui'
import { CreditCardRowActions } from '@/features/clients/components/credit-cards/CreditCardRowActions'
import { DataTableColumnHeader } from '@/design-system/components/DataTableColumnHeader'
import { Skeleton } from '@/design-system/components/Skeleton'
import {
  crmEmbeddedTableCellMetaClassName,
  crmEmbeddedTableClassName,
} from '@/features/clients/components/list/crm-embedded-table-ui'
import { clientsTableHeadCellClassName } from '@/features/clients/components/list/clients-table-header-ui'
import {
  crmInteractiveTableRowClass,
  crmTableActionsCellClass,
  tableCellClass,
} from '@/design-system/components/table-styles'
import { cn } from '@/shared/utils/cn'
import { CreditCard } from 'lucide-react'

const COLUMN_COUNT = 6

interface ClientCreditCardsTableProps {
  cards: ClientCreditCard[]
  disabled?: boolean
  busy?: boolean
  isLoading?: boolean
  onSetActive: (cardId: string) => void
  onDelete?: (cardId: string) => void
}

function ClientCreditCardsTableSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[var(--color-border)]/45">
          {Array.from({ length: COLUMN_COUNT }).map((__, colIndex) => (
            <td key={colIndex} className={tableCellClass('left')}>
              <Skeleton className="h-3.5 w-full max-w-[6rem]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function CardNameCell({ name, last4 }: { name?: string | null; last4: string }) {
  const label = name?.trim() || `Card ending ${last4}`

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-muted)]/45 text-[var(--color-accent)]"
        aria-hidden
      >
        <CreditCard className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span className="min-w-0 truncate text-xs font-medium leading-none">{label}</span>
    </span>
  )
}

const CREDIT_CARD_HEADERS = [
  { key: 'name', label: 'Card name', align: 'left' as const },
  { key: 'number', label: 'Card number', align: 'left' as const },
  { key: 'expiry', label: 'Expiry', align: 'left' as const },
  { key: 'type', label: 'Card type', align: 'left' as const },
  { key: 'status', label: 'Status', align: 'left' as const },
  { key: 'actions', label: 'Actions', align: 'center' as const },
]

export function ClientCreditCardsTable({
  cards,
  disabled,
  busy,
  isLoading,
  onSetActive,
  onDelete,
}: ClientCreditCardsTableProps) {
  return (
    <div className="overflow-x-auto bg-[var(--color-surface)]">
      <table className={crmEmbeddedTableClassName}>
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[24%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
        </colgroup>
        <thead>
          <tr>
            {CREDIT_CARD_HEADERS.map((header) => (
              <DataTableColumnHeader
                key={header.key}
                label={header.label}
                align={header.align}
                sortable={false}
                className={clientsTableHeadCellClassName}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <ClientCreditCardsTableSkeleton />
          ) : cards.length === 0 ? null : (
            cards.map((card) => {
              const brandLabel = getClientCreditCardBrandLabel(card.brand)
              const expiry = formatClientCreditCardExpiry(card)
              const expiryStatus = getClientCreditCardExpiryStatus(card)

              const expiryTone =
                expiryStatus === 'expired'
                  ? 'text-[var(--color-danger)]'
                  : expiryStatus === 'expiring'
                    ? 'text-[var(--color-warning)]'
                    : undefined

              return (
                <tr
                  key={card.id}
                  data-interactive="true"
                  data-selected={card.isActive ? 'true' : undefined}
                  className={crmInteractiveTableRowClass({ selected: card.isActive })}
                >
                  <td className={tableCellClass('left')}>
                    <CardNameCell name={card.cardName} last4={card.last4} />
                  </td>
                  <td
                    className={tableCellClass('left', {
                      numeric: true,
                      extra: cn(crmEmbeddedTableCellMetaClassName, 'font-mono tracking-[0.12em] [direction:ltr] [unicode-bidi:plaintext]'),
                    })}
                  >
                    {formatClientCreditCardMask(card)}
                  </td>
                  <td
                    className={tableCellClass('left', {
                      numeric: true,
                      extra: cn(crmEmbeddedTableCellMetaClassName, 'font-mono', expiryTone),
                    })}
                  >
                    {expiry}
                  </td>
                  <td className={tableCellClass('left', { extra: crmEmbeddedTableCellMetaClassName })}>
                    <span className={cn('font-semibold', clientCreditCardBrandTone(card.brand))}>
                      {brandLabel}
                    </span>
                  </td>
                  <td className={tableCellClass('left', { extra: crmEmbeddedTableCellMetaClassName })}>
                    {card.isActive ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                        Primary
                      </span>
                    ) : (
                      <span className="text-[var(--color-muted)]">—</span>
                    )}
                  </td>
                  <td
                    className={crmTableActionsCellClass('!text-center')}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <div className="flex justify-center">
                      <CreditCardRowActions
                        card={card}
                        onSetActive={disabled ? undefined : onSetActive}
                        onDelete={disabled ? undefined : onDelete}
                        busy={busy}
                      />
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
