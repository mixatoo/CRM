import type { LucideIcon } from 'lucide-react'
import { Award, BarChart3, Building2, LayoutDashboard, MapPin, Receipt, StickyNote, Timer, UserCircle, Wallet } from 'lucide-react'

const SECTION_ICON_BY_TITLE: Record<string, LucideIcon> = {
  'Workspace pulse': LayoutDashboard,
  'Financial performance': Wallet,
  'Trip outcomes': LayoutDashboard,
  'Invoices & bookings': Receipt,
  'Work over time': BarChart3,
  'Client summary': UserCircle,
  'Client profile': UserCircle,
  'Personal profile': UserCircle,
  'Company profile': Building2,
  'Account Information': UserCircle,
  Contact: MapPin,
  Communication: MapPin,
  'Payment information': Wallet,
  'Commercial information': Building2,
  'Internal notes': StickyNote,
  Commercial: Wallet,
  Membership: Award,
  SLA: Timer,
}

export function resolveSectionIcon(title: string): LucideIcon | undefined {
  return SECTION_ICON_BY_TITLE[title]
}
