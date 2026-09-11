import type { PaginatedResult, PaginationParams } from '@/types/pagination'
import type { Trip, TripStage, User, AppSettings } from '@/domain/entities'
import type { TripService } from '@/domain/entities/trip-service'
import type { Invoice, InvoiceStatus } from '@/domain/entities/invoice'
import type { TripPayment, PaymentDirection, PaymentMethod, PaymentStatus } from '@/domain/entities/trip-payment'
import type { PaymentAllocation } from '@/domain/entities/payment-allocation'
import type { TripActivity, TripActivityType } from '@/domain/entities/trip-activity'
import type { Client, ClientStatus, ClientType } from '@/domain/entities/client'
import type { Supplier, SupplierCategory, SupplierStatus } from '@/domain/entities/supplier'
import type { Reminder, ReminderPriority, ReminderStatus, ReminderCategory } from '@/domain/entities/reminder'
import type { TripItineraryNote } from '@/domain/entities/trip-itinerary-note'
import type { PaymentTerm } from '@/domain/entities/payment-term'
import type { ClientCreditCard } from '@/domain/entities/client-credit-card'
import type { ClientServiceFee } from '@/domain/entities/client-service-fee'
import type { Traveler } from '@/domain/entities/traveler'
import type { Label, LabelAssignment, LabelTargetType } from '@/domain/entities/label'

export interface GenericRepository<T extends { id: string }> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: Omit<T, 'id'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

export interface TripFilters {
  search?: string
  stage?: TripStage | 'all'
  owner?: string
  client?: string
  clientId?: string
  destination?: string
  dateFrom?: string
  dateTo?: string
  labelIds?: string[]
  sortBy?: TripSortField
  sortDir?: TripSortDir
}

export interface TripPanelFilters {
  owner: string
  client: string
  destination: string
  dateFrom: string
  dateTo: string
  labelIds: string[]
}

export const EMPTY_TRIP_PANEL_FILTERS: TripPanelFilters = {
  owner: 'all',
  client: 'all',
  destination: 'all',
  dateFrom: '',
  dateTo: '',
  labelIds: [],
}

export type TripSortField = 'reference' | 'date' | 'client' | 'persons' | 'cost' | 'destination' | 'stage' | 'owner'
export type TripSortDir = 'asc' | 'desc'

export interface TripRepository extends GenericRepository<Trip> {
  findPaginated(filters?: TripFilters, pagination?: PaginationParams): Promise<PaginatedResult<Trip>>
}

export type UserRepository = GenericRepository<User>
export type SettingsRepository = GenericRepository<AppSettings>

export interface TripServiceRepository extends GenericRepository<TripService> {
  findByTripId(tripId: string): Promise<TripService[]>
  syncTripBreakdown(tripId: string): Promise<void>
}

export interface InvoiceRepository extends GenericRepository<Invoice> {
  findByTripId(tripId: string): Promise<Invoice[]>
  countByTripId(tripId: string): Promise<number>
  findPaginated(filters?: InvoiceFilters, pagination?: PaginationParams): Promise<PaginatedResult<Invoice>>
}

export type InvoiceSortField = 'issuedAt' | 'dueDate' | 'total' | 'number' | 'status' | 'clientName'
export type InvoiceSortDir = 'asc' | 'desc'

export interface InvoiceFilters {
  search?: string
  status?: InvoiceStatus | 'all'
  aging?: 'all' | 'current' | 'due_soon' | 'overdue'
  tripId?: string
  labelIds?: string[]
  sortBy?: InvoiceSortField
  sortDir?: InvoiceSortDir
}

export interface TripPaymentRepository extends GenericRepository<TripPayment> {
  findByTripId(tripId: string): Promise<TripPayment[]>
  findByClientId(clientId: string): Promise<TripPayment[]>
  findPaginated(filters?: PaymentFilters, pagination?: PaginationParams): Promise<PaginatedResult<TripPayment>>
}

