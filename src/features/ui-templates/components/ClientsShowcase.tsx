import { TemplateSection } from '@/features/ui-templates/components/TemplateSection'
import { ClientFormPatterns } from '@/features/ui-templates/patterns/clients/ClientFormPatterns'
import {
  ClientFormEditWizardPattern,
  ClientFormWizardPattern,
} from '@/features/ui-templates/patterns/clients/ClientFormWizardPattern'
import { DemographicsPatterns } from '@/features/ui-templates/patterns/clients/DemographicsPatterns'
import { FinancialFormPatterns } from '@/features/ui-templates/patterns/clients/FinancialFormPatterns'
import { MembershipPatterns } from '@/features/ui-templates/patterns/clients/MembershipPatterns'

export function ClientsShowcase() {
  return (
    <div className="space-y-10">
      <TemplateSection
        title="Full client form wizard"
        description="Reusable multi-step shell — sidebar, section fields, and footer navigation for new clients."
        path="src/features/clients/components/ClientFormWizard.tsx"
      >
        <div className="space-y-6">
          <ClientFormWizardPattern />
          <ClientFormEditWizardPattern />
        </div>
      </TemplateSection>

      <TemplateSection
        title="Client form pieces"
        description="Step navigation, segmented fields, gender toggle, and individual name entry."
        path="src/features/clients/components/client-form-ui.tsx"
      >
        <ClientFormPatterns />
      </TemplateSection>

      <TemplateSection
        title="Demographics"
        description="Date of birth picker with keyboard hints and derived read-only age."
        path="src/features/clients/components/IndividualProfileDetailsFields.tsx"
      >
        <DemographicsPatterns />
      </TemplateSection>

      <TemplateSection
        title="Payment information"
        description="Billing account, conditional credit limit, and payment setup fields."
        path="src/features/clients/components/FinancialFormFields.tsx"
      >
        <FinancialFormPatterns />
      </TemplateSection>

      <TemplateSection
        title="Membership"
        description="Term editor with duration presets and enrollment summary."
        path="src/features/clients/components/membership/MembershipTermEditor.tsx"
      >
        <MembershipPatterns />
      </TemplateSection>
    </div>
  )
}
