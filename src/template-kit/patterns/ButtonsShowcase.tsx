import { ToolbarButtonPatterns } from './buttons/ToolbarButtonPatterns'
import { TemplateSection } from '../components/TemplateSection'

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
