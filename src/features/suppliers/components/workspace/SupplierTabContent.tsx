import type { Supplier } from '@/domain/entities/supplier'
import type { SupplierWorkspaceTab } from '@/features/suppliers/config/workspace-tabs'
import { SupplierOverviewTab } from '@/features/suppliers/components/tabs/SupplierOverviewTab'
import { SupplierProfileTab } from '@/features/suppliers/components/tabs/SupplierProfileTab'
import { SupplierServicesTab } from '@/features/suppliers/components/tabs/SupplierServicesTab'
import { SupplierNotesTab } from '@/features/suppliers/components/tabs/SupplierNotesTab'

interface SupplierTabContentProps {
  tab: SupplierWorkspaceTab
  supplier: Supplier
}

export function SupplierTabContent({ tab, supplier }: SupplierTabContentProps) {
  if (tab === 'overview') return <SupplierOverviewTab supplier={supplier} />
  if (tab === 'profile') return <SupplierProfileTab supplier={supplier} />
  if (tab === 'services') return <SupplierServicesTab supplier={supplier} />
  if (tab === 'notes') return <SupplierNotesTab supplier={supplier} />
  return null
}
