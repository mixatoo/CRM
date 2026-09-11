import type { Trip } from '@/domain/entities'
import type { ItineraryDay, ItineraryEntry } from '@/domain/trip/build-itinerary'
import { itineraryDaysForExport } from '@/document-system/templates/itinerary-template'
import {
  DEFAULT_INVOICE_COMPANY,
  type InvoiceCompanyProfile,
} from '@/features/trips/utils/invoice-document'
import { cn } from '@/shared/utils/cn'
import './itinerary-document.css'

export interface ItineraryDocumentData {
  trip: Trip
  company: InvoiceCompanyProfile
  days: ItineraryDay[]
}

export function buildItineraryDocumentData(
  trip: Trip,
  days: ItineraryDay[],
  company: InvoiceCompanyProfile = DEFAULT_INVOICE_COMPANY,
): ItineraryDocumentData {
  return {
    trip,
    company,
    days: itineraryDaysForExport(days),
  }
}

function EntryTag({ entry }: { entry: ItineraryEntry }) {
  if (entry.kind === 'note') {
    return <span className="itin-entry__tag itin-entry__tag--note">Note</span>
  }
  if (entry.kind === 'flight-segment') {
    return <span className="itin-entry__tag itin-entry__tag--flight">Flight</span>
  }
  if (entry.categoryLabel) {
    return <span className="itin-entry__tag">{entry.categoryLabel}</span>
  }
  return null
}

function ItineraryEntryRow({ entry }: { entry: ItineraryEntry }) {
  const timeLabel = entry.timeLabel?.trim()
  const kindClass =
    entry.kind === 'note' ? 'itin-entry--note' : entry.kind === 'flight-segment' ? 'itin-entry--flight' : ''

  return (
    <div className={cn('itin-entry', kindClass)}>
      <div className={cn('itin-entry__time', !timeLabel && 'itin-entry__time--allday')}>
        {timeLabel || 'All day'}
      </div>
      <div className="itin-entry__rail" aria-hidden>
        <span className="itin-entry__dot" />
      </div>
      <div className="itin-entry__card">
        <div className="itin-entry__top">
          <div className="itin-entry__title">{entry.title}</div>
          <EntryTag entry={entry} />
        </div>
        {entry.subtitle ? <div className="itin-entry__subtitle">{entry.subtitle}</div> : null}
        {entry.detail ? <div className="itin-entry__detail">{entry.detail}</div> : null}
      </div>
    </div>
  )
}

interface ItineraryDocumentPreviewProps {
  document: ItineraryDocumentData
  className?: string
}

export function ItineraryDocumentPreview({ document, className }: ItineraryDocumentPreviewProps) {
  const { trip, company, days } = document
  const totalEntries = days.reduce((sum, day) => sum + day.entries.length, 0)

  return (
    <div className={cn('itin-doc', className)}>
      <article className="itin-doc__sheet" data-itinerary-pdf-sheet>
        <header className="itin-doc__head">
          <div className="itin-doc__head-stripe" aria-hidden />
          <div className="itin-doc__head-blob itin-doc__head-blob--a" aria-hidden />
          <div className="itin-doc__head-blob itin-doc__head-blob--b" aria-hidden />
          <span className="itin-doc__head-dot itin-doc__head-dot--a" aria-hidden />
          <span className="itin-doc__head-dot itin-doc__head-dot--b" aria-hidden />
          <span className="itin-doc__head-dot itin-doc__head-dot--c" aria-hidden />
          <div className="itin-doc__head-trail" aria-hidden>
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
          <div className="itin-doc__head-content" data-itinerary-header-content>
            <p className="itin-doc__head-kicker">Travel</p>
            <h1 className="itin-doc__head-doc-title">Itinerary</h1>
            <div className="itin-doc__head-trip-pill">{trip.name}</div>
          </div>
        </header>

        <div className="itin-doc__body">
          <div className="itin-doc__section-head">
            <h2 className="itin-doc__section-title">Day-by-day schedule</h2>
            <span className="itin-doc__section-meta">
              {days.length} day{days.length === 1 ? '' : 's'} · {totalEntries} item{totalEntries === 1 ? '' : 's'}
            </span>
          </div>

          {days.length === 0 ? (
            <div className="itin-doc__empty">No scheduled items yet. Add services with dates to build the itinerary.</div>
          ) : (
            <div className="itin-timeline">
              {days.map((day) => (
                <section key={day.dayKey} className="itin-day">
                  <header className="itin-day__head">
                    {day.dayNumber ? (
                      <span className="itin-day__badge">Day {day.dayNumber}</span>
                    ) : (
                      <span className="itin-day__badge itin-day__badge--alt">+</span>
                    )}
                    <div className="itin-doc__wrap">
                      <div className="itin-day__label">{day.label}</div>
                      <div className="itin-day__count">
                        {day.entries.length} scheduled item{day.entries.length === 1 ? '' : 's'}
                      </div>
                    </div>
                  </header>
                  <div className="itin-day__entries">
                    {day.entries.map((entry) => (
                      <ItineraryEntryRow key={entry.id} entry={entry} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <footer className="itin-doc__foot">
          <div className="itin-doc__foot-thanks">We wish you a wonderful journey.</div>
          <div className="itin-doc__foot-contact itin-doc__wrap">
            <span>{company.website}</span>
            <span>{company.email}</span>
            <span>{company.phone}</span>
            <span>Trip: {trip.reference}</span>
          </div>
        </footer>
      </article>
    </div>
  )
}
