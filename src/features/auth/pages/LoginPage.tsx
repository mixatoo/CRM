import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Compass, ShieldCheck } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { layout } from '@/design-system/tokens/layout'
import { ForgotPasswordDialog } from '@/features/auth/components/ForgotPasswordDialog'
import { PasswordField } from '@/features/auth/components/PasswordField'
import { RequestAccountDialog } from '@/features/auth/components/RequestAccountDialog'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const CAPABILITIES = [
  { title: 'Operations', detail: 'Trips, services, suppliers, and daily workflows' },
  { title: 'Finance', detail: 'Costs, margins, invoices, and payment tracking' },
  { title: 'Sales', detail: 'Pipeline stages, clients, and team ownership' },
] as const

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const emailValue = watch('email')

  const onSubmit = handleSubmit(async (data) => {
    setError('')
    const ok = await login(data.email, data.password)
    if (ok) navigate('/')
    else setError('Invalid email or password. Please try again.')
  })

  return (
    <>
      <div className="grid min-h-full lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <aside className="relative flex flex-col bg-[var(--color-sidebar)] px-5 py-8 text-[var(--color-sidebar-text)] sm:px-10 sm:py-12 lg:min-h-full lg:px-12 lg:py-14">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] shadow-[0_4px_14px_rgba(37,99,235,0.35)]">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold tracking-tight text-white">
                  Egyliere<span className="font-normal text-[var(--color-sidebar-text)]">OPs</span>
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-subtle)]">
                  Luxury travel operations
                </p>
              </div>
            </div>

            <div className="mt-8 max-w-md lg:mt-14">
              <h1 className="text-xl font-semibold leading-snug text-white sm:text-2xl">
                Your operations command center for luxury travel.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-sidebar-text)]">
                Manage trips, services, clients, and finance in one secure workspace built for high-touch travel
                teams.
              </p>
            </div>

            <div className="mt-8 hidden gap-3 sm:grid sm:grid-cols-1 md:mt-10 lg:grid-cols-1 lg:gap-4">
              {CAPABILITIES.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[var(--radius-md)] border border-[var(--color-sidebar-hover)] bg-[var(--color-sidebar-hover)]/35 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-subtle)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 mt-8 hidden text-[11px] text-[var(--color-subtle)] lg:mt-auto lg:block">
            Role-based access · Audit-ready workflows · Built for operations teams
          </p>

          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.18),transparent_55%)]"
            aria-hidden
          />
        </aside>

        <main className="flex flex-col justify-center bg-[var(--color-surface)] px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="mx-auto w-full max-w-[22rem] sm:max-w-md">
            <div className="mb-6 sm:mb-8">
              <p className={cn(layout.sectionTitle, 'text-[var(--color-accent)]')}>Account access</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-2xl">
                Sign in
              </h2>
              <p className={cn('mt-2 max-w-sm', layout.caption)}>
                Use your organization email and password to continue.
              </p>
            </div>

            <CrmPanel title="Credentials">
              <form onSubmit={onSubmit}>
                <div className="divide-y divide-[var(--color-border)]">
                  <CrmInputCell label="Work email">
                    <Input
                      id="login-email"
                      type="email"
                      aria-label="Work email"
                      placeholder="name@company.com"
                      autoFocus
                      autoComplete="email"
                      error={Boolean(error)}
                      {...register('email')}
                    />
                  </CrmInputCell>

                  <CrmInputCell label="Password">
                    <div className="space-y-2">
                      <PasswordField
                        id="login-password"
                        aria-label="Password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        error={Boolean(error)}
                        {...register('password')}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                          onClick={() => setForgotOpen(true)}
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>
                  </CrmInputCell>
                </div>

                {error ? (
                  <div className="border-t border-[var(--color-border)] bg-[var(--color-danger-muted)]/50 px-4 py-3">
                    <p className="text-xs leading-relaxed text-[var(--color-danger)]">{error}</p>
                  </div>
                ) : null}

                <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-4 py-3">
                  <Button type="submit" className="h-10 w-full sm:h-9" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in…' : 'Sign in'}
                  </Button>
                </div>
              </form>
            </CrmPanel>

            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 px-4 py-3 text-center">
              <p className="text-xs text-[var(--color-muted)]">New to Egyliere Ops?</p>
              <button
                type="button"
                className="mt-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
                onClick={() => setRequestOpen(true)}
              >
                Request account access
              </button>
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 px-3 py-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-muted)]" aria-hidden />
              <p className="text-[11px] leading-relaxed text-[var(--color-muted)]">
                Authorized personnel only. Activity may be monitored for security and compliance purposes.
              </p>
            </div>
          </div>
        </main>
      </div>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} defaultEmail={emailValue} />
      <RequestAccountDialog open={requestOpen} onOpenChange={setRequestOpen} />
    </>
  )
}
