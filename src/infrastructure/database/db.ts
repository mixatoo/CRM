import Dexie, { type EntityTable } from 'dexie'
import type { User, AppSettings, Trip } from '@/domain/entities'
import type { Invoice } from '@/domain/entities/invoice'
import type { TripPayment } from '@/domain/entities/trip-payment'
import type { PaymentAllocation } from '@/domain/entities/payment-allocation'
import type { TripActivity } from '@/domain/entities/trip-activity'
import type { Client } from '@/domain/entities/client'
import type { Supplier } from '@/domain/entities/supplier'
import type { Reminder } from '@/domain/entities/reminder'
import type { TripService } from '@/domain/entities/trip-service'
import type { TripItineraryNote } from '@/domain/entities/trip-itinerary-note'
import type { PaymentTerm } from '@/domain/entities/payment-term'
import type { ClientCreditCard } from '@/domain/entities/client-credit-card'
import type { ClientServiceFee } from '@/domain/entities/client-service-fee'
import type { Traveler } from '@/domain/entities/traveler'
import type { Label, LabelAssignment } from '@/domain/entities/label'

export class EgyliereDatabase extends Dexie {
  users!: EntityTable<User, 'id'>
  settings!: EntityTable<AppSettings, 'id'>
  trips!: EntityTable<Trip, 'id'>
  tripServices!: EntityTable<TripService, 'id'>
  invoices!: EntityTable<Invoice, 'id'>
  tripPayments!: EntityTable<TripPayment, 'id'>
  paymentAllocations!: EntityTable<PaymentAllocation, 'id'>
  tripActivities!: EntityTable<TripActivity, 'id'>
  clients!: EntityTable<Client, 'id'>
  clientCreditCards!: EntityTable<ClientCreditCard, 'id'>
  clientServiceFees!: EntityTable<ClientServiceFee, 'id'>
  travelers!: EntityTable<Traveler, 'id'>
  suppliers!: EntityTable<Supplier, 'id'>
  reminders!: EntityTable<Reminder, 'id'>
  tripItineraryNotes!: EntityTable<TripItineraryNote, 'id'>
  paymentTerms!: EntityTable<PaymentTerm, 'id'>
  labels!: EntityTable<Label, 'id'>
  labelAssignments!: EntityTable<LabelAssignment, 'id'>

