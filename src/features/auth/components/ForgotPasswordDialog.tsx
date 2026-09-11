import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CloseButton } from '@/design-system/components/CloseButton'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useToast } from '@/design-system/components/Toast'
import { submitAuthAccessRequest } from '@/features/auth/utils/auth-access-requests'
import { cn } from '@/shared/utils/cn'

const schema = z.object({
  email: z.string().email('Enter a valid work email'),
})

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEmail?: string
}

export function ForgotPasswordDialog({ open, onOpenChange, defaultEmail = '' }: ForgotPasswordDialogProps) {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: defaultEmail },
  })

  useEffect(() => {
    if (open) reset({ email: defaultEmail })
  }, [open, defaultEmail, reset])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubmitted(false)
      setSubmittedEmail('')
      reset({ email: defaultEmail })
    }
    onOpenChange(next)
  }

  const onSubmit = handleSubmit(async (data) => {
    const email = data.email.trim().toLowerCase()
    submitAuthAccessRequest({
      type: 'password_reset',
      email,
    })
    setSubmittedEmail(email)
    setSubmitted(true)
    toast({
      intent: 'info',
      title: 'Reset request submitted',
      description: 'If your email is registered, IT will follow up shortly.',
    })
  })

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[700] bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[701] w-[min(24rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2',
            'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl outline-none',
          )}
        >
          <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                Forgot password
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
                Enter your work email and our operations team will send reset instructions.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <CloseButton />
            </Dialog.Close>
          </header>

          {submitted ? (
            <div className="space-y-4 px-4 py-5">
              <p className="text-sm leading-relaxed text-[var(--color-foreground)]">
                Your request was logged. If <strong>{submittedEmail}</strong> is registered with Egyliere Ops, an administrator will contact you with next steps.
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                For urgent access, contact your branch manager or IT operations.
              </p>
              <Button type="button" className="w-full" onClick={() => handleOpenChange(false)}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <CrmPanel title="Work email">
                <div className="p-3">
                  <CrmInputCell label="Email">
                    <Input
                      type="email"
                      placeholder="name@egyliere.com"
                      autoComplete="email"
                      error={Boolean(errors.email)}
                      {...register('email')}
                    />
                  </CrmInputCell>
                  {errors.email ? (
                    <p className="mt-2 text-xs text-[var(--color-danger)]">{errors.email.message}</p>
                  ) : null}
                </div>
              </CrmPanel>

              <footer className="flex justify-end gap-2 border-t border-[var(--color-border)] px-4 py-3">
                <Dialog.Close asChild>
                  <Button type="button" variant="secondary" size="sm">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Send reset request'}
                </Button>
              </footer>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
