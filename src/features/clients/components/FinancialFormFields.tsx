import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { NotesTextarea } from '@/design-system/components/NotesField'
import { resolveClientBillingAccount, type ClientBillingAccount } from '@/domain/entities/client'
import {
  ClientBillingAccountField,
  ClientCreditCurrencyField,
  ClientCreditLimitField,
  ClientPaymentCurrenciesField,
  ClientPaymentMethodsField,
  ClientPaymentTermsField,
  FormField,
} from '@/features/clients/components/client-form-ui'
import { FormStepCluster, ClientFormStepLayout } from '@/features/clients/components/client-form-shared'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'

type OnChange = <K extends keyof ClientFormInput>(key: K, value: ClientFormInput[K]) => void

function handleBillingAccountChange(account: ClientBillingAccount, onChange: OnChange) {
  onChange('billingAccount', account)
  if (account === 'prepaid') {
    onChange('creditLimit', undefined)
  }
}

function CreditLimitField({
  form,
  onChange,
  disabled,
  layout,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  layout: 'compact' | 'panel'
}) {
  const control = (
    <ClientCreditLimitField
      creditLimit={form.creditLimit}
      currency={form.preferredCurrency}
      onCreditLimitChange={(value) => onChange('creditLimit', value)}
      onCurrencyChange={(value) => onChange('preferredCurrency', value)}
      disabled={disabled}
    />
  )

  if (layout === 'compact') {
    return <FormField label="Credit limit" fieldKey="creditLimit">{control}</FormField>
  }

  return (
    <CrmInputCell label="Credit limit" className="sm:col-span-2">
      {control}
    </CrmInputCell>
  )
}

const PAYMENT_CURRENCIES_HINT =
  'Currencies this client pays in — invoices can be issued in any of these'

function FinancialSetupForm({
  form,
  onChange,
  disabled,
  billingAccount,
  layout,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  billingAccount: ClientBillingAccount
  layout: 'compact' | 'panel'
}) {
  const isCreditAccount = billingAccount === 'credit'

  if (layout === 'compact') {
    return (
      <ClientFormStepLayout>
        <FormField label="Billing account" fieldKey="billingAccount">
          <ClientBillingAccountField
            value={billingAccount}
            onChange={(account) => handleBillingAccountChange(account, onChange)}
            disabled={disabled}
          />
        </FormField>

        <FormField label="Preferred currency" fieldKey="preferredCurrency">
          <ClientCreditCurrencyField
            value={form.preferredCurrency}
            onChange={(value) => onChange('preferredCurrency', value)}
            disabled={disabled}
          />
        </FormField>

        <FormStepCluster>
          {isCreditAccount ? (
            <CreditLimitField form={form} onChange={onChange} disabled={disabled} layout="compact" />
          ) : null}
          <FormField label="Payment currencies" fieldKey="paymentCurrencies">
            <ClientPaymentCurrenciesField
              value={form.paymentCurrencies}
              onChange={(value) => onChange('paymentCurrencies', value)}
              disabled={disabled}
            />
          </FormField>
          <FormField label="Payment methods" fieldKey="preferredPaymentMethods">
            <ClientPaymentMethodsField
              value={form.preferredPaymentMethods}
              onChange={(value) => onChange('preferredPaymentMethods', value)}
              disabled={disabled}
            />
          </FormField>
          <FormField label="Payment terms" fieldKey="paymentTermId">
            <ClientPaymentTermsField
              value={form.paymentTermId}
              onChange={(value) => onChange('paymentTermId', value)}
              disabled={disabled}
            />
          </FormField>
          <FormField label="Billing notes" fieldKey="billingNotes">
            <NotesTextarea
              value={form.billingNotes ?? ''}
              onChange={(event) => onChange('billingNotes', event.target.value)}
              placeholder="Payment terms and invoice instructions…"
              disabled={disabled}
              className="min-h-[5.5rem]"
            />
          </FormField>
        </FormStepCluster>
      </ClientFormStepLayout>
    )
  }

  return (
    <CrmFieldGrid columns={2}>
      <CrmInputCell label="Billing account">
        <ClientBillingAccountField
          value={billingAccount}
          onChange={(account) => handleBillingAccountChange(account, onChange)}
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Preferred currency" hint="Default for new trip quotes and account reporting">
        <ClientCreditCurrencyField
          value={form.preferredCurrency}
          onChange={(value) => onChange('preferredCurrency', value)}
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Payment terms">
        <ClientPaymentTermsField
          value={form.paymentTermId}
          onChange={(value) => onChange('paymentTermId', value)}
          disabled={disabled}
        />
      </CrmInputCell>
      {isCreditAccount ? (
        <CreditLimitField form={form} onChange={onChange} disabled={disabled} layout="panel" />
      ) : null}
      <CrmInputCell label="Payment currencies" hint={PAYMENT_CURRENCIES_HINT}>
        <ClientPaymentCurrenciesField
          value={form.paymentCurrencies}
          onChange={(value) => onChange('paymentCurrencies', value)}
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Payment methods">
        <ClientPaymentMethodsField
          value={form.preferredPaymentMethods}
          onChange={(value) => onChange('preferredPaymentMethods', value)}
          disabled={disabled}
        />
      </CrmInputCell>
      <CrmInputCell label="Billing notes" className="sm:col-span-2">
        <NotesTextarea
          value={form.billingNotes ?? ''}
          onChange={(event) => onChange('billingNotes', event.target.value)}
          placeholder="Payment terms and invoice instructions…"
          disabled={disabled}
          className="min-h-[4.5rem]"
        />
      </CrmInputCell>
    </CrmFieldGrid>
  )
}

export function FinancialFieldsBlock({
  form,
  onChange,
  disabled,
  compact,
  section,
}: {
  form: ClientFormInput
  onChange: OnChange
  disabled?: boolean
  compact?: boolean
  section?: boolean
}) {
  const billingAccount = resolveClientBillingAccount(form)

  if (compact) {
    return (
      <FinancialSetupForm
        form={form}
        onChange={onChange}
        disabled={disabled}
        billingAccount={billingAccount}
        layout="compact"
      />
    )
  }

  if (section) {
    return (
      <FinancialSetupForm
        form={form}
        onChange={onChange}
        disabled={disabled}
        billingAccount={billingAccount}
        layout="panel"
      />
    )
  }

  return (
    <CrmPanel title="Payment information">
      <FinancialSetupForm
        form={form}
        onChange={onChange}
        disabled={disabled}
        billingAccount={billingAccount}
        layout="panel"
      />
    </CrmPanel>
  )
}
