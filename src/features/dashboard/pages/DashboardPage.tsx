import { LayoutDashboard } from 'lucide-react'
import { Page } from '@/design-system/layout/Page'
import { ComingSoonHero } from '@/design-system/layout/ComingSoonHero'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <Page layout="viewport" className="min-h-0 flex-1 !p-0">
      <ComingSoonHero
        icon={LayoutDashboard}
        badgeSecondary="Coming to dashboard"
        title={
          <>
            Your dashboard
            <br />
            is on the way, {firstName}.
          </>
        }
        description="Portfolio KPIs, upcoming departures, reminders, and activity — one home screen for everything you run day to day."
        linkTo="/home"
        linkLabel="View module roadmap →"
      />
    </Page>
  )
}
