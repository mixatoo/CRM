/**
 * Lightweight version flags for startup fast-path checks.
 * Keep this file free of seed data / Dexie imports so cold start stays cheap.
 * When bumping a seed version in a feature seed module, update the matching constant here too.
 */
export const WARM_BOOTSTRAP_VERSION = 1
export const TRIPS_MOCK_VERSION = 1
export const TRIP_SERVICES_MOCK_VERSION = 19
export const CLIENTS_DIRECTORY_VERSION = 11
export const CLIENT_OPERATIONAL_SEED_VERSION = 1
export const SHOWCASE_CLIENT_SEED_VERSION = 4
export const SUPPLIERS_DIRECTORY_VERSION = 2
export const TRANSFERS_DIRECTORY_VERSION = 1
export const FINANCE_SEED_VERSION = 2
export const REMINDERS_DIRECTORY_VERSION = 1
export const ACTIVITY_SEED_VERSION = 1
export const INVOICE_SEED_VERSION = 2
export const PAYMENT_TERMS_DIRECTORY_VERSION = 1
export const LABELS_DIRECTORY_VERSION = 1
