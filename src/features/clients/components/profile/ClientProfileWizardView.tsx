import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Client } from '@/domain/entities/client'
import { isClientIdentityComplete, normalizeClientFormInput } from '@/domain/entities/client'
import {
  getClientFormStepOrder,
  getClientFormSteps,
  type ClientFormStepId,
} from '@/features/clients/components/client-form-ui'
import { ClientDashboardInfoCard } from '@/features/clients/components/dashboard/ClientDashboardInfoCard'
import { ClientProfileBrowseFooter } from '@/features/clients/components/profile/ClientProfileBrowseFooter'
import { ClientProfileSectionList } from '@/features/clients/components/profile/ClientProfileSectionList'
import {
  clientProfileBrowseGridClassName,
  clientProfileContentFadeClassName,
  clientProfileDetailBodyClassName,
  clientProfileDetailColumnClassName,
  clientProfileDetailDescClassName,
  clientProfileDetailHeaderClassName,
  clientProfileDetailScrollClassName,
  clientProfileDetailTitleClassName,
  clientProfileListColumnClassName,
} from '@/features/clients/components/profile/client-profile-browse-ui'
import {
  ClientProfileFields,
  clientToFormInput,
} from '@/features/clients/components/ClientProfileFields'
import { ClientCreditCardsSection } from '@/features/clients/components/credit-cards/ClientCreditCardsSection'
import { ClientServiceFeesSection } from '@/features/clients/components/service-fees/ClientServiceFeesSection'
import { ClientFormModifiedProvider, getModifiedClientFormKeys } from '@/features/clients/components/client-form-modified-context'
import { ClientFormProfileLayoutProvider } from '@/features/clients/components/client-form-profile-layout-context'
import { ProfileCrmFieldsShell } from '@/features/clients/components/profile/ProfileCrmFieldRow'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { getProfileSectionsForWizardStep } from '@/features/clients/utils/client-profile-display'
import {
  hasSlaValidationErrors,
  validateSlaAgreement,
  type SlaValidationErrors,
} from '@/features/clients/components/sla/sla-validation'
import { cn } from '@/shared/utils/cn'

function clientFormSnapshot(form: ClientFormInput): string {
  return JSON.stringify(normalizeClientFormInput(form))
}

function isClientFormPersistable(form: ClientFormInput): boolean {
  if (!isClientIdentityComplete(form)) return false
  return !hasSlaValidationErrors(validateSlaAgreement(form.slaAgreement))
}

function buildClientPatch(form: ClientFormInput, canEditStatus: boolean): Partial<ClientFormInput> {
  const patch: Partial<ClientFormInput> = { ...normalizeClientFormInput(form) }
  if (!canEditStatus) {
    delete patch.status
    delete patch.joinedAt
  }
  return patch
}

function stepIndex(order: ClientFormStepId[], step: ClientFormStepId) {
  return order.indexOf(step)
}

interface ClientProfileWizardViewProps {
  client: Client
  accountManagerName?: string
  paymentTermName?: string
  maskContactValue?: (value: string) => string
  canEdit?: boolean
  canEditStatus?: boolean
  isSaving?: boolean
  onSave?: (patch: Partial<ClientFormInput>, options?: { silent?: boolean }) => void
  className?: string
}

