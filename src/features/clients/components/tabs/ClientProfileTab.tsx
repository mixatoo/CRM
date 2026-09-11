import { useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import type { UserRole } from '@/domain/entities'
import type { Client } from '@/domain/entities/client'
import { canManageClientStatus, canMutate } from '@/domain/policies/permissions'
import { clientToFormInput } from '@/features/clients/components/ClientProfileFields'
import { getClientFormStepCompletion } from '@/features/clients/components/client-form-step-completion'
import { ClientProfileWizardView } from '@/features/clients/components/profile/ClientProfileWizardView'
import { useUser } from '@/features/clients/hooks/use-account-managers'
import { useClientMutations } from '@/features/clients/hooks/use-client-mutations'
import { maskClientField } from '@/features/clients/utils/client-format'
import { usePaymentTerm } from '@/features/payment-terms/hooks/use-payment-terms'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { crmPanelClassName } from '@/design-system/layout/CrmPanel'
import { clientWorkspaceFlushSurfaceClassName } from '@/features/clients/components/workspace/client-workspace-chrome'
import { cn } from '@/shared/utils/cn'

interface ClientProfileTabProps {
  client: Client
}

function ProfileIncompleteNotice({ missingLabels }: { missingLabels: string[] }) {
  if (missingLabels.length === 0) return null

  const summary =
    missingLabels.length === 1
      ? `${missingLabels[0]} is required to complete this profile.`
      : `${missingLabels.join(', ')} are required to complete this profile.`

  return (
    <div
      role="status"
      className="mx-4 mt-3 flex shrink-0 items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-3 py-2.5 text-xs text-[var(--color-warning)]"
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium">Profile incomplete</p>
        <p className="text-[var(--color-warning)]/90">{summary}</p>
      </div>
    </div>
  )
}

export function ClientProfileTab({ client }: ClientProfileTabProps) {
  const role: UserRole = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'passenger', 'update')
  const canEditStatus = canManageClientStatus(role)
  const { data: accountManager } = useUser(client.accountManagerId)
  const { data: paymentTerm } = usePaymentTerm(client.paymentTermId)
  const { updateClient, isPending } = useClientMutations()

  const formInput = useMemo(() => clientToFormInput(client), [client])
  const basicsCompletion = useMemo(
    () => getClientFormStepCompletion(formInput, 'basics'),
    [formInput],
  )

  return (
    <article
      className={cn(
        crmPanelClassName,
        clientWorkspaceFlushSurfaceClassName,
        'flex h-full min-h-0 flex-1 flex-col overflow-hidden',
      )}
    >
      {!basicsCompletion.complete && !basicsCompletion.optional ? (
        <ProfileIncompleteNotice missingLabels={basicsCompletion.missingLabels} />
      ) : null}

      <ClientProfileWizardView
        client={client}
        accountManagerName={accountManager?.name}
        paymentTermName={paymentTerm?.name}
        maskContactValue={(value) => maskClientField(role, value)}
        canEdit={canEdit}
        canEditStatus={canEditStatus}
        isSaving={isPending}
        onSave={(patch, options) =>
          updateClient.mutate({ id: client.id, patch, silent: options?.silent })
        }
        className="min-h-0 flex-1"
      />
    </article>
  )
}
