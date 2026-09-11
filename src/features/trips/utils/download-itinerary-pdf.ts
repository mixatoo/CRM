import type { Trip } from '@/domain/entities'
import type { TripItinerary } from '@/domain/trip/build-itinerary'
import { downloadPdfBlob } from '@/document-system/export/download'
import {
  buildItineraryPdf,
  buildItineraryPdfBlob,
  itineraryDaysForExport,
} from '@/document-system/templates/itinerary-template'
import type { InvoiceCompanyProfile } from '@/features/trips/utils/invoice-document'
import { DEFAULT_INVOICE_COMPANY } from '@/features/trips/utils/invoice-document'

export { itineraryDaysForExport, buildItineraryPdf, buildItineraryPdfBlob }

export interface ItineraryPdfOptions {
  company?: InvoiceCompanyProfile
}

export async function downloadItineraryPdf(
  trip: Trip,
  itinerary: TripItinerary,
  options?: ItineraryPdfOptions,
): Promise<void> {
  const blob = buildItineraryPdfBlob({
    trip,
    itinerary,
    company: options?.company ?? DEFAULT_INVOICE_COMPANY,
  })
  await downloadPdfBlob(blob, `${trip.reference}_itinerary.pdf`)
}