export function ClientProfileWizardView({
  client,
  accountManagerName,
  paymentTermName,
  maskContactValue,
  canEdit = false,
  canEditStatus = false,
  isSaving = false,
  onSave,
  className,
}: ClientProfileWizardViewProps) {
  const stepOrder = useMemo(() => getClientFormStepOrder(client.type), [client.type])
  const formSteps = useMemo(() => getClientFormSteps(client.type), [client.type])
  const [step, setStep] = useState<ClientFormStepId>('basics')
  const [editableForm, setEditableForm] = useState<ClientFormInput>(() => clientToFormInput(client))
  const [showSlaErrors, setShowSlaErrors] = useState(false)
  const [slaErrors, setSlaErrors] = useState<SlaValidationErrors>({})
  const savedSnapshot = useMemo(() => clientFormSnapshot(clientToFormInput(client)), [client])
  const savedForm = useMemo(() => clientToFormInput(client), [client])
  const unsavedCount = useMemo(
    () => (canEdit ? getModifiedClientFormKeys(savedForm, editableForm).size : 0),
    [canEdit, editableForm, savedForm],
  )
  const persistInFlightRef = useRef(false)
  const detailScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditableForm((current) =>
      clientFormSnapshot(current) === savedSnapshot ? clientToFormInput(client) : current,
    )
    setShowSlaErrors(false)
    setSlaErrors({})
  }, [client, savedSnapshot])

  useEffect(() => {
    if (!stepOrder.includes(step)) {
      setStep('basics')
    }
  }, [step, stepOrder])

  useEffect(() => {
    detailScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const isFirstStep = step === stepOrder[0]
  const isLastStep = step === stepOrder[stepOrder.length - 1]

  const stepSections = useMemo(
    () =>
      getProfileSectionsForWizardStep(step, client, {
        includeInternalNotesOnLastStep: true,
        isLastStep,
        accountManagerName,
        paymentTermName,
        maskContactValue,
      }),
    [accountManagerName, client, isLastStep, maskContactValue, paymentTermName, step],
  )

  const setField = useCallback(
    <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => {
      setEditableForm((current) => ({ ...current, [key]: value }))
      if (key === 'slaAgreement') setShowSlaErrors(false)
    },
    [],
  )

  const patchForm = useCallback((patch: Partial<ClientFormInput>) => {
    setEditableForm((current) => ({ ...current, ...patch }))
    if ('slaAgreement' in patch) setShowSlaErrors(false)
  }, [])

  const persistForm = useCallback(
    (form: ClientFormInput) => {
      if (!canEdit || !onSave || isSaving || persistInFlightRef.current) return false

      const snapshot = clientFormSnapshot(form)
      if (snapshot === savedSnapshot) return false

      if (!isClientFormPersistable(form)) {
        if (step === 'sla') {
          const errors = validateSlaAgreement(form.slaAgreement)
          setSlaErrors(errors)
          setShowSlaErrors(hasSlaValidationErrors(errors))
        }
        return false
      }

      persistInFlightRef.current = true
      onSave(buildClientPatch(form, canEditStatus), { silent: false })
      return true
    },
    [canEdit, canEditStatus, isSaving, onSave, savedSnapshot, step],
  )

  useEffect(() => {
    if (!isSaving) {
      persistInFlightRef.current = false
    }
  }, [isSaving])

  const changeStep = useCallback(
    (next: ClientFormStepId) => {
      if (stepOrder.includes(next)) setStep(next)
    },
    [stepOrder],
  )

  const goNext = () => {
    const next = stepOrder[stepIndex(stepOrder, step) + 1]
    if (next) setStep(next)
  }

  const goBack = () => {
    const prev = stepOrder[stepIndex(stepOrder, step) - 1]
    if (prev) setStep(prev)
  }

  const saveNow = () => {
    persistForm(editableForm)
  }

  const currentStep = formSteps.find((item) => item.id === step)
  const currentStepIndex = currentStep ? stepOrder.indexOf(currentStep.id) : -1

  const PROFILE_GRID_CLASS = cn(
    'grid h-full min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden md:items-stretch',
    clientProfileBrowseGridClassName,
  )

  const formContent = canEdit ? (
    <ClientFormModifiedProvider savedForm={savedForm} currentForm={editableForm}>
      <ClientFormProfileLayoutProvider>
        <ProfileCrmFieldsShell>
          <ClientProfileFields
            form={editableForm}
            onChange={setField}
            onPatch={patchForm}
            layout="profile"
            step={step}
            clientId={client.id}
            lockClientType
            showStatus={step === 'basics' && canEditStatus}
            showJoinedAt={step === 'basics' && canEditStatus}
            showSlaErrors={showSlaErrors}
            slaErrors={slaErrors}
          />
        </ProfileCrmFieldsShell>
      </ClientFormProfileLayoutProvider>
    </ClientFormModifiedProvider>
  ) : step === 'credit-cards' ? (
    <ClientCreditCardsSection clientId={client.id} disabled variant="profile" />
  ) : step === 'service-fees' ? (
    <ClientServiceFeesSection clientId={client.id} disabled variant="profile" />
  ) : (
    <ClientDashboardInfoCard sections={stepSections} variant="flat" />
  )

  return (
    <div className={cn('flex h-full min-h-0 flex-1 flex-col overflow-hidden', className)}>
      <div className={PROFILE_GRID_CLASS}>
        <aside className={clientProfileListColumnClassName}>
          <ClientProfileSectionList
            steps={formSteps}
            step={step}
            form={editableForm}
            onStepChange={changeStep}
            className="h-full min-h-0"
          />
        </aside>

        <div className={clientProfileDetailColumnClassName}>
          <header className={clientProfileDetailHeaderClassName}>
            {currentStep ? (
              <>
                <h2 className={clientProfileDetailTitleClassName}>{currentStep.label}</h2>
                {currentStep.description ? (
                  <p className={clientProfileDetailDescClassName}>{currentStep.description}</p>
                ) : null}
              </>
            ) : null}
          </header>

          <div className={clientProfileDetailBodyClassName}>
            <div ref={detailScrollRef} className={clientProfileDetailScrollClassName}>
              <div key={step} className={clientProfileContentFadeClassName}>
                {formContent}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClientProfileBrowseFooter
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onBack={goBack}
        onNext={goNext}
        isSaving={canEdit && isSaving}
        unsavedCount={canEdit ? unsavedCount : 0}
        onSaveNow={canEdit ? saveNow : undefined}
        canSave={canEdit ? unsavedCount > 0 : false}
        sectionLabel={currentStep?.label}
        stepIndex={currentStepIndex}
        stepCount={stepOrder.length}
      />
    </div>
  )
}
