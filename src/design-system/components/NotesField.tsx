import { forwardRef, type ChangeEvent, type ComponentProps, type TextareaHTMLAttributes } from 'react'
import { Input, Textarea } from '@/design-system/components/Input'
import { formatNotesText } from '@/shared/utils/text-format'

function withFormattedNotesValue<E extends ChangeEvent<HTMLInputElement | HTMLTextAreaElement>>(
  event: E,
  formatted: string,
): E {
  return {
    ...event,
    target: { ...event.target, value: formatted },
    currentTarget: { ...event.currentTarget, value: formatted },
  }
}

type NotesInputProps = ComponentProps<typeof Input>
type NotesTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }

export const NotesInput = forwardRef<HTMLInputElement, NotesInputProps>(({ onChange, ...props }, ref) => (
  <Input
    ref={ref}
    {...props}
    onChange={(event) => {
      onChange?.(withFormattedNotesValue(event, formatNotesText(event.target.value)))
    }}
  />
))
NotesInput.displayName = 'NotesInput'

export const NotesTextarea = forwardRef<HTMLTextAreaElement, NotesTextareaProps>(({ onChange, ...props }, ref) => (
  <Textarea
    ref={ref}
    {...props}
    onChange={(event) => {
      onChange?.(withFormattedNotesValue(event, formatNotesText(event.target.value)))
    }}
  />
))
NotesTextarea.displayName = 'NotesTextarea'
