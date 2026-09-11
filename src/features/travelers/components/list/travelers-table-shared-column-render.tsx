import type { ReactNode } from 'react'
import type { Traveler } from '@/domain/entities/traveler'
import { resolvePassportStatus, resolveVisaStatus } from '@/domain/entities/traveler'
import type { TravelerSortDir } from '@/repositories/interfaces'
import type { TravelerTableSortField } from '@/features/travelers/components/list/travelers-table-column-helpers'
import {
  PassportStatusBadge,
  TravelerNationalityBadge,
  TravelerStatusBadge,
  TravelerVipBadge,
  VisaStatusBadge,
} from '@/features/travelers/components/profile/TravelerProfileBadges'
import {
  travelerAgeOrEmpty,
  travelerCategoryLabels,
  travelerGenderLabel,
  travelerPassengerTypeLabel,
  travelerPrimaryPassport,
  travelerPrimaryVisa,
  travelerRiskLevelLabel,
} from '@/features/travelers/components/list/travelers-table-column-helpers'
import {
  DataTableColumnHeader,
  dataTableAriaSort,
} from '@/design-system/components/DataTableColumnHeader'
import { clientsTableHeadCellClassName } from '@/features/clients/components/list/clients-table-header-ui'
import { tableCellClass } from '@/design-system/components/table-styles'
import { formatDate } from '@/shared/utils/date-format'
import { cn } from '@/shared/utils/cn'

const CELL_META = 'truncate text-xs'
const COMPACT_COLUMN_X = 'px-2'
const NARROW_COLUMN_X = 'px-1.5'

export type TravelerSharedDataColumnKey =
  | 'role'
  | 'status'
  | 'passengerType'
  | 'nationality'
  | 'vipLevel'
  | 'gender'
  | 'age'
  | 'passportStatus'
  | 'passportExpiry'
  | 'visaStatus'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'country'
  | 'city'
  | 'occupation'
  | 'company'
  | 'preferredLanguage'
  | 'category'
  | 'riskLevel'
  | 'updated'
  | 'created'
  | 'notes'

type SortableHeaderProps = {
  label: string
  field: TravelerTableSortField
  sortBy: TravelerTableSortField
  sortDir: TravelerSortDir
  onSort: (field: TravelerTableSortField) => void
  className?: string
}

function travelersHeadClass(extra?: string) {
  return cn(clientsTableHeadCellClassName, extra)
}

function SortableHeader({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
  className,
}: SortableHeaderProps) {
  const active = sortBy === field

  return (
    <DataTableColumnHeader
      label={label}
      align="left"
      className={travelersHeadClass(className)}
      active={active}
      sortDir={sortDir}
      onSort={() => onSort(field)}
      aria-sort={dataTableAriaSort(active, sortDir)}
    />
  )
}

type HeaderContext = {
  sortBy: TravelerTableSortField
  sortDir: TravelerSortDir
  onSort: (field: TravelerTableSortField) => void
}

