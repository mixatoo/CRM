import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InvoiceDocumentPreview } from '@/features/trips/components/invoices/InvoiceDocumentPreview'
import { buildInvoicePdf } from '@/features/trips/utils/download-invoice-pdf'
import {
  invoiceStressDocument,
  invoiceStressSparseDocument,
} from '@/features/trips/utils/__tests__/invoice-stress-fixture'

describe('invoice stress layout', () => {
  it('renders extreme document without crashing', () => {
    render(<InvoiceDocumentPreview document={invoiceStressDocument} />)
    expect(screen.getByText(/Line items/i)).toBeInTheDocument()
    expect(screen.getByText(/18 items/i)).toBeInTheDocument()
    expect(screen.getByText(/Billed to/i)).toBeInTheDocument()
    expect(screen.getByText(/Total due/i)).toBeInTheDocument()
  })

  it('renders sparse optional fields without empty placeholders', () => {
    const { container } = render(<InvoiceDocumentPreview document={invoiceStressSparseDocument} />)
    const values = Array.from(container.querySelectorAll('.inv-doc__info-val')).map((el) => el.textContent)
    expect(values.some((v) => v?.includes('global-heritage'))).toBe(false)
    expect(values.some((v) => v?.includes('Alexandria'))).toBe(false)
    expect(screen.getByText(/1 item/i)).toBeInTheDocument()
  })

  it('generates multi-page PDF for extreme document', () => {
    const pdf = buildInvoicePdf(invoiceStressDocument)
    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(2)
  })

  it('generates PDF for sparse document', () => {
    expect(() => buildInvoicePdf(invoiceStressSparseDocument)).not.toThrow()
  })

  it('generates PDF for EGP-dominant line items', () => {
    const egpDoc = {
      ...invoiceStressDocument,
      currency: 'EGP',
      lineItems: invoiceStressDocument.lineItems.map((line) => ({ ...line, currency: 'EGP' })),
    }
    expect(() => buildInvoicePdf(egpDoc)).not.toThrow()
  })
})
