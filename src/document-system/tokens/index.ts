export * from '@/document-system/tokens/colors'
export * from '@/document-system/tokens/typography'
export * from '@/document-system/tokens/spacing'
export * from '@/document-system/tokens/page'

/** CSS custom properties — synced with on-screen document previews. */
export const DOC_CSS_VARS = {
  '--doc-ink': '#292524',
  '--doc-ink-soft': '#57534E',
  '--doc-muted': '#78716C',
  '--doc-subtle': '#A8A29E',
  '--doc-paper': '#FEFDFB',
  '--doc-canvas': '#FAF9F7',
  '--doc-surface': '#F5F4F1',
  '--doc-surface-alt': '#EEEDEA',
  '--doc-border': '#E7E5E4',
  '--doc-border-light': '#F0EEEB',
  '--doc-accent': '#0F766E',
  '--doc-accent-deep': '#115E59',
  '--doc-accent-soft': '#E6F4F3',
  '--doc-brand': '#1E3A4C',
  '--doc-brand-soft': '#E8EEF2',
  '--doc-success': '#047857',
  '--doc-success-soft': '#ECFDF5',
  '--doc-warning': '#B45309',
  '--doc-warning-soft': '#FFFBEB',
  '--doc-danger': '#BE123C',
  '--doc-danger-soft': '#FFF1F2',
  '--doc-radius': '10px',
  '--doc-radius-sm': '7px',
  '--doc-page-pad': '1.35rem',
} as const
