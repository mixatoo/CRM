import { useMemo, useState } from 'react'
import { UserPlus } from 'lucide-react'
import {
  ClientFormWizard,
  createClientFormChangeHandlers,
} from '@/features/clients/components/ClientFormWizard'
import { CLIENT_FORM_STICKY_BAR } from '@/features/clients/components/client-form-ui'
import { createMockClientForm } from '@/features/ui-templates/data/mock-client-form'
import { PatternBlock } from '@/features/ui-templates/patterns/_shared/PatternBlock'
import { cn } from '@/shared/utils/cn'

export function ClientFormWizardPattern() {
  const [form, setForm] = useState(() => createMockClientForm({ firstName: 'Ibrahim', lastName: 'Mohamed' }))
  const { onChange, onPatch } = useMemo(() => createClientFormChangeHandlers(setForm), [])
  const [lastAction, setLastAction] = useState<string | null>(null)

  const handleSubmit = () => {
    setLastAction(`Submit — ${form.type} client (${form.firstName} ${form.lastName})`.trim())
  }

  return (
    <PatternBlock
      title="ClientFormWizard"
      description="Full multi-step client form shell — sidebar navigation, section fields, and footer actions. Reuse anywhere via ClientFormWizard."
      path="src/features/clients/components/ClientFormWizard.tsx"
    >
      <div
        className={cn(
          'flex h-[min(720px,calc(100vh-12rem))] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm',
        )}
      >
        <header className={cn('shrink-0 border-b border-[var(--color-border)] px-4 py-3', CLIENT_FORM_STICKY_BAR)}>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)]">
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-[var(--color-foreground)]">
                {form.type === 'corporate' ? 'New corporate client' : 'New individual client'}
              </h4>
              <p className="text-xs text-[var(--color-muted)]">Template preview — interactive wizard shell</p>
            </div>
          </div>
        </header>

        <ClientFormWizard
          form={form}
          onChange={onChange}
          onPatch={onPatch}
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => setLastAction('Cancel')}
          footerHint={
            <span className="text-[11px] text-[var(--color-muted)]">
              Template preview · last action: {lastAction ?? 'none'}
            </span>
          }
        />
      </div>
    </PatternBlock>
  )
}

export function ClientFormEditWizardPattern() {
  const [form, setForm] = useState(() =>
    createMockClientForm({
      firstName: 'Sara',
      lastName: 'Hassan',
      email: 'sara@example.com',
      phone: '+20 100 000 0000',
    }),
  )
  const { onChange, onPatch } = useMemo(() => createClientFormChangeHandlers(setForm), [])

  return (
    <PatternBlock
      title="ClientFormWizard (edit mode)"
      description="Same multi-step wizard as create — sidebar navigation, step sections, and Save changes in the footer."
      path="src/features/clients/components/ClientFormWizard.tsx — mode=&quot;edit&quot;"
    >
      <div className="flex h-[min(640px,calc(100vh-12rem))] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <header className={cn('shrink-0 border-b border-[var(--color-border)] px-4 py-3', CLIENT_FORM_STICKY_BAR)}>
          <h4 className="text-sm font-semibold text-[var(--color-foreground)]">Edit client</h4>
          <p className="text-xs text-[var(--color-muted)]">CL-00042 · Step-by-step edit wizard</p>
        </header>

        <ClientFormWizard
          form={form}
          onChange={onChange}
          onPatch={onPatch}
          mode="edit"
          showStatus
          onSubmit={() => undefined}
          onCancel={() => undefined}
        />
      </div>
    </PatternBlock>
  )
}
