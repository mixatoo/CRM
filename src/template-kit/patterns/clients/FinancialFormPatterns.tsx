import { useState } from 'react'
import { FinancialFieldsBlock } from '../stubs/FinancialFormFields'
import { createMockClientForm } from '../data/mock-client-form'
import { PatternBlock } from '../_shared/PatternBlock'
import type { ClientFormInput } from '../stubs/use-client-mutations'

export function FinancialFormPatterns() {
  const [form, setForm] = useState(() =>
    createMockClientForm({
      preferredCurrency: 'EGP',
      paymentCurrencies: ['EGP', 'USD'],
      billingAccount: 'prepaid',
    }),
  )

  const onChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <PatternBlock
        title="FinancialFieldsBlock"
        description="Payment information panel — billing account picklist, credit limit when credit is selected, currencies, methods, and terms."
        path="src/features/clients/components/FinancialFormFields.tsx"
      >
        <FinancialFieldsBlock form={form} onChange={onChange} />
      </PatternBlock>

      <PatternBlock
        title="Compact financial layout"
        description="Same fields without CrmPanel wrapper — used in stepped client form financial step."
        path="src/features/clients/components/FinancialFormFields.tsx — compact"
      >
        <FinancialFieldsBlock form={form} onChange={onChange} compact />
      </PatternBlock>
    </div>
  )
}
