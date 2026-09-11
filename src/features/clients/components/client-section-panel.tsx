import type { ReactNode } from 'react'
import { CrmPanel } from '@/design-system/layout/CrmPanel'

interface ClientSectionPanelProps {
  children: ReactNode
  actions?: ReactNode
}

export function ClientSectionPanel({ children, actions }: ClientSectionPanelProps) {
  return <CrmPanel actions={actions}>{children}</CrmPanel>
}
