import { Input } from '../primitives/components/Input'
import { AccountingAmount } from '../primitives/components/AccountingAmount'
import {
  CrmFieldGrid,
  CrmInputCell,
  CrmMetricCell,
  CrmPanel,
} from '../primitives/layout/CrmPanel'
import { TRIP_PIPELINE_STAGES, TRIP_STAGES } from '../stubs/domain-entities'
import { TRIP_SERVICE_STATUSES } from '../stubs/domain-trip-service'
import { TemplateSection } from '../components/TemplateSection'
import { TripStageBadge } from '../primitives/components/TripStageBadge'
import { TripServiceStatusBadge } from '../primitives/components/TripServiceStatusBadge'
import {
  TRIP_SERVICE_CATEGORY_ICON,
  TRIP_SERVICE_CATEGORY_SHELL,
  TRIP_SERVICE_CATEGORY_VISUAL,
} from '../primitives/components/service-styles'
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORIES } from '../stubs/domain-entities'
import { cn } from '../primitives/utils/cn'

export function PanelsShowcase() {
  return (
    <div className="space-y-8">
      <TemplateSection
        title="CRM panel"
        description="Field grids for dashboards and flight operations. Extracted to design-system for reuse."
        path="src/design-system/layout/CrmPanel.tsx"
      >
        <CrmPanel title="Passenger details">
          <CrmFieldGrid columns={3}>
            <CrmInputCell label="First name">
              <Input size="sm" defaultValue="Mohamed" />
            </CrmInputCell>
            <CrmInputCell label="Last name">
              <Input size="sm" defaultValue="El-Sayed" />
            </CrmInputCell>
            <CrmInputCell label="Passport" hint="Required before ticket issue">
              <Input size="sm" placeholder="A12345678" />
            </CrmInputCell>
          </CrmFieldGrid>
        </CrmPanel>
      </TemplateSection>

      <TemplateSection
        title="Metric cells"
        description="Read-only KPI blocks with tone variants — used on trip dashboard and flight financial bars."
        path="src/design-system/layout/CrmPanel.tsx — CrmMetricCell"
      >
        <CrmPanel title="Financial snapshot">
          <CrmFieldGrid columns={4}>
            <CrmMetricCell label="Total cost" tone="default">
              <AccountingAmount amount={18_450} currency="EGP" truncate={false} />
            </CrmMetricCell>
            <CrmMetricCell label="Commission" tone="accent">
              <AccountingAmount amount={1_845} currency="EGP" truncate={false} />
            </CrmMetricCell>
            <CrmMetricCell label="Client paid" tone="success" sub="54% of sell">
              <AccountingAmount amount={10_000} currency="EGP" truncate={false} />
            </CrmMetricCell>
            <CrmMetricCell label="Supplier due" tone="warning">
              <AccountingAmount amount={5_000} currency="EGP" truncate={false} />
            </CrmMetricCell>
          </CrmFieldGrid>
        </CrmPanel>
      </TemplateSection>

      <TemplateSection
        title="Accounting amount"
        description="Currency + amount grid for tables and headers. Supports truncate (lists) and full width (forms)."
        path="src/design-system/components/AccountingAmount.tsx"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Table cell (truncate)</p>
            <AccountingAmount amount={122_323} currency="USD" className="max-w-[8rem]" />
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Detail view (full)</p>
            <AccountingAmount amount={18_450} currency="EGP" truncate={false} />
          </div>
        </div>
      </TemplateSection>

      <TemplateSection
        title="Status badges"
        description="Trip pipeline stages and service statuses — copy badge components into new list tables."
        path="src/features/trips/components/list/TripStageBadge.tsx"
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Trip stages</p>
            <div className="flex flex-wrap gap-2">
              {TRIP_STAGES.map((stage) => (
                <TripStageBadge key={stage} stage={stage} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Pipeline (active path)</p>
            <div className="flex flex-wrap gap-2">
              {TRIP_PIPELINE_STAGES.map((stage) => (
                <TripStageBadge key={stage} stage={stage} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Service status</p>
            <div className="flex flex-wrap gap-2">
              {TRIP_SERVICE_STATUSES.map((status) => (
                <TripServiceStatusBadge key={status} status={status} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">Service category icons</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_CATEGORIES.map((category) => {
                const Icon = TRIP_SERVICE_CATEGORY_ICON[category]
                return (
                  <span
                    key={category}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border px-2.5 py-1 text-xs',
                      TRIP_SERVICE_CATEGORY_SHELL[category],
                      TRIP_SERVICE_CATEGORY_VISUAL[category],
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {SERVICE_CATEGORY_LABELS[category]}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </TemplateSection>
    </div>
  )
}
