import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import { CardSkeleton } from '@/design-system/components/Skeleton'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'

function PageLoader() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Suspense fallback={<PageLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppProviders>
    </ErrorBoundary>
  )
}
