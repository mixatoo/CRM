import type { ReactNode } from 'react'
import { layout, resolvePageWidth, type PageWidth } from '@/design-system/tokens/layout'
import { cn } from '@/shared/utils/cn'

type PageLayout = 'content' | 'viewport' | 'viewportFlush'

interface PageProps {
  children: ReactNode
  className?: string
  /** `fluid` (default) fills available width; `prose` caps narrow text/forms only */
  size?: PageWidth | 'full' | 'lg' | 'md'
  layout?: PageLayout
}

const widthClass: Record<PageWidth, string> = {
  fluid: layout.pageFluid,
  prose: layout.proseMax,
}

const layoutClass: Record<PageLayout, string> = {
  content: cn('min-h-full overflow-auto', layout.pageContent),
  viewport: cn('flex h-full min-h-0 flex-1 flex-col overflow-hidden', layout.pageViewport),
  viewportFlush: cn('flex h-full min-h-0 flex-1 flex-col overflow-hidden'),
}

export function Page({ children, className, size = 'fluid', layout: pageLayout = 'content' }: PageProps) {
  const width = resolvePageWidth(size)

  return (
    <div className={cn(widthClass[width], layoutClass[pageLayout], className)}>
      {children}
    </div>
  )
}
