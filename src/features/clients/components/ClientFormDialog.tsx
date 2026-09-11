import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { UserPlus, Pencil } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { Client } from '@/domain/entities/client'
import { normalizeClientFormInput } from '@/domain/entities/client'
import { CLIENT_FORM_STICKY_BAR } from '@/features/clients/components/client-form-ui'
import {
  ClientFormWizard,
  createClientFormChangeHandlers,
} from '@/features/clients/components/ClientFormWizard'
import {
  EMPTY_CLIENT_FORM,
  clientToFormInput,
} from '@/features/clients/components/ClientProfileFields'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { canManageClientStatus } from '@/domain/policies/permissions'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { preventDialogDismissOnNestedOverlay } from '@/design-system/components/dialog-nested-overlay'
import { CRM_LABELS } from '@/features/clients/config/crm-labels'
import { cn } from '@/shared/utils/cn'

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  isPending?: boolean
  onSubmit: (input: ClientFormInput) => void
}

export function ClientFormDialog({ open, onOpenChange, client, isPending, onSubmit }: ClientFormDialogProps) {
  const isEdit = !!client
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEditStatus = canManageClientStatus(role)
  const [form, setForm] = useState<ClientFormInput>(EMPTY_CLIENT_FORM)
  const formFieldsRef = useRef<HTMLDivElement>(null)
  const { onChange, onPatch } = createClientFormChangeHandlers(setForm)

  useEffect(() => {
    if (!open) return
    setForm(client ? clientToFormInput(client) : EMPTY_CLIENT_FORM)
  }, [open, client])

  const handleSubmit = () => {
    onSubmit(normalizeClientFormInput(form))
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 right-0 z-[601] flex w-[min(44rem,calc(100vw-1rem))] max-w-[min(44rem,calc(100vw-1rem))] flex-col overflow-hidden border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none',
            'max-sm:inset-0 max-sm:w-full max-sm:max-w-none',
          )}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onPointerDownOutside={preventDialogDismissOnNestedOverlay}
          onInteractOutside={preventDialogDismissOnNestedOverlay}
        >
          <header className={cn('shrink-0 border-b border-[var(--color-border)] px-4 py-3', CLIENT_FORM_STICKY_BAR)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)]">
                    {isEdit ? (
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5" aria-hidden />
                    )}
                  </span>
                  <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                    {isEdit
                      ? CRM_LABELS.editAccount
                      : form.type === 'corporate'
                        ? `New corporate ${CRM_LABELS.account.toLowerCase()}`
                        : `New individual ${CRM_LABELS.account.toLowerCase()}`}
                  </Dialog.Title>
                </div>
                <Dialog.Description className="mt-1 text-xs font-normal text-[var(--color-muted)]">
                  {isEdit ? (
                    <>
                      <span className="font-medium text-[var(--color-foreground)]">{client?.reference}</span>
                      {' · Use the sections below to update the client profile.'}
                    </>
                  ) : (
                    <>Use the sections below to complete the client profile.</>
                  )}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <CloseButton variant="elevated" />
              </Dialog.Close>
            </div>
          </header>

          <ClientFormWizard
            key={open ? (client?.id ?? 'new') : 'closed'}
            form={form}
            onChange={onChange}
            onPatch={onPatch}
            mode={isEdit ? 'edit' : 'create'}
            isPending={isPending}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            showStatus={canEditStatus}
            showJoinedAt={canEditStatus && isEdit}
            formFieldsRef={formFieldsRef}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
