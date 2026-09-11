/** Minimal domain types for template-kit badge/table demos — not wired to app domain. */

export type TripStage =
  | 'draft'
  | 'proposal'
  | 'negotiation'
  | 'confirmed'
  | 'upcoming'
  | 'active'
  | 'recent'
  | 'closed'
  | 'lost'

export const TRIP_STAGE_LABELS: Record<TripStage, string> = {
  draft: 'Draft',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  confirmed: 'Confirmed',
  upcoming: 'Upcoming',
  active: 'Active',
  recent: 'Recent',
  closed: 'Closed',
  lost: 'Lost',
}