export interface PaymentAllocationRepository {
  findByPaymentId(paymentId: string): Promise<PaymentAllocation[]>
  findByPaymentIds(paymentIds: string[]): Promise<PaymentAllocation[]>
  findByInvoiceId(invoiceId: string): Promise<PaymentAllocation[]>
  createMany(
    paymentId: string,
    rows: Array<Pick<PaymentAllocation, 'invoiceId' | 'amount'>>,
  ): Promise<PaymentAllocation[]>
  deleteByPaymentId(paymentId: string): Promise<void>
}

export type PaymentSortField = 'paidAt' | 'amount' | 'direction' | 'status' | 'method'
export type PaymentSortDir = 'asc' | 'desc'

export interface PaymentFilters {
  search?: string
  clientId?: string
  direction?: PaymentDirection | 'all'
  status?: PaymentStatus | 'all'
  method?: PaymentMethod | 'all'
  tripId?: string
  labelIds?: string[]
  sortBy?: PaymentSortField
  sortDir?: PaymentSortDir
}

export interface TripActivityRepository extends GenericRepository<TripActivity> {
  findByTripId(tripId: string): Promise<TripActivity[]>
  findPaginated(filters?: ActivityFilters, pagination?: PaginationParams): Promise<PaginatedResult<TripActivity>>
}

export type ActivitySortField = 'createdAt' | 'type' | 'action'
export type ActivitySortDir = 'asc' | 'desc'

export interface ActivityFilters {
  search?: string
  type?: TripActivityType | 'all'
  tripId?: string
  labelIds?: string[]
  sortBy?: ActivitySortField
  sortDir?: ActivitySortDir
}

export type ClientSortField = 'reference' | 'displayName' | 'company' | 'email' | 'status' | 'type' | 'createdAt'
export type ClientSortDir = 'asc' | 'desc'

export interface ClientFilters {
  search?: string
  status?: ClientStatus | 'all'
  type?: ClientType | 'all'
  country?: string
  city?: string
  company?: string
  labelIds?: string[]
  sortBy?: ClientSortField
  sortDir?: ClientSortDir
}

export interface ClientPanelFilters {
  status: ClientStatus | 'all'
  type: ClientType | 'all'
  country: string
  city: string
  company: string
  labelIds: string[]
}

export const EMPTY_CLIENT_PANEL_FILTERS: ClientPanelFilters = {
  status: 'all',
  type: 'all',
  country: 'all',
  city: 'all',
  company: 'all',
  labelIds: [],
}

export interface ClientRepository extends GenericRepository<Client> {
  findPaginated(filters?: ClientFilters, pagination?: PaginationParams): Promise<PaginatedResult<Client>>
  countLinkedTrips(clientId: string): Promise<number>
}

export interface ClientCreditCardRepository extends GenericRepository<ClientCreditCard> {
  findByClientId(clientId: string): Promise<ClientCreditCard[]>
  deleteByClientId(clientId: string): Promise<void>
}

export interface ClientServiceFeeRepository extends GenericRepository<ClientServiceFee> {
  findByClientId(clientId: string): Promise<ClientServiceFee[]>
  deleteByClientId(clientId: string): Promise<void>
}

export type TravelerSortField =
  | 'reference'
  | 'name'
  | 'role'
  | 'status'
  | 'passengerType'
  | 'nationality'
  | 'vipLevel'
  | 'gender'
  | 'dateOfBirth'
  | 'passportStatus'
  | 'passportExpiry'
  | 'visaStatus'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'country'
  | 'city'
  | 'occupation'
  | 'company'
  | 'preferredLanguage'
  | 'category'
  | 'riskLevel'
  | 'account'
  | 'createdAt'
  | 'updatedAt'
export type TravelerSortDir = 'asc' | 'desc'

export interface TravelerFilters {
  search?: string
  accountId?: string
  sortBy?: TravelerSortField
  sortDir?: TravelerSortDir
}

/** Traveler row enriched with account display name for directory lists. */
export interface TravelerListItem extends Traveler {
  accountName: string
}

