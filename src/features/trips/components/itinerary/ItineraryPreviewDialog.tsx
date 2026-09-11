import { useCallback, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Download, Eye } from 'lucide-react'
import { CloseButton } from '@/design-system/components/CloseButton'
import type { Trip } from '@/domain/entities'
import type { TripItinerary } from '@/domain/trip/build-itinerary'
import { Button } from '@/design-system/components/Button'
import {
  buildItineraryDocumentData,
  ItineraryDocumentPreview,
} from '@/features/trips/components/itinerary/ItineraryDocumentPreview'
import { buildItineraryPdfBlob } from '@/document-system/templates/itinerary-template'
import { PdfExportDialog } from '@/document-system/export/PdfExportDialog'
import { cn } from '@/shared/utils/cn'

interface ItineraryPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Trip
  itinerary: TripItinerary
}

export function ItineraryPreviewDialog({
  open,
  onOpenChange,
  trip,
  itinerary,
}: ItineraryPreviewDialogProps) {
  const [pdfExportOpen, setPdfExportOpen] = useState(false)
  const document = useMemo(
    () => buildItineraryDocumentData(trip, itinerary.days),
    [trip, itinerary.days],
  )

  const generateItineraryPdf = useCallback(
    () => buildItineraryPdfBlob({ trip, itinerary }),
    [trip, itinerary],
  )

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed inset-2 z-[601] flex flex-col overflow-hidden outline-none sm:inset-3 lg:inset-4',
            'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 shadow-2xl',
          )}
        >
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:px-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Eye className="size-4 text-[var(--color-accent)]" aria-hidden />
                <Dialog.Title className="text-sm font-semibold text-[var(--color-foreground)]">
                  Itinerary preview
                </Dialog.Title>
              </div>
              <Dialog.Description className="mt-0.5 text-xs text-[var(--color-muted)]">
                {trip.name} · {trip.reference} · {itinerary.stats.scheduledDays} day
                {itinerary.stats.scheduledDays === 1 ? '' : 's'}
              </Dialog.Description>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 gap-1 px-2"
                onClick={() => setPdfExportOpen(true)}
              >
                <Download className="h-3.5 w-3.5" />
                Export PDF
              </Button>
              <Dialog.Close asChild>
                <CloseButton />
              </Dialog.Close>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
            <ItineraryDocumentPreview document={document} className="mx-auto w-full max-w-[1280px]" />
          </div>

          <PdfExportDialog
            open={pdfExportOpen}
            onOpenChange={setPdfExportOpen}
            title="Itinerary PDF preview"
            description={`Review the final layout before downloading ${trip.reference}_itinerary.pdf`}
            filename={`${trip.reference}_itinerary.pdf`}
            generatePdf={generateItineraryPdf}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
