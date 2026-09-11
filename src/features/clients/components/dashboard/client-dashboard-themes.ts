export interface DashboardSectionTheme {
  borderAccent: string
  iconWrap: string
  headerDivider: string
}

const SECTION_THEME_BY_TITLE: Record<string, DashboardSectionTheme> = {
  'Workspace pulse': {
    borderAccent: 'border-l-[var(--color-accent)]',
    iconWrap: 'text-[var(--color-accent)]',
    headerDivider: 'border-[var(--color-accent)]/25',
  },
  'Financial performance': {
    borderAccent: 'border-l-amber-500',
    iconWrap: 'text-amber-700 dark:text-amber-400',
    headerDivider: 'border-amber-500/25',
  },
  'Trip outcomes': {
    borderAccent: 'border-l-[var(--color-accent)]',
    iconWrap: 'text-[var(--color-accent)]',
    headerDivider: 'border-[var(--color-accent)]/25',
  },
  'Invoices & bookings': {
    borderAccent: 'border-l-violet-500',
    iconWrap: 'text-violet-700 dark:text-violet-400',
    headerDivider: 'border-violet-500/25',
  },
  'Work over time': {
    borderAccent: 'border-l-cyan-600',
    iconWrap: 'text-cyan-700 dark:text-cyan-400',
    headerDivider: 'border-cyan-600/25',
  },
  'Client summary': {
    borderAccent: 'border-l-[var(--color-accent)]',
    iconWrap: 'text-[var(--color-accent)]',
    headerDivider: 'border-[var(--color-accent)]/25',
  },
  'Client profile': {
    borderAccent: 'border-l-sky-500',
    iconWrap: 'text-sky-600 dark:text-sky-400',
    headerDivider: 'border-sky-500/25',
  },
  'Personal profile': {
    borderAccent: 'border-l-sky-500',
    iconWrap: 'text-sky-600 dark:text-sky-400',
    headerDivider: 'border-sky-500/25',
  },
  'Company profile': {
    borderAccent: 'border-l-sky-500',
    iconWrap: 'text-sky-600 dark:text-sky-400',
    headerDivider: 'border-sky-500/25',
  },
  'Account Information': {
    borderAccent: 'border-l-sky-500',
    iconWrap: 'text-sky-600 dark:text-sky-400',
    headerDivider: 'border-sky-500/25',
  },
  Contact: {
    borderAccent: 'border-l-sky-500',
    iconWrap: 'text-sky-600 dark:text-sky-400',
    headerDivider: 'border-sky-500/25',
  },
  Communication: {
    borderAccent: 'border-l-sky-500',
    iconWrap: 'text-sky-600 dark:text-sky-400',
    headerDivider: 'border-sky-500/25',
  },
  'Payment information': {
    borderAccent: 'border-l-amber-500',
    iconWrap: 'text-amber-700 dark:text-amber-400',
    headerDivider: 'border-amber-500/25',
  },
  'Commercial information': {
    borderAccent: 'border-l-amber-500',
    iconWrap: 'text-amber-700 dark:text-amber-400',
    headerDivider: 'border-amber-500/25',
  },
  'Internal notes': {
    borderAccent: 'border-l-violet-500',
    iconWrap: 'text-violet-700 dark:text-violet-400',
    headerDivider: 'border-violet-500/25',
  },
  Commercial: {
    borderAccent: 'border-l-amber-500',
    iconWrap: 'text-amber-700 dark:text-amber-400',
    headerDivider: 'border-amber-500/25',
  },
  Membership: {
    borderAccent: 'border-l-violet-500',
    iconWrap: 'text-violet-700 dark:text-violet-400',
    headerDivider: 'border-violet-500/25',
  },
  SLA: {
    borderAccent: 'border-l-cyan-600',
    iconWrap: 'text-cyan-700 dark:text-cyan-400',
    headerDivider: 'border-cyan-600/25',
  },
}

const DEFAULT_THEME: DashboardSectionTheme = {
  borderAccent: 'border-l-[var(--color-accent)]',
  iconWrap: 'text-[var(--color-accent)]',
  headerDivider: 'border-[var(--color-border)]',
}

const SECTIONS_WITH_ACCENT_HEADER_DIVIDER = new Set([
  'Workspace pulse',
  'Financial performance',
  'Trip outcomes',
  'Invoices & bookings',
  'Work over time',
  'Client summary',
  'Client profile',
  'Personal profile',
  'Company profile',
  'Account Information',
  'Communication',
  'Payment information',
  'Commercial information',
  'Internal notes',
  'Commercial',
  'Membership',
  'SLA',
])

export function hasSectionAccentHeaderDivider(title: string): boolean {
  return SECTIONS_WITH_ACCENT_HEADER_DIVIDER.has(title)
}

export function resolveSectionTheme(title: string): DashboardSectionTheme {
  return SECTION_THEME_BY_TITLE[title] ?? DEFAULT_THEME
}
