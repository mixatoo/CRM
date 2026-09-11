import type { InvoiceLineItem } from '@/domain/entities/invoice'
import { formatInvoiceLineProse } from '@/document-system/content/service-prose'

interface InvoiceLineItemDescriptionProps {
  line: InvoiceLineItem
}

export function InvoiceLineItemDescription({ line }: InvoiceLineItemDescriptionProps) {
  const prose = formatInvoiceLineProse(line)
  const [title, ...rest] = prose.includes(' — ') ? prose.split(' — ') : [prose]
  const detail = rest.join(' — ')

  return (
    <div className="inv-doc__item-body">
      <div className="inv-doc__item-title">{title}</div>
      {detail ? <p className="inv-doc__item-prose">{detail}</p> : null}
    </div>
  )
}
