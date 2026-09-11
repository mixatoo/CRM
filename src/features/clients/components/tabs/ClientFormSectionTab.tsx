import { useEffect, useState } from 'react'
import type { Client } from '@/domain/entities/client'
import { isClientIdentityComplete, normalizeClientFormInput } from '@/domain/entities/client'
import { canManageClientStatus, canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { ClientSectionPanel } from '@/features/clients/components/client-section-panel'
import { ClientProfileFields, clientToFormInput } from '@/features/clients/components/ClientProfileFields'
import type { ClientFormStepId } from '@/features/clients/components/client-form-ui'
import {
  hasSlaValidationErrors,
  validateSlaAgreement,
  type SlaValidationErrors,
} from '@/features/clients/components/sla/sla-validation'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useClientMutations, type ClientFormInput } from '@/features/clients/hooks/use-client-mutations'

interface ClientFormSectionTabProps {
  client: Client
  step: ClientFormStepId
}

export function ClientFormSectionTab({ client, step }: ClientFormSectionTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'passenger', 'update')
  const canEditStatus = canManageClientStatus(role)
  const { updateClient, isPending } = useClientMutations()
  const [form, setForm] = useState<ClientFormInput>(() => clientToFormInput(client))
  const [showSlaErrors, setShowSlaErrors] = useState(false)
  const [slaErrors, setSlaErrors] = useState<SlaValidationErrors>({})

  useEffect(() => {
    setForm(clientToFormInput(client))
    setShowSlaErrors(false)
    setSlaErrors({})
  }, [client])

  const setField = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (key === 'slaAgreement') setShowSlaErrors(false)
  }

  const patchForm = (patch: Partial<ClientFormInput>) => {
    setForm((current) => ({ ...current, ...patch }))
    if ('slaAgreement' in patch) setShowSlaErrors(false)
  }

  const handleSave = () => {
    if (!canEdit) return
    if (step === 'basics' && !isClientIdentityComplete(form)) return

    if (step === 'sla') {
      const errors = validateSlaAgreement(form.slaAgreement)
      setSlaErrors(errors)
      if (hasSlaValidationErrors(errors)) {
        setShowSlaErrors(true)
        return
      }
    }

    const normalized = normalizeClientFormInput(form)
    const patch: Partial<ClientFormInput> = { ...normalized }
    if (!canEditStatus) {
      delete patch.status
      delete patch.joinedAt
    }
    updateClient.mutate({ id: client.id, patch })
  }

  const saveDisabled =
    isPending ||
    (step === 'basics' && !isClientIdentityComplete(form)) ||
    (step === 'sla' && showSlaErrors && hasSlaValidationErrors(slaErrors))

  return (
    <ClientSectionPanel
      actions={
        canEdit ? (
          <Button type="button" size="sm" disabled={saveDisabled} onClick={handleSave}>
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        ) : undefined
      }
    >
      <ClientProfileFields
        form={form}
        onChange={setField}
        onPatch={patchForm}
        disabled={!canEdit}
        showStatus={step === 'basics' && canEditStatus}
        showJoinedAt={step === 'basics' && canEditStatus}
        layout="section"
        step={step}
        lockClientType
        showSlaErrors={showSlaErrors}
        slaErrors={slaErrors}
      />
    </ClientSectionPanel>
  )
}
