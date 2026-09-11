import type { LucideIcon } from 'lucide-react'
import {
  Accessibility,
  FileBadge2,
  HeartPulse,
  IdCard,
  MapPin,
  Plane,
  Settings2,
  Shield,
  ShieldAlert,
  UserCircle,
  Users,
} from 'lucide-react'

export type TravelerProfileSectionId =
  | 'summary'
  | 'personal'
  | 'contact'
  | 'address'
  | 'emergency'
  | 'documents'
  | 'preferences'
  | 'assistance'
  | 'medical'
  | 'privacy'
  | 'classification'
  | 'settings'

export type TravelerProfileSectionMeta = {
  id: TravelerProfileSectionId
  label: string
  description: string
  icon: LucideIcon
}

export const TRAVELER_PROFILE_SECTIONS: TravelerProfileSectionMeta[] = [
  {
    id: 'summary',
    label: 'Profile summary',
    description: 'Reference, status, VIP level, and linked account',
    icon: UserCircle,
  },
  {
    id: 'personal',
    label: 'Personal information',
    description: 'Identity, nationality, and occupation',
    icon: IdCard,
  },
  {
    id: 'contact',
    label: 'Contact information',
    description: 'Phone, WhatsApp, and email',
    icon: Users,
  },
  {
    id: 'address',
    label: 'Address',
    description: 'Residential address and maps link',
    icon: MapPin,
  },
  {
    id: 'emergency',
    label: 'Emergency contact',
    description: 'Who to reach in an emergency',
    icon: ShieldAlert,
  },
  {
    id: 'documents',
    label: 'Identity documents',
    description: 'Passports, visas, and other IDs',
    icon: FileBadge2,
  },
  {
    id: 'preferences',
    label: 'Travel preferences',
    description: 'Airline, hotel, seat, and meal preferences',
    icon: Plane,
  },
  {
    id: 'assistance',
    label: 'Assistance & accessibility',
    description: 'Wheelchair, meet & assist, and lounge',
    icon: Accessibility,
  },
  {
    id: 'medical',
    label: 'Medical & safety',
    description: 'Allergies, diet, and health notes',
    icon: HeartPulse,
  },
  {
    id: 'privacy',
    label: 'Privacy & consent',
    description: 'Data storage and marketing consent',
    icon: Shield,
  },
  {
    id: 'classification',
    label: 'Internal classification',
    description: 'VIP category, risk, and watchlist',
    icon: ShieldAlert,
  },
  {
    id: 'settings',
    label: 'Profile settings',
    description: 'Active status, archive, and review dates',
    icon: Settings2,
  },
]

export const TRAVELER_PROFILE_SECTION_ORDER = TRAVELER_PROFILE_SECTIONS.map((section) => section.id)
