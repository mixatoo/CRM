import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ChevronRight, Shield, Tags, Wallet } from 'lucide-react'
import { canMutate } from '@/domain/policies/permissions'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Page } from '@/design-system/layout/Page'
import { PageHeader } from '@/design-system/layout/PageHeader'
import { CrmPanel } from '@/design-system/layout/CrmPanel'
import { Input } from '@/design-system/components/Input'
import { Button } from '@/design-system/components/Button'
import { Skeleton } from '@/design-system/components/Skeleton'
import { useAppSettings, useSettingsMutations } from '@/features/settings/hooks/use-settings'
import { layout } from '@/design-system/tokens/layout'

export function SettingsPage() {
  const role = useAuthStore((s) => s.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'settings', 'update')
  const { data: settings, isLoading } = useAppSettings()
  const { updateSettings, isPending } = useSettingsMutations()

  const [companyName, setCompanyName] = useState('')
  const [defaultCurrency, setDefaultCurrency] = useState('EGP')
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('30')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!settings) return
    setCompanyName(settings.companyName)
    setDefaultCurrency(settings.defaultCurrency)
    setSessionTimeoutMinutes(String(settings.sessionTimeoutMinutes ?? 30))
  }, [settings])

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-4 h-10 w-48" />
        <Skeleton className="h-48 w-full" />
      </Page>
    )
  }

  return (
    <Page className="max-w-2xl">
      <PageHeader title="Settings" description="Organization profile and security defaults." />

      <div className="space-y-4">
        <CrmPanel title="Organization">
          <div className="space-y-4 px-4 py-4">
            <Field label="Company name">
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!canEdit} />
            </Field>
            <Field label="Default currency">
              <Input
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
                disabled={!canEdit}
                className="max-w-[8rem] font-mono uppercase"
              />
            </Field>
          </div>
        </CrmPanel>

        <CrmPanel title="Security">
          <div className="px-4 py-4">
            <Field label="Session timeout (minutes)">
              <Input
                type="number"
                min={5}
                max={480}
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
                disabled={!canEdit}
                className="max-w-[8rem]"
              />
            </Field>
          </div>
        </CrmPanel>

        <CrmPanel title="Reference data">
          <div className="space-y-2 px-4 py-4">
            <Link
              to="/settings/payment-terms"
              className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-3 transition-colors hover:bg-[var(--color-surface-muted)]/40"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]/40 text-[var(--color-accent)]">
                  <Wallet className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-foreground)]">Payment terms</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    Manage Net terms and due-date rules for customer accounts.
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-muted)]" aria-hidden />
            </Link>

            <Link
              to="/settings/labels"
              className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-3 transition-colors hover:bg-[var(--color-surface-muted)]/40"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-vip-muted)]/60 text-[var(--color-vip)]">
                  <Tags className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-foreground)]">Labels</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    Colored tags shared across accounts, trips, suppliers, and finance tables.
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-muted)]" aria-hidden />
            </Link>
          </div>
        </CrmPanel>

        {canEdit ? (
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              updateSettings.mutate(
                {
                  companyName: companyName.trim() || 'Egyliere',
                  defaultCurrency: defaultCurrency.trim() || 'EGP',
                  sessionTimeoutMinutes: Math.max(5, Number(sessionTimeoutMinutes) || 30),
                },
                { onSuccess: () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000) } },
              )
            }
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        ) : (
          <p className="text-xs text-[var(--color-muted)]">Read-only access for your role.</p>
        )}
        {saved ? <span className="ml-3 text-xs text-[var(--color-success)]">Saved</span> : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <InfoTile icon={Building2} title="Branding" text="Company name appears in documents and the shell." />
        <InfoTile icon={Shield} title="Sessions" text="Idle users are signed out after the configured timeout." />
      </div>
    </Page>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className={layout.statLabel}>{label}</span>
      {children}
    </label>
  )
}

function InfoTile({ icon: Icon, title, text }: { icon: typeof Building2; title: string; text: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-3">
      <Icon className="mb-2 h-4 w-4 text-[var(--color-accent)]" />
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-1 text-[10px] text-[var(--color-muted)]">{text}</p>
    </div>
  )
}
