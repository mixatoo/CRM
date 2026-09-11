import { forwardRef } from 'react'
import type { InvoiceDocumentData } from '@/features/trips/utils/invoice-document'
import {
  formatInvoiceAmountValue,
  formatInvoiceLongDate,
  formatInvoiceMoney,
} from '@/features/trips/utils/invoice-document'
import { cn } from '@/shared/utils/cn'
import { InvoiceLineItemDescription } from '@/features/trips/components/invoices/InvoiceLineItemDescription'
import './invoice-document.css'

interface InvoiceDocumentPreviewProps {
  document: InvoiceDocumentData
  compact?: boolean
  className?: string
}

function BillToRow({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className="inv-doc__wrap">{value}</td>
    </tr>
  )
}

export const InvoiceDocumentPreview = forwardRef<HTMLDivElement, InvoiceDocumentPreviewProps>(
  function InvoiceDocumentPreview({ document, compact = false, className }, ref) {
  const dueAmount =
    document.balanceDue != null && document.balanceDue > 0 ? document.balanceDue : document.total
  const lineCount = document.lineItems.length

  const notesParts: string[] = []
  if (document.notes?.trim()) notesParts.push(document.notes.trim())
  notesParts.push(document.paymentInstructions)
  const notesText = notesParts.join('\n\n')

  const travelersLabel = `${document.trip.totalTravelers} guest${document.trip.totalTravelers === 1 ? '' : 's'} (${document.trip.adults} adult${document.trip.adults === 1 ? '' : 's'}${document.trip.minors > 0 ? `, ${document.trip.minors} minor${document.trip.minors === 1 ? '' : 's'}` : ''})`

  return (
    <div ref={ref} className={cn('inv-doc', compact && 'compact', className)}>
      <article className="inv-doc__sheet" data-invoice-pdf-sheet>
        <header className="inv-doc__head">
          <div className="inv-doc__head-inner">
            <div className="inv-doc__brand">
              <div className="inv-doc__logo-slot" aria-hidden>
                {document.company.logoUrl ? (
                  <img src={document.company.logoUrl} alt="" className="inv-doc__logo-image" />
                ) : (
                  <span className="inv-doc__logo-placeholder">Logo</span>
                )}
              </div>
              <div className="inv-doc__brand-text">
                <div className="inv-doc__brand-name">{document.company.name}</div>
                {document.company.tagline ? (
                  <div className="inv-doc__brand-sub">{document.company.tagline}</div>
                ) : null}
              </div>
            </div>

            <div className="inv-doc__head-doc">
              <div className="inv-doc__head-doc-grid">
                <p className="inv-doc__head-doc-title">Invoice</p>
                <span className="inv-doc__head-doc-number">{document.invoiceNumber}</span>
                <span className="inv-doc__head-date-label">Issued</span>
                <span className="inv-doc__head-date-value">{formatInvoiceLongDate(document.issuedAt)}</span>
                <span className="inv-doc__head-date-label">Due</span>
                <span className="inv-doc__head-date-value">{formatInvoiceLongDate(document.dueDate)}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="inv-doc__meta">
          <div className="inv-doc__meta-cell">
            <div className="inv-doc__meta-label">Currency</div>
            <div className="inv-doc__meta-value">{document.currency}</div>
          </div>
          <div className="inv-doc__meta-cell">
            <div className="inv-doc__meta-label">Payment terms</div>
            <div className="inv-doc__meta-value">Net {document.paymentTermsDays}</div>
          </div>
        </div>

        <div className="inv-doc__body">
          <section className="inv-doc__bill-to">
            <div className="inv-doc__bill-to-head">Billed to</div>
            <div className="inv-doc__bill-to-wrap">
              <table className="inv-doc__bill-to-table">
                <tbody>
                  <tr className="inv-doc__bill-to-name-row">
                    <th scope="row">Client</th>
                    <td className="inv-doc__wrap">
                      <strong>{document.clientName}</strong>
                    </td>
                  </tr>
                  <BillToRow label="Email" value={document.clientEmail} />
                  <BillToRow label="Trip ref" value={document.trip.reference} />
                  <BillToRow label="Trip name" value={document.trip.name} />
                  <BillToRow label="Destination" value={document.trip.destination} />
                </tbody>
              </table>
            </div>
          </section>

          <div className="inv-doc__trip-bar">
            <span className="inv-doc__trip-bar-label">Trip</span>
            <span className="inv-doc__trip-bar-item">
              Ref <strong>{document.trip.reference}</strong>
            </span>
            {document.trip.travelDatesLabel ? (
              <span className="inv-doc__trip-bar-item">{document.trip.travelDatesLabel}</span>
            ) : null}
            {document.trip.destination ? (
              <span className="inv-doc__trip-bar-item">{document.trip.destination}</span>
            ) : null}
            <span className="inv-doc__trip-bar-item">{travelersLabel}</span>
            {document.trip.ownerName ? (
              <span className="inv-doc__trip-bar-item">Owner: {document.trip.ownerName}</span>
            ) : null}
          </div>

          <section className="inv-doc__lines">
            <div className="inv-doc__lines-head">
              <h2 className="inv-doc__lines-title">Line items</h2>
              <span className="inv-doc__lines-count">
                {lineCount} {lineCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="inv-doc__table-wrap">
              <table className="inv-doc__table">
                <colgroup>
                  <col className="inv-doc__col-idx" />
                  <col className="inv-doc__col-desc" />
                  <col className="inv-doc__col-qty" />
                  <col className="inv-doc__col-price" />
                  <col className="inv-doc__col-amount" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="inv-doc__num">#</th>
                    <th>Description</th>
                    <th className="inv-doc__num">Qty</th>
                    <th className="inv-doc__num">Unit price</th>
                    <th className="inv-doc__num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {document.lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="inv-doc__empty-row">
                        No line items on this invoice.
                      </td>
                    </tr>
                  ) : (
                    document.lineItems.map((line, index) => (
                      <tr key={line.id}>
                        <td className="inv-doc__num">
                          <span className="inv-doc__line-idx">{index + 1}</span>
                        </td>
                        <td className="inv-doc__wrap">
                          <InvoiceLineItemDescription line={line} />
                        </td>
                        <td className="inv-doc__num">
                          <span className="inv-doc__money">{line.quantity}</span>
                        </td>
                        <td className="inv-doc__num">
                          <span className="inv-doc__money">{formatInvoiceAmountValue(line.unitAmount)}</span>
                        </td>
                        <td className="inv-doc__num inv-doc__amount-cell">
                          <span className="inv-doc__money">{formatInvoiceAmountValue(line.amount)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="inv-doc__bottom">
            {notesText.trim() ? (
              <article className="inv-doc__notes">
                <h3 className="inv-doc__notes-title">Notes &amp; payment</h3>
                <div className="inv-doc__notes-body inv-doc__wrap">{notesText}</div>
              </article>
            ) : null}
            <aside className="inv-doc__totals-panel">
              <div className="inv-doc__totals-head">Summary</div>
              <div className="inv-doc__totals">
                <div className="inv-doc__totals-row">
                  <span>Subtotal</span>
                  <span className="inv-doc__amt">{formatInvoiceAmountValue(document.subtotal)}</span>
                </div>
                {document.taxRate > 0 ? (
                  <div className="inv-doc__totals-row">
                    <span>Tax ({document.taxRate}%)</span>
                    <span className="inv-doc__amt">{formatInvoiceAmountValue(document.taxAmount)}</span>
                  </div>
                ) : null}
                {document.amountPaid != null && document.amountPaid > 0 ? (
                  <div className="inv-doc__totals-row inv-doc__paid">
                    <span>Amount paid</span>
                    <span className="inv-doc__amt">{formatInvoiceAmountValue(document.amountPaid)}</span>
                  </div>
                ) : null}
                {document.balanceDue != null &&
                document.balanceDue > 0 &&
                document.balanceDue !== document.total ? (
                  <div className="inv-doc__totals-row">
                    <span>Balance due</span>
                    <span className="inv-doc__amt">{formatInvoiceAmountValue(document.balanceDue)}</span>
                  </div>
                ) : null}
                <div className="inv-doc__totals-row inv-doc__grand">
                  <span>Total due</span>
                  <span className="inv-doc__amt">{formatInvoiceMoney(dueAmount, document.currency)}</span>
                </div>
              </div>
            </aside>
          </div>

          {document.termsAndConditions.trim() ? (
            <section className="inv-doc__terms">
              <h3 className="inv-doc__terms-title">Terms &amp; conditions</h3>
              <div className="inv-doc__terms-body inv-doc__wrap">{document.termsAndConditions}</div>
            </section>
          ) : null}
        </div>

        <footer className="inv-doc__foot">
          <div className="inv-doc__foot-thanks">Thank you for your business.</div>
          <div className="inv-doc__foot-contact inv-doc__wrap">
            {[
              document.company.website,
              document.company.email,
              document.company.phone,
              document.company.taxRegistration ? `Tax ID: ${document.company.taxRegistration}` : '',
            ]
              .filter(Boolean)
              .join(' | ')}
          </div>
        </footer>
      </article>
    </div>
  )
},
)
