export const LABEL_TARGET_TYPES = [
  'client',
  'trip',
  'supplier',
  'invoice',
  'payment',
  'reminder',
  'activity',
  'trip_service',
] as const

export type LabelTargetType = (typeof LABEL_TARGET_TYPES)[number]

export const LABEL_TARGET_TYPE_LABELS: Record<LabelTargetType, string> = {
  client: 'Accounts',
  trip: 'Trips',
  supplier: 'Suppliers',
  invoice: 'Invoices',
  payment: 'Transactions',
  reminder: 'Reminders',
  activity: 'Activity',
  trip_service: 'Trip services',
}

export const LABEL_COLOR_IDS = [
  'slate',
  'blue',
  'green',
  'amber',
  'red',
  'violet',
  'cyan',
  'teal',
  'pink',
  'orange',
] as const

export type LabelColorId = (typeof LABEL_COLOR_IDS)[number]

export const LABEL_COLOR_OPTIONS: ReadonlyArray<{
  id: LabelColorId
  label: string
  shell: string
  text: string
  swatch: string
}> = [
  {
    id: 'slate',
    label: 'Slate',
    shell: 'border-[var(--color-border-strong)] bg-[var(--color-surface-muted)]',
    text: 'text-[var(--color-foreground)]',
    swatch: 'bg-[#64748b]',
  },
  {
    id: 'blue',
    label: 'Blue',
    shell: 'border-[var(--color-accent)]/25 bg-[var(--color-accent-muted)]',
    text: 'text-[var(--color-accent)]',
    swatch: 'bg-[var(--color-accent)]',
  },
  {
    id: 'green',
    label: 'Green',
    shell: 'border-[var(--color-success)]/25 bg-[var(--color-success-muted)]',
    text: 'text-[var(--color-success)]',
    swatch: 'bg-[var(--color-success)]',
  },
  {
    id: 'amber',
    label: 'Amber',
    shell: 'border-[var(--color-warning)]/30 bg-[var(--color-warning-muted)]',
    text: 'text-[var(--color-warning)]',
    swatch: 'bg-[var(--color-warning)]',
  },
  {
    id: 'red',
    label: 'Red',
    shell: 'border-[var(--color-danger)]/25 bg-[var(--color-danger-muted)]',
    text: 'text-[var(--color-danger)]',
    swatch: 'bg-[var(--color-danger)]',
  },
  {
    id: 'violet',
    label: 'Violet',
    shell: 'border-[var(--color-vip)]/25 bg-[var(--color-vip-muted)]',
    text: 'text-[var(--color-vip)]',
    swatch: 'bg-[var(--color-vip)]',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    shell: 'border-[var(--color-info)]/25 bg-[var(--color-info-muted)]',
    text: 'text-[var(--color-info)]',
    swatch: 'bg-[var(--color-info)]',
  },
  {
    id: 'teal',
    label: 'Teal',
    shell: 'border-[var(--color-stage-recent)]/25 bg-[var(--color-stage-recent-muted)]',
    text: 'text-[var(--color-stage-recent)]',
    swatch: 'bg-[var(--color-stage-recent)]',
  },
  {
    id: 'pink',
    label: 'Pink',
    shell: 'border-[#db2777]/25 bg-[#fdf2f8]',
    text: 'text-[#be185d]',
    swatch: 'bg-[#db2777]',
  },
  {
    id: 'orange',
    label: 'Orange',
    shell: 'border-[var(--color-stage-negotiation)]/25 bg-[var(--color-stage-negotiation-muted)]',
    text: 'text-[var(--color-stage-negotiation)]',
    swatch: 'bg-[var(--color-stage-negotiation)]',
  },
] as const

export const LABEL_COLOR_VISUAL: Record<
  LabelColorId,
  { shell: string; text: string; swatch: string }
> = Object.fromEntries(
  LABEL_COLOR_OPTIONS.map((option) => [
    option.id,
    { shell: option.shell, text: option.text, swatch: option.swatch },
  ]),
) as Record<LabelColorId, { shell: string; text: string; swatch: string }>

export interface Label {
  id: string
  name: string
  slug: string
  color: LabelColorId
  description?: string
  /** Empty array means the label is available for every target type. */
  scopes: LabelTargetType[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type LabelInput = Omit<Label, 'id' | 'slug' | 'createdAt' | 'updatedAt'>

export interface LabelAssignment {
  id: string
  labelId: string
  targetType: LabelTargetType
  targetId: string
  createdAt: string
  createdBy?: string
}

export const DEFAULT_LABELS: ReadonlyArray<{
  id: string
  name: string
  color: LabelColorId
  description?: string
  scopes?: LabelTargetType[]
}> = [
  {
    id: 'LBL-001',
    name: 'VIP',
    color: 'violet',
    description: 'High-touch luxury relationship',
  },
  {
    id: 'LBL-002',
    name: 'Priority',
    color: 'amber',
    description: 'Needs immediate ops attention',
  },
  {
    id: 'LBL-003',
    name: 'Follow-up',
    color: 'blue',
    description: 'Awaiting a next action',
  },
  {
    id: 'LBL-004',
    name: 'At risk',
    color: 'red',
    description: 'Churn, delay, or dispute risk',
  },
  {
    id: 'LBL-005',
    name: 'High value',
    color: 'green',
    description: 'Above-average commercial value',
  },
  {
    id: 'LBL-006',
    name: 'New',
    color: 'cyan',
    description: 'Recently created or onboarded',
  },
  {
    id: 'LBL-007',
    name: 'Corporate',
    color: 'slate',
    description: 'Business / group travel context',
    scopes: ['client', 'trip', 'invoice', 'payment'],
  },
  {
    id: 'LBL-008',
    name: 'Seasonal',
    color: 'teal',
    description: 'Peak season or campaign tag',
  },
] as const

export function slugifyLabelName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function sortLabels(labels: Label[]): Label[] {
  return [...labels].sort((a, b) => a.name.localeCompare(b.name))
}

export function normalizeLabelInput(input: LabelInput): LabelInput {
  return {
    name: input.name.trim(),
    color: input.color,
    description: input.description?.trim() || undefined,
    scopes: [...new Set(input.scopes)].sort(),
    isActive: input.isActive,
  }
}

export function validateLabelInput(input: LabelInput): string | null {
  if (!input.name.trim()) return 'Name is required.'
  if (!LABEL_COLOR_IDS.includes(input.color)) return 'Select a valid color.'
  for (const scope of input.scopes) {
    if (!LABEL_TARGET_TYPES.includes(scope)) return 'Invalid label scope.'
  }
  return null
}

export function labelToFormInput(label: Label): LabelInput {
  return {
    name: label.name,
    color: label.color,
    description: label.description,
    scopes: [...label.scopes],
    isActive: label.isActive,
  }
}

export function labelAppliesToTarget(label: Label, targetType: LabelTargetType): boolean {
  if (!label.isActive) return false
  if (label.scopes.length === 0) return true
  return label.scopes.includes(targetType)
}

export function resolveLabelColorVisual(color: LabelColorId | string) {
  if ((LABEL_COLOR_IDS as readonly string[]).includes(color)) {
    return LABEL_COLOR_VISUAL[color as LabelColorId]
  }
  return LABEL_COLOR_VISUAL.slate
}
