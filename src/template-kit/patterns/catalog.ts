export type ProjectPatternTab =
  | 'buttons'
  | 'forms'
  | 'clients'
  | 'lists'
  | 'tables'
  | 'workspace'
  | 'panels'
  | 'feedback'

export interface ProjectPatternEntry {
  id: string
  tab: ProjectPatternTab
  title: string
  description: string
  source: string
}

/** Living index of Egyliere Ops UI patterns — update when adding project-specific design. */
export const PROJECT_UI_CATALOG: ProjectPatternEntry[] = [
  // Forms — shared input patterns
  {
    id: 'field-hints',
    tab: 'forms',
    title: 'Field hints',
    description: 'Tooltip hints, shared constants, dynamic hints, inline captions.',
    source: 'src/design-system/components/FieldLabel.tsx',
  },
  {
    id: 'date-pickers',
    tab: 'forms',
    title: 'Date pickers',
    description: 'FormDatePicker, embedded dates, inline range calendars with keyboard nav.',
    source: 'src/design-system/components/DatePickerField.tsx',
  },
  {
    id: 'composite-fields',
    tab: 'forms',
    title: 'Composite prefix fields',
    description: 'h-8 rows with label prefix — dialogs and flight operation worksheets.',
    source: 'src/features/trips/components/services/flight/operations/operation-worksheet-ui.tsx',
  },
  // Clients — CRM forms
  {
    id: 'client-form-wizard',
    tab: 'clients',
    title: 'Full client form wizard',
    description: 'Reusable multi-step shell with sidebar nav, section fields, and footer actions.',
    source: 'src/features/clients/components/ClientFormWizard.tsx',
  },
  {
    id: 'client-step-nav',
    tab: 'clients',
    title: 'Multi-step form nav',
    description: 'Sidebar step list with completion state for new client wizard.',
    source: 'src/features/clients/components/client-form-step-sidebar-ui.tsx — ClientFormStepSidebar',
  },
  {
    id: 'segmented-fields',
    tab: 'clients',
    title: 'Segmented choice fields',
    description: 'Radio-style pill groups for client type, status, and membership.',
    source: 'src/features/clients/components/client-form-ui.tsx — SegmentedField',
  },
  {
    id: 'gender-toggle',
    tab: 'clients',
    title: 'Gender sliding toggle',
    description: 'Two-option field with animated selection indicator.',
    source: 'src/features/clients/components/client-form-ui.tsx — ClientGenderField',
  },
  {
    id: 'individual-names',
    tab: 'clients',
    title: 'Individual name fields',
    description: 'First / middle / last with live display-name preview.',
    source: 'src/features/clients/components/IndividualNameFields.tsx',
  },
  {
    id: 'demographics-dob-age',
    tab: 'clients',
    title: 'Date of birth & age',
    description: 'Date picker + read-only derived age with dynamic hint.',
    source: 'src/features/clients/components/IndividualProfileDetailsFields.tsx',
  },
  {
    id: 'financial-setup',
    tab: 'clients',
    title: 'Payment information block',
    description: 'Billing account, conditional credit limit, currencies, methods, terms.',
    source: 'src/features/clients/components/FinancialFormFields.tsx',
  },
  {
    id: 'membership-term',
    tab: 'clients',
    title: 'Membership term editor',
    description: 'Start/end dates, duration presets, and term status summary.',
    source: 'src/features/clients/components/membership/MembershipTermEditor.tsx',
  },
  // Existing showcases
  {
    id: 'buttons',
    tab: 'buttons',
    title: 'Buttons',
    description: 'Variants, sizes, toolbar actions, buttonVariants.',
    source: 'src/features/ui-templates/patterns/buttons/',
  },
  {
    id: 'lists',
    tab: 'lists',
    title: 'Lists',
    description: 'List toolbar, facet pickers, sort dropdown.',
    source: 'src/features/ui-templates/patterns/lists/',
  },
  {
    id: 'tables',
    tab: 'tables',
    title: 'Tables',
    description: 'StickyDataTable, selection, badges, pagination.',
    source: 'src/features/ui-templates/patterns/tables/',
  },
  {
    id: 'workspace',
    tab: 'workspace',
    title: 'Workspace',
    description: 'TripInfoBar, TripProgressBar, tab nav, WorkspaceShell.',
    source: 'src/features/trips/components/workspace/',
  },
  {
    id: 'panels',
    tab: 'panels',
    title: 'Panels & badges',
    description: 'CrmPanel grids, metric cells, status badges.',
    source: 'src/design-system/layout/CrmPanel.tsx',
  },
  {
    id: 'feedback',
    tab: 'feedback',
    title: 'Feedback',
    description: 'ConfirmDialog, toasts, SearchField, skeletons.',
    source: 'src/design-system/components/',
  },
]

export const PROJECT_PATTERN_SOURCE_MAP: Record<Exclude<ProjectPatternTab, never>, string> = {
  buttons: 'src/features/ui-templates/patterns/buttons/',
  forms: 'src/features/ui-templates/patterns/forms/',
  clients: 'src/features/ui-templates/patterns/clients/',
  lists: 'src/features/ui-templates/patterns/lists/',
  tables: 'src/features/ui-templates/patterns/tables/',
  workspace: 'src/features/trips/components/workspace/',
  panels: 'src/design-system/layout/CrmPanel.tsx',
  feedback: 'src/design-system/components/',
}
