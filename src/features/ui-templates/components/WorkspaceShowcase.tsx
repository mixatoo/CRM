import { useState } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { TripStage } from '@/domain/entities'
import { MOCK_DEMO_TRIP } from '@/features/ui-templates/data/mock-data'
import { TemplateSection } from '@/features/ui-templates/components/TemplateSection'
import { TripInfoBar } from '@/features/trips/components/workspace/TripInfoBar'
import { TripProgressBar } from '@/features/trips/components/workspace/TripProgressBar'
import { TripWorkspaceNav } from '@/features/trips/components/workspace/TripWorkspaceNav'
import { WorkspaceShell } from '@/design-system/layout/WorkspaceShell'

export function WorkspaceShowcase() {
  const [stage, setStage] = useState<TripStage>(MOCK_DEMO_TRIP.stage)

  return (
    <div className="space-y-8">
      <TemplateSection
        title="Entity info bar"
        description="Trip header with name, metadata, and cost/sell blocks. Used on trip and service workspaces."
        path="src/features/trips/components/workspace/TripInfoBar.tsx"
      >
        <TripInfoBar trip={MOCK_DEMO_TRIP} />
      </TemplateSection>

      <TemplateSection
        title="Pipeline progress"
        description="Single compact segmented bar for all trip stages including Closed and Lost."
        path="src/features/trips/components/workspace/TripProgressBar.tsx"
      >
        <TripProgressBar stage={stage} onStageChange={setStage} />
      </TemplateSection>

      <TemplateSection
        title="Workspace tab nav"
        description="Back link + horizontal tab strip. Wrap in a router when copying into a feature page."
        path="src/features/trips/components/workspace/TripWorkspaceNav.tsx"
      >
        <MemoryRouter initialEntries={[`/trips/${MOCK_DEMO_TRIP.id}/dashboard`]}>
          <Routes>
            <Route path="/trips/:tripId/:tab?" element={<TripWorkspaceNav />} />
          </Routes>
        </MemoryRouter>
      </TemplateSection>

      <TemplateSection
        title="Workspace shell"
        description="Page wrapper for full-height workspaces. Use layout=&quot;viewport&quot; for tab content that scrolls internally."
        path="src/design-system/layout/WorkspaceShell.tsx"
      >
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <WorkspaceShell layout="viewport" className="max-h-48">
            <p className="text-sm text-[var(--color-muted)]">
              WorkspaceShell + WorkspaceZone + WorkspaceContent compose trip/service pages.
              See <span className="font-mono text-[11px]">TripWorkspacePage.tsx</span> and{' '}
              <span className="font-mono text-[11px]">TripFlightServicePage.tsx</span>.
            </p>
          </WorkspaceShell>
        </div>
      </TemplateSection>
    </div>
  )
}