export function renderTravelerSharedDataHeader(
  key: TravelerSharedDataColumnKey,
  ctx: HeaderContext,
): ReactNode {
  switch (key) {
    case 'role':
      return <SortableHeader key={key} label="Role" field="role" {...ctx} />
    case 'status':
      return <SortableHeader key={key} label="Status" field="status" {...ctx} />
    case 'passengerType':
      return <SortableHeader key={key} label="Type" field="passengerType" {...ctx} />
    case 'nationality':
      return <SortableHeader key={key} label="Nationality" field="nationality" {...ctx} />
    case 'vipLevel':
      return <SortableHeader key={key} label="VIP" field="vipLevel" {...ctx} />
    case 'gender':
      return <SortableHeader key={key} label="Gender" field="gender" {...ctx} />
    case 'age':
      return <SortableHeader key={key} label="Age" field="dateOfBirth" {...ctx} className={NARROW_COLUMN_X} />
    case 'passportStatus':
      return <SortableHeader key={key} label="Passport" field="passportStatus" {...ctx} />
    case 'passportExpiry':
      return <SortableHeader key={key} label="Passport expiry" field="passportExpiry" {...ctx} className={NARROW_COLUMN_X} />
    case 'visaStatus':
      return <SortableHeader key={key} label="Visa" field="visaStatus" {...ctx} />
    case 'email':
      return <SortableHeader key={key} label="Email" field="email" {...ctx} />
    case 'phone':
      return <SortableHeader key={key} label="Phone" field="phone" {...ctx} />
    case 'whatsapp':
      return <SortableHeader key={key} label="WhatsApp" field="whatsapp" {...ctx} />
    case 'country':
      return <SortableHeader key={key} label="Country" field="country" {...ctx} />
    case 'city':
      return <SortableHeader key={key} label="City" field="city" {...ctx} />
    case 'occupation':
      return <SortableHeader key={key} label="Occupation" field="occupation" {...ctx} />
    case 'company':
      return <SortableHeader key={key} label="Company" field="company" {...ctx} />
    case 'preferredLanguage':
      return <SortableHeader key={key} label="Language" field="preferredLanguage" {...ctx} />
    case 'category':
      return <SortableHeader key={key} label="Category" field="category" {...ctx} />
    case 'riskLevel':
      return <SortableHeader key={key} label="Risk" field="riskLevel" {...ctx} className={NARROW_COLUMN_X} />
    case 'updated':
      return <SortableHeader key={key} label="Updated" field="updatedAt" {...ctx} className={NARROW_COLUMN_X} />
    case 'created':
      return <SortableHeader key={key} label="Created" field="createdAt" {...ctx} className={NARROW_COLUMN_X} />
    case 'notes':
      return (
        <DataTableColumnHeader
          key={key}
          label="Notes"
          align="left"
          sortable={false}
          className={travelersHeadClass(COMPACT_COLUMN_X)}
        />
      )
  }
}

