import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { UserRole } from '@/domain/entities'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useToast } from '@/design-system/components/Toast'
import { submitAuthAccessRequest } from '@/features/auth/utils/auth-access-requests'
import { cn } from '@/shared/utils/cn'

const ROLE_OPTIONS: Array<{ value: UserRole | 'unsure'; label: string }> = [
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'sales', label: 'Sales' },
  { value: 'management', label: 'Management' },
  { value: 'readonly', label: 'Read-only' },
  { value: 'unsure', label: 'Not sure yet' },
]

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid work email'),
  department: z.string().min(2, 'Enter your department or branch'),
  requestedRole: z.string().min(1, 'Select a role'),
  notes: z.string().optional(),
})

interface RequestAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestAccountDialog({ open, onOpenChange }: RequestAccountDialogProps) {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      department: '',
      requestedRole: 'operations',
      notes: '',
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubmitted(false)
      reset()
    }
    onOpenChange(next)
  }

  const onSubmit = handleSubmit(async (data) => {
    submitAuthAccessRequest({
      type: 'account_request',
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      department: data.department.trim(),
      requestedRole: data.requestedRole,
      notes: data.notes?.trim() || undefined,
    })
    setSubmitted(true)
    toast({
      intent: 'info',
      title: 'Access request submitted',
      description: 'Your manager or IT operations will review the request.',
    })
  })

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[700] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[701] flex max-h-[min(92vh,calc(100vh-1rem))] w-[min(32rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden',
            'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none',
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                Request account access
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
                New team members need manager approval before an Egyliere Ops account is issued.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </header>

          {submitted ? (
            <div className="space-y-4 overflow-y-auto px-4 py-5">
              <p className="text-sm leading-relaxed text-[var(--color-foreground)]">
                Thank you. Your access request is pending review. You will receive an email once your account is
                provisioned.
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                Typical turnaround is 1 business day. Contact your branch manager for urgent onboarding.
              </p>
              <Button type="button" className="w-full" onClick={() => handleOpenChange(false)}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <CrmPanel title="Applicant details">
                  <CrmFieldGrid columns={2}>
                    <CrmInputCell label="Full name">
                      <Input
                        placeholder="Your name"
                        autoComplete="name"
                        error={Boolean(errors.fullName)}
                        {...register('fullName')}
                      />
                    </CrmInputCell>
                    <CrmInputCell label="Work email">
                      <Input
                        type="email"
                        placeholder="name@egyliere.com"
                        autoComplete="email"
                        error={Boolean(errors.email)}
                        {...register('email')}
                      />
                    </CrmInputCell>
                    <CrmInputCell label="Department / branch">
                      <Input
                        placeholder="Cairo HQ, Sales…"
                        error={Boolean(errors.department)}
                        {...register('department')}
                      />
                    </CrmInputCell>
                    <CrmInputCell label="Requested role">
                      <Controller
                        name="requestedRole"
                        control={control}
                        render={({ field }) => (
                          <FormPicklist
                            value={field.value}
                            onChange={field.onChange}
                            options={ROLE_OPTIONS}
                            placeholder="Select role"
                            panelTitle="Requested role"
                            ariaLabel="Requested role"
                            error={Boolean(errors.requestedRole)}
                          />
                        )}
                      />
                    </CrmInputCell>
                  </CrmFieldGrid>
                  <div className="border-t border-[var(--color-border)] p-3">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                      Justification (optional)
                    </label>
                    <NotesTextarea
                      rows={3}
                      placeholder="Manager name, project, or reason for access…"
                      className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
                      {...register('notes')}
                    />
                  </div>
                </CrmPanel>

                {(errors.fullName || errors.email || errors.department) && (
                  <p className="mt-2 text-xs text-[var(--color-danger)]">
                    {errors.fullName?.message || errors.email?.message || errors.department?.message}
                  </p>
                )}
              </div>

              <footer className="flex shrink-0 justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">
                <Dialog.Close asChild>
                  <Button type="button" variant="secondary" size="sm">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit request'}
                </Button>
              </footer>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
