/**
 * Baloo Bhaijaan 2 type scale — clear hierarchy, comfortable at 9–10pt body.
 */
export const DOC_TYPE = {
  documentTitle: 17,
  documentSubtitle: 9,
  sectionTitle: 10.5,
  subheading: 9.5,
  body: 9,
  bodyLarge: 9.5,
  caption: 8,
  label: 7.5,
  tableHead: 7.5,
  tableBody: 9,
  totalLabel: 8.5,
  totalAmount: 10,
  grandTotal: 11,
  badge: 7.5,
  footer: 7,
  logoInitials: 8,
  brandName: 10,
  invoiceNumber: 11,
} as const

export const DOC_LINE_HEIGHT = {
  tight: 1.28,
  normal: 1.45,
  relaxed: 1.58,
} as const

/** mm per line at a given font size */
export function lineHeightMm(fontSize: number, ratio = DOC_LINE_HEIGHT.normal) {
  return fontSize * 0.38 * ratio
}
