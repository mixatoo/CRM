import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { CloseButton } from '@/design-system/components/CloseButton'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { layout } from '@/design-system/tokens/layout'
import { clientPrimaryLabel, type Client } from '@/domain/entities/client'
import type { Traveler } from '@/domain/entities/traveler'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { useClients } from '@/features/clients/hooks/use-clients'
import type { TravelerFormInput } from '@/features/travelers/hooks/use-traveler-mutations'

export const EMPTY_TRAVELER_FORM: TravelerFormInput = {
  accountId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  notes: '',
}

export function travelerToFormInput(traveler: Traveler): TravelerFormInput {
  return {
    accountId: traveler.accountId,
    firstName: traveler.firstName,
    lastName: traveler.lastName,
    email: traveler.email ?? '',
    phone: traveler.phone ?? '',
    jobTitle: traveler.jobTitle ?? '',
    notes: traveler.notes ?? '',
  }
}

interface TravelerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  traveler?: Traveler | null
  /** When set, locks the account field (account workspace create/edit). */
  lockedAccountId?: string
  lockedAccountLabel?: string
  isPending?: boolean
  onSubmit: (input: TravelerFormInput) => void
}

export function TravelerFormDialog({
  open,
  onOpenChange,
  traveler,
  lockedAccountId,
  lockedAccountLabel,
  isPending,
  onSubmit,
}: TravelerFormDialogProps) {
  const isEdit = !!traveler
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const [form, setForm] = useState<TravelerFormInput>(EMPTY_TRAVELER_FORM)

  useEffect(() => {
    if (!open) return
    if (traveler) {
      setForm(travelerToFormInput(traveler))
      return
    }
    setForm({
      ...EMPTY_TRAVELER_FORM,
      accountId: lockedAccountId ?? '',
    })
  }, [open, traveler, lockedAccountId])

  const accountOptions = useMemo(
    () =>
      [...clients]
        .sort((a, b) => clientPrimaryLabel(a).localeCompare(clientPrimaryLabel(b)))
        .map((client: Client) => ({
          value: client.id,
          label: clientPrimaryLabel(client),
          description: client.reference,
        })),
    [clients],
  )

  const accountLocked = Boolean(lockedAccountId)
  const canSubmit =
    form.accountId.trim().length > 0 &&
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    !isPending

  const setField = <K extends keyof TravelerFormInput>(key: K, value: TravelerFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      ...form,
      accountId: lockedAccountId ?? form.accountId,
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[601] flex max-h-[min(90vh,40rem)] w-[min(28rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none">
          <header className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold">
                {isEdit ? CRM_LABELS.editTraveler : CRM_LABELS.newTraveler}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-[var(--color-muted)]">
                {isEdit
                  ? 'Update contact details for this traveler.'
                  : `Link a passenger, booker, or contact to an ${CRM_LABELS.account.toLowerCase()}.`}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton variant="elevated" />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <label className="block space-y-1.5">
              <span className={layout.statLabel}>{CRM_LABELS.account}</span>
              {accountLocked ? (
                <Input
                  value={lockedAccountLabel ?? accountOptions.find((o) => o.value === form.accountId)?.label ?? ''}
                  disabled
                  readOnly
                />
              ) : (
                <FormPicklist
                  value={form.accountId}
                  onChange={(value) => setField('accountId', value)}
                  options={accountOptions}
                  placeholder={`Select ${CRM_LABELS.account.toLowerCase()}…`}
                  panelTitle={CRM_LABELS.accounts}
                  ariaLabel={`Select ${CRM_LABELS.account.toLowerCase()}`}
                  searchable
                  searchPlaceholder={`Search ${CRM_LABELS.accounts.toLowerCase()}…`}
                  loading={clientsLoading}
                  error={!form.accountId.trim()}
                />
              )}
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className={layout.statLabel}>First name</span>
                <Input
                  value={form.firstName}
                  onChange={(event) => setField('firstName', event.target.value)}
                  placeholder="First name"
                  autoFocus={!accountLocked}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={layout.statLabel}>Last name</span>
                <Input
                  value={form.lastName}
                  onChange={(event) => setField('lastName', event.target.value)}
                  placeholder="Last name"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className={layout.statLabel}>Role / job title</span>
              <Input
                value={form.jobTitle ?? ''}
                onChange={(event) => setField('jobTitle', event.target.value)}
                placeholder="Booker, passenger, assistant…"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className={layout.statLabel}>Email</span>
                <Input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(event) => setField('email', event.target.value)}
                  placeholder="name@example.com"
                />
              </label>
              <label className="block space-y-1.5">
                <span className={layout.statLabel}>Phone</span>
                <Input
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={(event) => setField('phone', event.target.value)}
                  placeholder="+20…"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className={layout.statLabel}>Notes</span>
              <NotesTextarea
                value={form.notes ?? ''}
                onChange={(event) => setField('notes', event.target.value)}
                placeholder="Optional notes"
                rows={3}
              />
            </label>
          </div>

          <footer className="flex shrink-0 justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="button" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : CRM_LABELS.addTraveler}
            </Button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
