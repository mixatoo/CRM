import { forwardRef, useState, type FocusEvent } from 'react'
import { Input, type InputProps } from '../components/Input'
import { cn } from '../utils/cn'
import {
  amountInputClassName,
  formatAmountDraftFromValue,
  formatAmountInputValue,
  parseAmountInput,
  sanitizeAmountDraft,
} from '../utils/amount-input'

export interface AmountInputProps
  extends Omit<InputProps, 'type' | 'value' | 'onChange' | 'inputMode' | 'size' | 'min' | 'max' | 'step'> {
  value: number
  onChange: (value: number) => void
  decimals?: number
  min?: number
  allowNegative?: boolean
  emptyWhenZero?: boolean
  size?: InputProps['size']
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  (
    {
      value,
      onChange,
      decimals = 2,
      min,
      allowNegative = false,
      emptyWhenZero = true,
      size,
      className,
      onFocus,
      onBlur,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [draft, setDraft] = useState<string | null>(null)
    const isEditing = draft !== null

    const displayValue = isEditing
      ? draft
      : formatAmountInputValue(value, { decimals, emptyWhenZero })

    const resolvedMin = min ?? (allowNegative ? -Infinity : 0)

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        size={size}
        disabled={disabled}
        value={displayValue}
        onFocus={(event: FocusEvent<HTMLInputElement>) => {
          if (!disabled) {
            setDraft(formatAmountDraftFromValue(value, decimals))
          }
          onFocus?.(event)
        }}
        onChange={(event) => {
          if (disabled) return
          setDraft(sanitizeAmountDraft(event.target.value, decimals, allowNegative))
        }}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          if (!disabled) {
            onChange(parseAmountInput(draft ?? displayValue, { decimals, min: resolvedMin }))
            setDraft(null)
          }
          onBlur?.(event)
        }}
        className={cn(amountInputClassName, className)}
        {...props}
      />
    )
  },
)
AmountInput.displayName = 'AmountInput'
