import { ToolbarButtonPatterns } from '@/features/ui-templates/patterns/buttons/ToolbarButtonPatterns'
import { TemplateSection } from '@/features/ui-templates/components/TemplateSection'

export function ButtonsShowcase() {
  return (
    <TemplateSection
      title="Buttons"
      description="Copy from patterns/buttons. Uses design-system Button + buttonVariants."
      path="src/features/ui-templates/patterns/buttons/"
    >
      <ToolbarButtonPatterns />
    </TemplateSection>
  )
}
