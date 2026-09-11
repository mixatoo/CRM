import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'
import { DexieTripRepository } from '@/repositories/implementations/trip-repository'
import { DexieTripServiceRepository } from '@/repositories/implementations/trip-service-repository'
import { DexieInvoiceRepository } from '@/repositories/implementations/invoice-repository'
import { DexieTripPaymentRepository } from '@/repositories/implementations/trip-payment-repository'
import { DexiePaymentAllocationRepository } from '@/repositories/implementations/payment-allocation-repository'
import { DexieTripActivityRepository } from '@/repositories/implementations/trip-activity-repository'
import { DexieClientRepository } from '@/repositories/implementations/client-repository'
import { DexieClientCreditCardRepository } from '@/repositories/implementations/client-credit-card-repository'
import { DexieClientServiceFeeRepository } from '@/repositories/implementations/client-service-fee-repository'
import { DexieTravelerRepository } from '@/repositories/implementations/traveler-repository'
import { DexieSupplierRepository } from '@/repositories/implementations/supplier-repository'
import { DexieReminderRepository } from '@/repositories/implementations/reminder-repository'
import { DexieTripItineraryNoteRepository } from '@/repositories/implementations/trip-itinerary-note-repository'
import { DexiePaymentTermRepository } from '@/repositories/implementations/payment-term-repository'
import {
  DexieLabelRepository,
  DexieLabelAssignmentRepository,
} from '@/repositories/implementations/label-repository'
import { db } from '@/infrastructure/database/db'
import type { UnitOfWork } from '@/repositories/interfaces'
import type { User, AppSettings } from '@/domain/entities'

export function createUnitOfWork(): UnitOfWork {
  return {
    users: createGenericRepository<User>(db.users, 'USR'),
    settings: createGenericRepository<AppSettings>(db.settings, 'SET'),
    trips: new DexieTripRepository(),
    tripServices: new DexieTripServiceRepository(),
    invoices: new DexieInvoiceRepository(),
    payments: new DexieTripPaymentRepository(),
    paymentAllocations: new DexiePaymentAllocationRepository(),
    tripActivities: new DexieTripActivityRepository(),
    clients: new DexieClientRepository(),
    clientCreditCards: new DexieClientCreditCardRepository(),
    clientServiceFees: new DexieClientServiceFeeRepository(),
    travelers: new DexieTravelerRepository(),
    suppliers: new DexieSupplierRepository(),
    reminders: new DexieReminderRepository(),
    tripItineraryNotes: new DexieTripItineraryNoteRepository(),
    paymentTerms: new DexiePaymentTermRepository(),
    labels: new DexieLabelRepository(),
    labelAssignments: new DexieLabelAssignmentRepository(),
  }
}

let uowInstance: UnitOfWork | null = null

export function getUnitOfWork(): UnitOfWork {
  if (!uowInstance) uowInstance = createUnitOfWork()
  return uowInstance
}

export type AppContainer = {
  uow: UnitOfWork
}

export function createAppContainer(): AppContainer {
  return { uow: getUnitOfWork() }
}

export const appContainer = createAppContainer()
