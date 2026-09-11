import type { ReactNode } from 'react'
import { ChevronRight, Download, Plus, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '../../primitives/components/Button'
import { cn } from '../../primitives/utils/cn'

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger', 'success'] as const
const SIZES = ['sm', 'md', 'lg', 'icon'] as const

export function ToolbarButtonPatterns() {
  return (
    <div className="space-y-6">
      <PatternBlock title="Variants" description="Base button variants from design-system.">
        <div className="flex flex-wrap gap-2">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="sm">
              {variant}
            </Button>
          ))}
        </div>
      </PatternBlock>

      <PatternBlock title="Sizes" description="Use sm in toolbars and tables; md/lg in forms and dialogs.">
        <div className="flex flex-wrap items-center gap-2">
          {SIZES.filter((size) => size !== 'icon').map((size) => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
          <Button size="icon" variant="secondary" aria-label="Icon button">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </PatternBlock>

      <PatternBlock title="Toolbar actions" description="Common list-page button combinations.">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" className="h-8 gap-1.5 px-2.5 font-normal">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="ghost" size="sm" className="h-8 font-normal text-[var(--color-muted)]">
            Clear
          </Button>
          <Button variant="danger" size="sm" className="h-8 gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <Button variant="primary" size="sm" className="h-8 gap-1.5">
            Apply filters
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </PatternBlock>

      <PatternBlock title="buttonVariants helper" description="Use with Radix Slot / Link for styled anchors.">
        <a href="#buttons" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'no-underline')}>
          Link styled as button
        </a>
      </PatternBlock>
    </div>
  )
}

function PatternBlock({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{description}</p>
      <div className="mt-3">{children}</div>
    </section>
  )
}