export interface TravelerRepository extends GenericRepository<Traveler> {
  findByAccountId(accountId: string): Promise<Traveler[]>
  deleteByAccountId(accountId: string): Promise<void>
  findPaginated(
    filters?: TravelerFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<TravelerListItem>>
}

export type SupplierSortField = 'reference' | 'displayName' | 'category' | 'country' | 'email' | 'status' | 'updatedAt'
export type SupplierSortDir = 'asc' | 'desc'

export interface SupplierFilters {
  search?: string
  status?: SupplierStatus | 'all'
  category?: SupplierCategory | 'all'
  country?: string
  city?: string
  labelIds?: string[]
  sortBy?: SupplierSortField
  sortDir?: SupplierSortDir
}

export interface SupplierPanelFilters {
  category: SupplierCategory | 'all'
  country: string
  city: string
  labelIds: string[]
}

export const EMPTY_SUPPLIER_PANEL_FILTERS: SupplierPanelFilters = {
  category: 'all',
  country: 'all',
  city: 'all',
  labelIds: [],
}

export interface SupplierRepository extends GenericRepository<Supplier> {
  findPaginated(filters?: SupplierFilters, pagination?: PaginationParams): Promise<PaginatedResult<Supplier>>
  countLinkedServices(supplierId: string): Promise<number>
}

export type ReminderSortField = 'reference' | 'title' | 'dueAt' | 'status' | 'priority' | 'updatedAt'
export type ReminderSortDir = 'asc' | 'desc'

export interface ReminderFilters {
  search?: string
  status?: ReminderStatus | 'all'
  priority?: ReminderPriority | 'all'
  category?: ReminderCategory | 'all'
  assignee?: string
  labelIds?: string[]
  sortBy?: ReminderSortField
  sortDir?: ReminderSortDir
}

export interface ReminderRepository extends GenericRepository<Reminder> {
  findPaginated(filters?: ReminderFilters, pagination?: PaginationParams): Promise<PaginatedResult<Reminder>>
}

export interface TripItineraryNoteRepository extends GenericRepository<TripItineraryNote> {
  findByTripId(tripId: string): Promise<TripItineraryNote[]>
}

export interface PaymentTermRepository extends GenericRepository<PaymentTerm> {
  findActive(): Promise<PaymentTerm[]>
  countLinkedClients(paymentTermId: string): Promise<number>
}

export interface LabelRepository extends GenericRepository<Label> {
  findActive(): Promise<Label[]>
  findAvailableForTarget(targetType: LabelTargetType): Promise<Label[]>
  countAssignments(labelId: string): Promise<number>
}

export interface LabelAssignmentRepository extends GenericRepository<LabelAssignment> {
  findByTarget(targetType: LabelTargetType, targetId: string): Promise<LabelAssignment[]>
  findByTargets(targetType: LabelTargetType, targetIds: string[]): Promise<LabelAssignment[]>
  findByLabelId(labelId: string): Promise<LabelAssignment[]>
  findTargetIdsByLabelIds(targetType: LabelTargetType, labelIds: string[]): Promise<string[]>
  setLabelsForTarget(
    targetType: LabelTargetType,
    targetId: string,
    labelIds: string[],
    createdBy?: string,
  ): Promise<void>
  addLabelsToTargets(
    targetType: LabelTargetType,
    targetIds: string[],
    labelIds: string[],
    createdBy?: string,
  ): Promise<void>
  removeLabelsFromTargets(
    targetType: LabelTargetType,
    targetIds: string[],
    labelIds: string[],
  ): Promise<void>
}

export interface UnitOfWork {
  users: UserRepository
  settings: SettingsRepository
  trips: TripRepository
  tripServices: TripServiceRepository
  invoices: InvoiceRepository
  payments: TripPaymentRepository
  paymentAllocations: PaymentAllocationRepository
  tripActivities: TripActivityRepository
  clients: ClientRepository
  clientCreditCards: ClientCreditCardRepository
  clientServiceFees: ClientServiceFeeRepository
  travelers: TravelerRepository
  suppliers: SupplierRepository
  reminders: ReminderRepository
  tripItineraryNotes: TripItineraryNoteRepository
  paymentTerms: PaymentTermRepository
  labels: LabelRepository
  labelAssignments: LabelAssignmentRepository
}