  constructor() {
    super('EgyliereOpsDB')

    this.version(2).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
    })

    this.version(3).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, createdAt',
    })

    this.version(4).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, createdAt',
      tripServices: 'id, tripId, category, status, lineNumber',
    })

    this.version(5).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, createdAt',
      tripServices: 'id, tripId, [tripId+lineNumber], category, status, lineNumber',
    })

    this.version(6).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, createdAt',
      tripServices: 'id, tripId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
    })

    this.version(7).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, createdAt',
      tripServices: 'id, tripId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
    })

    this.version(8).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt',
      tripServices: 'id, tripId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients: 'id, reference, status, type, email, displayName, createdAt, updatedAt',
    })

    this.version(9).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients: 'id, reference, status, type, email, displayName, createdAt, updatedAt',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
    })

    this.version(10).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients: 'id, reference, status, type, email, displayName, createdAt, updatedAt',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
    })

    this.version(11).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients: 'id, reference, status, type, email, displayName, createdAt, updatedAt',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
    })

    this.version(12).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients: 'id, reference, status, type, email, displayName, createdAt, updatedAt',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
    })

    this.version(13).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients: 'id, reference, status, type, email, displayName, paymentTermId, createdAt, updatedAt',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
      paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
    })

    this.version(14).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients:
        'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, createdAt, updatedAt',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
      paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
    })

    this.version(15).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients:
        'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, createdAt, updatedAt',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
      paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
    })

    this.version(16).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients:
        'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, joinedAt, createdAt, updatedAt',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
      paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
    })

    this.version(17).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients:
        'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, joinedAt, createdAt, updatedAt',
      clientCreditCards:
        'id, clientId, last4, expYear, isActive, brand, createdAt, updatedAt, [clientId+isActive]',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
      paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
    })

    this.version(18).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients:
        'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, joinedAt, createdAt, updatedAt',
      clientCreditCards:
        'id, clientId, last4, expYear, isActive, brand, createdAt, updatedAt, [clientId+isActive]',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
      paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
      labels: 'id, name, slug, color, isActive, createdAt, updatedAt',
      labelAssignments:
        'id, labelId, targetType, targetId, createdAt, [targetType+targetId], [labelId+targetType], [targetType+targetId+labelId]',
    })

    this.version(19)
      .stores({
        users: 'id, email, role, isActive',
        settings: 'id',
        trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
        tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
        invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
        tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
        tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
        clients:
          'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, joinedAt, createdAt, updatedAt',
        clientCreditCards:
          'id, clientId, last4, expYear, isActive, brand, createdAt, updatedAt, [clientId+isActive]',
        suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
        reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
        tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
        paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
        labels: 'id, name, slug, color, isActive, createdAt, updatedAt',
        labelAssignments:
          'id, labelId, targetType, targetId, createdAt, [targetType+targetId], [labelId+targetType], [targetType+targetId+labelId]',
      })
      .upgrade(async (tx) => {
        const legacyCards = await tx.table('clientCreditCards').toArray()
        for (const card of legacyCards) {
          const legacy = card as ClientCreditCard & { cardholderName?: string; nickname?: string }
          if (legacy.cardName?.trim()) continue

          const cardName = legacy.nickname?.trim() || legacy.cardholderName?.trim() || undefined
          if (!cardName) continue

          await tx.table('clientCreditCards').update(legacy.id, { cardName })
        }
      })

    this.version(20).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients:
        'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, joinedAt, createdAt, updatedAt',
      clientCreditCards:
        'id, clientId, last4, expYear, isActive, brand, createdAt, updatedAt, [clientId+isActive]',
      clientServiceFees: 'id, clientId, category, feeType, serviceName, createdAt, updatedAt, [clientId+serviceName]',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
      paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
      labels: 'id, name, slug, color, isActive, createdAt, updatedAt',
      labelAssignments:
        'id, labelId, targetType, targetId, createdAt, [targetType+targetId], [labelId+targetType], [targetType+targetId+labelId]',
    })

    this.version(21).stores({
      users: 'id, email, role, isActive',
      settings: 'id',
      trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
      tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
      invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
      tripPayments: 'id, tripId, invoiceId, direction, status, paidAt, [tripId+paidAt]',
      tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
      clients:
        'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, joinedAt, createdAt, updatedAt',
      clientCreditCards:
        'id, clientId, last4, expYear, isActive, brand, createdAt, updatedAt, [clientId+isActive]',
      clientServiceFees: 'id, clientId, category, feeType, serviceName, createdAt, updatedAt, [clientId+serviceName]',
      travelers: 'id, accountId, email, lastName, firstName, createdAt, updatedAt, [accountId+lastName]',
      suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
      reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
      tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
      paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
      labels: 'id, name, slug, color, isActive, createdAt, updatedAt',
      labelAssignments:
        'id, labelId, targetType, targetId, createdAt, [targetType+targetId], [labelId+targetType], [targetType+targetId+labelId]',
    })

    this.version(22)
      .stores({
        users: 'id, email, role, isActive',
        settings: 'id',
        trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
        tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
        invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
        tripPayments:
          'id, tripId, clientId, invoiceId, direction, status, paidAt, [tripId+paidAt], [clientId+paidAt]',
        paymentAllocations: 'id, paymentId, invoiceId, [paymentId+invoiceId]',
        tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
        clients:
          'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, joinedAt, createdAt, updatedAt',
        clientCreditCards:
          'id, clientId, last4, expYear, isActive, brand, createdAt, updatedAt, [clientId+isActive]',
        clientServiceFees: 'id, clientId, category, feeType, serviceName, createdAt, updatedAt, [clientId+serviceName]',
        travelers: 'id, accountId, email, lastName, firstName, createdAt, updatedAt, [accountId+lastName]',
        suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
        reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
        tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
        paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
        labels: 'id, name, slug, color, isActive, createdAt, updatedAt',
        labelAssignments:
          'id, labelId, targetType, targetId, createdAt, [targetType+targetId], [labelId+targetType], [targetType+targetId+labelId]',
      })
      .upgrade(async (tx) => {
        const payments = await tx.table('tripPayments').toArray()
        const trips = await tx.table('trips').toArray()
        const tripClientById = new Map(trips.map((trip: { id: string; clientId?: string }) => [trip.id, trip.clientId]))

        for (const payment of payments as TripPayment[]) {
          const patch: Partial<TripPayment> = {}
          if (!payment.clientId && payment.tripId) {
            const clientId = tripClientById.get(payment.tripId)
            if (clientId) patch.clientId = clientId
          }

          if (Object.keys(patch).length > 0) {
            await tx.table('tripPayments').update(payment.id, patch)
          }

          if (payment.invoiceId && payment.direction === 'inbound' && payment.status !== 'void') {
            const existing = await tx.table('paymentAllocations').where('paymentId').equals(payment.id).count()
            if (existing === 0) {
              await tx.table('paymentAllocations').add({
                id: `PAL-MIG-${payment.id}`,
                paymentId: payment.id,
                invoiceId: payment.invoiceId,
                amount: payment.amount,
                createdAt: payment.createdAt,
              })
            }
          }
        }
      })

    this.version(23)
      .stores({
        users: 'id, email, role, isActive',
        settings: 'id',
        trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
        tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
        invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
        tripPayments:
          'id, tripId, clientId, invoiceId, direction, status, paidAt, [tripId+paidAt], [clientId+paidAt]',
        paymentAllocations: 'id, paymentId, invoiceId, [paymentId+invoiceId]',
        tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
        clients:
          'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, joinedAt, createdAt, updatedAt',
        clientCreditCards:
          'id, clientId, last4, expYear, isActive, brand, createdAt, updatedAt, [clientId+isActive]',
        clientServiceFees: 'id, clientId, category, feeType, serviceName, createdAt, updatedAt, [clientId+serviceName]',
        travelers:
          'id, reference, accountId, email, lastName, firstName, createdAt, updatedAt, [accountId+lastName]',
        suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
        reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
        tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
        paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
        labels: 'id, name, slug, color, isActive, createdAt, updatedAt',
        labelAssignments:
          'id, labelId, targetType, targetId, createdAt, [targetType+targetId], [labelId+targetType], [targetType+targetId+labelId]',
      })
      .upgrade(async (tx) => {
        const travelers = await tx.table('travelers').orderBy('createdAt').toArray()
        let sequence = 0
        for (const traveler of travelers as Traveler[]) {
          if (traveler.reference?.match(/^TRV-\d+$/)) {
            const match = traveler.reference.match(/^TRV-(\d+)$/)
            if (match) sequence = Math.max(sequence, Number.parseInt(match[1], 10))
            continue
          }
          sequence += 1
          await tx.table('travelers').update(traveler.id, {
            reference: `TRV-${String(sequence).padStart(4, '0')}`,
          })
        }
      })

    this.version(24)
      .stores({
        users: 'id, email, role, isActive',
        settings: 'id',
        trips: 'id, reference, stage, ownerId, clientId, createdAt, updatedAt',
        tripServices: 'id, tripId, supplierId, [tripId+lineNumber], category, status, lineNumber',
        invoices: 'id, tripId, status, number, issuedAt, [tripId+number]',
        tripPayments:
          'id, tripId, clientId, invoiceId, direction, status, paidAt, [tripId+paidAt], [clientId+paidAt]',
        paymentAllocations: 'id, paymentId, invoiceId, [paymentId+invoiceId]',
        tripActivities: 'id, tripId, type, createdAt, [tripId+createdAt]',
        clients:
          'id, reference, status, type, email, displayName, paymentTermId, acquisitionSource, acquisitionChannel, accountManagerId, joinedAt, createdAt, updatedAt',
        clientCreditCards:
          'id, clientId, last4, expYear, isActive, brand, createdAt, updatedAt, [clientId+isActive]',
        clientServiceFees: 'id, clientId, category, feeType, serviceName, createdAt, updatedAt, [clientId+serviceName]',
        travelers:
          'id, reference, accountId, status, email, lastName, firstName, createdAt, updatedAt, [accountId+lastName]',
        suppliers: 'id, reference, status, category, email, displayName, createdAt, updatedAt',
        reminders: 'id, reference, status, priority, category, dueAt, tripId, assigneeName, createdAt, updatedAt',
        tripItineraryNotes: 'id, tripId, dayKey, sortOrder, [tripId+dayKey], createdAt',
        paymentTerms: 'id, name, days, isActive, createdAt, updatedAt',
        labels: 'id, name, slug, color, isActive, createdAt, updatedAt',
        labelAssignments:
          'id, labelId, targetType, targetId, createdAt, [targetType+targetId], [labelId+targetType], [targetType+targetId+labelId]',
      })
      .upgrade(async (tx) => {
        const travelers = await tx.table('travelers').toArray()
        for (const traveler of travelers as Traveler[]) {
          const patch: Partial<Traveler> = {}
          if (!traveler.status) patch.status = 'active'
          if (!traveler.vipLevel) patch.vipLevel = 'standard'
          if (!traveler.passports) patch.passports = []
          if (!traveler.visas) patch.visas = []
          if (!traveler.otherDocuments) patch.otherDocuments = []
          if (!traveler.address) patch.address = {}
          if (!traveler.emergencyContact) patch.emergencyContact = {}
          if (!traveler.travelPreferences) patch.travelPreferences = {}
          if (!traveler.assistance) patch.assistance = {}
          if (!traveler.medical) patch.medical = {}
          if (!traveler.privacy) patch.privacy = {}
          if (!traveler.classification) {
            patch.classification = {
              categories: [],
              riskLevel: 'low',
              blacklistStatus: 'clear',
              watchlistStatus: 'clear',
              internalTags: [],
            }
          }
          if (!traveler.profileSettings) patch.profileSettings = {}
          if (Object.keys(patch).length > 0) {
            await tx.table('travelers').update(traveler.id, patch)
          }
        }
      })
  }
}

export const db = new EgyliereDatabase()

export async function isDatabaseSeeded(): Promise<boolean> {
  const count = await db.users.count()
  return count > 0
}
