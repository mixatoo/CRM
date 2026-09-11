import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/design-system/components/Button'
import { layout } from '@/design-system/tokens/layout'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className={cn('flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center', layout.pageContent)}>
          <AlertTriangle className="h-10 w-10 text-[var(--color-danger)]" />
          <h2 className={layout.entityTitle}>Something went wrong</h2>
          <p className={cn('max-w-md', layout.caption)}>{this.state.error.message}</p>
          <Button onClick={() => this.setState({ error: null })}>Try again</Button>
        </div>
      )
    }
    return this.props.children
  }
}