export function renderTravelerSharedDataCell(key: TravelerSharedDataColumnKey, traveler: Traveler): ReactNode {
  switch (key) {
    case 'role': {
      const role = traveler.jobTitle?.trim()
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: CELL_META })} title={role || undefined}>
          {role || '—'}
        </td>
      )
    }
    case 'status':
      return (
        <td key={key} className={tableCellClass('left')}>
          <TravelerStatusBadge status={traveler.status ?? 'active'} />
        </td>
      )
    case 'passengerType':
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: CELL_META })}>
          {travelerPassengerTypeLabel(traveler)}
        </td>
      )
    case 'nationality': {
      const nationality = (traveler.primaryNationality ?? traveler.nationality)?.trim()
      return (
        <td key={key} className={tableCellClass('left')}>
          {nationality ? <TravelerNationalityBadge nationality={nationality} /> : '—'}
        </td>
      )
    }
    case 'vipLevel':
      return (
        <td key={key} className={tableCellClass('left')}>
          <TravelerVipBadge level={traveler.vipLevel ?? 'standard'} />
        </td>
      )
    case 'gender': {
      const gender = travelerGenderLabel(traveler)
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: CELL_META })}>
          {gender || '—'}
        </td>
      )
    }
    case 'age': {
      const age = travelerAgeOrEmpty(traveler)
      return (
        <td key={key} className={tableCellClass('left', { numeric: true, extra: cn(NARROW_COLUMN_X, CELL_META) })}>
          {age ?? '—'}
        </td>
      )
    }
    case 'passportStatus': {
      const passport = travelerPrimaryPassport(traveler)
      return (
        <td key={key} className={tableCellClass('left')}>
          {passport ? <PassportStatusBadge status={resolvePassportStatus(passport)} /> : '—'}
        </td>
      )
    }
    case 'passportExpiry': {
      const expiry = travelerPrimaryPassport(traveler)?.expiryDate
      const label = expiry ? formatDate(expiry) : '—'
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, muted: true, extra: cn(NARROW_COLUMN_X, CELL_META) })}
          title={label}
        >
          {label}
        </td>
      )
    }
    case 'visaStatus': {
      const visa = travelerPrimaryVisa(traveler)
      return (
        <td key={key} className={tableCellClass('left')}>
          {visa ? <VisaStatusBadge status={resolveVisaStatus(visa)} /> : '—'}
        </td>
      )
    }
    case 'email': {
      const email = traveler.email?.trim()
      return (
        <td key={key} className={tableCellClass('left', { extra: 'truncate' })} title={email || undefined}>
          {email || '—'}
        </td>
      )
    }
    case 'phone': {
      const phone = traveler.phone?.trim()
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, extra: '[direction:ltr] [unicode-bidi:plaintext]' })}
          title={phone || undefined}
        >
          {phone || '—'}
        </td>
      )
    }
    case 'whatsapp': {
      const whatsapp = traveler.whatsapp?.trim()
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, extra: '[direction:ltr] [unicode-bidi:plaintext]' })}
          title={whatsapp || undefined}
        >
          {whatsapp || '—'}
        </td>
      )
    }
    case 'country': {
      const country = traveler.address?.country?.trim()
      return (
        <td key={key} className={tableCellClass('left', { extra: 'truncate' })} title={country || undefined}>
          {country || '—'}
        </td>
      )
    }
    case 'city': {
      const city = traveler.address?.city?.trim()
      return (
        <td key={key} className={tableCellClass('left', { extra: 'truncate' })} title={city || undefined}>
          {city || '—'}
        </td>
      )
    }
    case 'occupation': {
      const occupation = traveler.occupation?.trim()
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: CELL_META })} title={occupation || undefined}>
          {occupation || '—'}
        </td>
      )
    }
    case 'company': {
      const company = traveler.companyName?.trim()
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: CELL_META })} title={company || undefined}>
          {company || '—'}
        </td>
      )
    }
    case 'preferredLanguage': {
      const language = traveler.preferredLanguage?.trim()
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: CELL_META })} title={language || undefined}>
          {language || '—'}
        </td>
      )
    }
    case 'category': {
      const category = travelerCategoryLabels(traveler)
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: CELL_META })} title={category || undefined}>
          {category || '—'}
        </td>
      )
    }
    case 'riskLevel':
      return (
        <td key={key} className={tableCellClass('left', { muted: true, extra: cn(NARROW_COLUMN_X, CELL_META) })}>
          {travelerRiskLevelLabel(traveler)}
        </td>
      )
    case 'updated': {
      const label = formatDate(traveler.updatedAt)
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, muted: true, extra: cn(NARROW_COLUMN_X, CELL_META) })}
          title={label}
        >
          {label}
        </td>
      )
    }
    case 'created': {
      const label = formatDate(traveler.createdAt)
      return (
        <td
          key={key}
          className={tableCellClass('left', { numeric: true, muted: true, extra: cn(NARROW_COLUMN_X, CELL_META) })}
          title={label}
        >
          {label}
        </td>
      )
    }
    case 'notes':
      return (
        <td
          key={key}
          className={tableCellClass('left', { muted: true, extra: cn(COMPACT_COLUMN_X, CELL_META) })}
          title={traveler.notes ?? undefined}
        >
          {traveler.notes?.trim() || '—'}
        </td>
      )
  }
}

export function isTravelerSharedDataColumn(key: string): key is TravelerSharedDataColumnKey {
  return (
    key === 'role' ||
    key === 'status' ||
    key === 'passengerType' ||
    key === 'nationality' ||
    key === 'vipLevel' ||
    key === 'gender' ||
    key === 'age' ||
    key === 'passportStatus' ||
    key === 'passportExpiry' ||
    key === 'visaStatus' ||
    key === 'email' ||
    key === 'phone' ||
    key === 'whatsapp' ||
    key === 'country' ||
    key === 'city' ||
    key === 'occupation' ||
    key === 'company' ||
    key === 'preferredLanguage' ||
    key === 'category' ||
    key === 'riskLevel' ||
    key === 'updated' ||
    key === 'created' ||
    key === 'notes'
  )
}
