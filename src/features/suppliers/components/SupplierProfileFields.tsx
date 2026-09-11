import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_CATEGORY_LABELS,
  SUPPLIER_STATUSES,
  SUPPLIER_STATUS_LABELS,
} from '@/domain/entities/supplier'
import { Input } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { NotesInput } from '@/design-system/components/NotesField'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import type { SupplierFormInput } from '@/features/suppliers/hooks/use-supplier-mutations'
import {
  compositeFieldClassName,
  formFieldPrefixClassName,
  formInputClassName,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface SupplierProfileFieldsProps {
  form: SupplierFormInput
  onChange: <K extends keyof SupplierFormInput>(key: K, value: SupplierFormInput[K]) => void
  disabled?: boolean
  showNotes?: boolean
}

export function SupplierProfileFields({ form, onChange, disabled, showNotes = true }: SupplierProfileFieldsProps) {
  return (
    <div className="space-y-3">
      <CrmPanel title="Identity">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Display name">
            <Input
              value={form.displayName}
              onChange={(event) => onChange('displayName', event.target.value)}
              className={formInputClassName}
              placeholder="Supplier name"
              disabled={disabled}
            />
          </CrmInputCell>
          <CrmInputCell label="Category">
            <FormPicklist
              value={form.category}
              onChange={(value) => onChange('category', value as SupplierFormInput['category'])}
              options={SUPPLIER_CATEGORIES.map((value) => ({
                value,
                label: SUPPLIER_CATEGORY_LABELS[value],
              }))}
              panelTitle="Category"
              ariaLabel="Supplier category"
              disabled={disabled}
              searchable
              searchPlaceholder="Search categories…"
            />
          </CrmInputCell>
          <CrmInputCell label="Status">
            <FormPicklist
              value={form.status}
              onChange={(value) => onChange('status', value as SupplierFormInput['status'])}
              options={SUPPLIER_STATUSES.map((value) => ({
                value,
                label: SUPPLIER_STATUS_LABELS[value],
              }))}
              panelTitle="Status"
              ariaLabel="Supplier status"
              disabled={disabled}
            />
          </CrmInputCell>
          <CrmInputCell label="Contact name">
            <Input
              value={form.contactName ?? ''}
              onChange={(event) => onChange('contactName', event.target.value)}
              className={formInputClassName}
              placeholder="Optional"
              disabled={disabled}
            />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      <CrmPanel title="Contact">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Email">
            <div className={compositeFieldClassName}>
              <span className={formFieldPrefixClassName}>@</span>
              <Input
                type="email"
                value={form.email ?? ''}
                onChange={(event) => onChange('email', event.target.value)}
                className={formInputClassName}
                disabled={disabled}
              />
            </div>
          </CrmInputCell>
          <CrmInputCell label="Phone">
            <Input
              value={form.phone ?? ''}
              onChange={(event) => onChange('phone', event.target.value)}
              className={formInputClassName}
              disabled={disabled}
            />
          </CrmInputCell>
          <CrmInputCell label="Country">
            <Input
              value={form.country ?? ''}
              onChange={(event) => onChange('country', event.target.value)}
              className={formInputClassName}
              disabled={disabled}
            />
          </CrmInputCell>
          <CrmInputCell label="City">
            <Input
              value={form.city ?? ''}
              onChange={(event) => onChange('city', event.target.value)}
              className={formInputClassName}
              disabled={disabled}
            />
          </CrmInputCell>
          <CrmInputCell label="Address" className="sm:col-span-2">
            <Input
              value={form.address ?? ''}
              onChange={(event) => onChange('address', event.target.value)}
              className={formInputClassName}
              disabled={disabled}
            />
          </CrmInputCell>
          <CrmInputCell label="Website">
            <Input
              value={form.website ?? ''}
              onChange={(event) => onChange('website', event.target.value)}
              className={formInputClassName}
              placeholder="https://"
              disabled={disabled}
            />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      <CrmPanel title="Commercial">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Payment terms">
            <Input
              value={form.paymentTerms ?? ''}
              onChange={(event) => onChange('paymentTerms', event.target.value)}
              className={formInputClassName}
              placeholder="Net 30, prepaid…"
              disabled={disabled}
            />
          </CrmInputCell>
          <CrmInputCell label="Preferred currency">
            <Input
              value={form.preferredCurrency ?? 'EGP'}
              onChange={(event) => onChange('preferredCurrency', event.target.value)}
              className={formInputClassName}
              disabled={disabled}
            />
          </CrmInputCell>
          {showNotes ? (
            <>
              <CrmInputCell label="Billing notes" className="sm:col-span-2">
                <NotesInput
                  value={form.billingNotes ?? ''}
                  onChange={(event) => onChange('billingNotes', event.target.value)}
                  className={formInputClassName}
                  disabled={disabled}
                />
              </CrmInputCell>
              <CrmInputCell label="Internal notes" className="sm:col-span-2">
                <NotesInput
                  value={form.notes ?? ''}
                  onChange={(event) => onChange('notes', event.target.value)}
                  className={formInputClassName}
                  disabled={disabled}
                />
              </CrmInputCell>
            </>
          ) : null}
        </CrmFieldGrid>
      </CrmPanel>
    </div>
  )
}

export const EMPTY_SUPPLIER_FORM: SupplierFormInput = {
  displayName: '',
  category: 'hotel',
  status: 'active',
  contactName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  website: '',
  paymentTerms: '',
  preferredCurrency: 'EGP',
  billingNotes: '',
  notes: '',
}

export function supplierToFormInput(supplier: import('@/domain/entities/supplier').Supplier): SupplierFormInput {
  return {
    displayName: supplier.displayName,
    category: supplier.category,
    status: supplier.status,
    contactName: supplier.contactName ?? '',
    email: supplier.email ?? '',
    phone: supplier.phone ?? '',
    country: supplier.country ?? '',
    city: supplier.city ?? '',
    address: supplier.address ?? '',
    website: supplier.website ?? '',
    paymentTerms: supplier.paymentTerms ?? '',
    preferredCurrency: supplier.preferredCurrency ?? 'EGP',
    billingNotes: supplier.billingNotes ?? '',
    notes: supplier.notes ?? '',
  }
}
