import type { ClientSla } from '@/domain/entities/client'

export type ClientSlaLevel = 'standard' | 'premium' | 'vip' | 'custom'

export type ClientSlaSupportCoverage = 'business_hours' | 'extended_hours' | '24_7'

export type ClientSlaResponseTime =
  | '15_minutes'
  | '30_minutes'
  | '1_hour'
  | '2_hours'
  | '4_hours'
  | 'same_business_day'
  | 'next_business_day'
  | 'custom'

export type ClientSlaResponseTargetKey =
  | 'inquiryResponse'
  | 'quotationDelivery'
  | 'bookingConfirmation'
  | 'voucherDelivery'
  | 'complaintResponse'
  | 'complaintResolution'

export type ClientSlaRenewalPeriod = 'monthly' | 'quarterly' | 'semi_annual' | 'annual'

export type ClientSlaKpiReviewFrequency = 'monthly' | 'quarterly' | 'semi_annual' | 'annually'

export type ClientSlaBreachAlert = '15_minutes' | '30_minutes' | '1_hour' | '2_hours'

export interface ClientSlaResponseTarget {
  preset: ClientSlaResponseTime
  customValue?: string
}

export interface ClientSlaAgreement {
  level?: ClientSlaLevel
  customName?: string
  customDescription?: string
  supportCoverage?: ClientSlaSupportCoverage
  emergencyPhone?: string
  emergencyEmail?: string
  emergencyResponseTime?: ClientSlaResponseTime
  emergencyResponseCustom?: string
  inquiryResponse?: ClientSlaResponseTarget
  quotationDelivery?: ClientSlaResponseTarget
  bookingConfirmation?: ClientSlaResponseTarget
  voucherDelivery?: ClientSlaResponseTarget
  complaintResponse?: ClientSlaResponseTarget
  complaintResolution?: ClientSlaResponseTarget
  escalationEnabled?: boolean
  escalationAfter?: ClientSlaResponseTime
  escalationAfterCustom?: string
  escalationContact?: string
  escalationEmail?: string
  escalationPhone?: string
  effectiveDate?: string
  expiryDate?: string
  autoRenew?: boolean
  renewalPeriod?: ClientSlaRenewalPeriod
  renewalReminderDays?: number
  trackPerformance?: boolean
  kpiReviewFrequency?: ClientSlaKpiReviewFrequency
  slaSuccessTarget?: number
  alertBeforeBreach?: ClientSlaBreachAlert
  hasExceptions?: boolean
  exceptionDetails?: string
  exceptionAppliesTo?: string
  exceptionApprovalRequired?: boolean
  internalNotes?: string
}

export const CLIENT_SLA_LEVELS: ClientSlaLevel[] = ['standard', 'premium', 'vip', 'custom']

export const CLIENT_SLA_LEVEL_LABELS: Record<ClientSlaLevel, string> = {
  standard: 'Standard',
  premium: 'Premium',
  vip: 'VIP',
  custom: 'Custom',
}

export const CLIENT_SLA_SUPPORT_COVERAGES: ClientSlaSupportCoverage[] = [
  'business_hours',
  'extended_hours',
  '24_7',
]

export const CLIENT_SLA_SUPPORT_COVERAGE_LABELS: Record<ClientSlaSupportCoverage, string> = {
  business_hours: 'Business Hours',
  extended_hours: 'Extended Hours',
  '24_7': '24/7',
}

export const CLIENT_SLA_RESPONSE_TIMES: ClientSlaResponseTime[] = [
  '15_minutes',
  '30_minutes',
  '1_hour',
  '2_hours',
  '4_hours',
  'same_business_day',
  'next_business_day',
  'custom',
]

export const CLIENT_SLA_RESPONSE_TIME_LABELS: Record<ClientSlaResponseTime, string> = {
  '15_minutes': '15 Minutes',
  '30_minutes': '30 Minutes',
  '1_hour': '1 Hour',
  '2_hours': '2 Hours',
  '4_hours': '4 Hours',
  same_business_day: 'Same Business Day',
  next_business_day: 'Next Business Day',
  custom: 'Custom',
}

export const CLIENT_SLA_RESPONSE_TARGET_KEYS: ClientSlaResponseTargetKey[] = [
  'inquiryResponse',
  'quotationDelivery',
  'bookingConfirmation',
  'voucherDelivery',
  'complaintResponse',
  'complaintResolution',
]

export const CLIENT_SLA_RESPONSE_TARGET_LABELS: Record<ClientSlaResponseTargetKey, string> = {
  inquiryResponse: 'Inquiry Response Time',
  quotationDelivery: 'Quotation Delivery Time',
  bookingConfirmation: 'Booking Confirmation Time',
  voucherDelivery: 'Voucher Delivery Time',
  complaintResponse: 'Complaint Response Time',
  complaintResolution: 'Complaint Resolution Time',
}

export const CLIENT_SLA_RENEWAL_PERIODS: ClientSlaRenewalPeriod[] = [
  'monthly',
  'quarterly',
  'semi_annual',
  'annual',
]

export const CLIENT_SLA_RENEWAL_PERIOD_LABELS: Record<ClientSlaRenewalPeriod, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
}

export const CLIENT_SLA_KPI_FREQUENCIES: ClientSlaKpiReviewFrequency[] = [
  'monthly',
  'quarterly',
  'semi_annual',
  'annually',
]

export const CLIENT_SLA_KPI_FREQUENCY_LABELS: Record<ClientSlaKpiReviewFrequency, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annually: 'Annually',
}

export const CLIENT_SLA_BREACH_ALERTS: ClientSlaBreachAlert[] = [
  '15_minutes',
  '30_minutes',
  '1_hour',
  '2_hours',
]

export const CLIENT_SLA_BREACH_ALERT_LABELS: Record<ClientSlaBreachAlert, string> = {
  '15_minutes': '15 Minutes',
  '30_minutes': '30 Minutes',
  '1_hour': '1 Hour',
  '2_hours': '2 Hours',
}

export const VIP_SLA_RESPONSE_PRESETS: Record<ClientSlaResponseTargetKey, ClientSlaResponseTarget> = {
  inquiryResponse: { preset: '15_minutes' },
  quotationDelivery: { preset: '1_hour' },
  bookingConfirmation: { preset: '30_minutes' },
  voucherDelivery: { preset: '2_hours' },
  complaintResponse: { preset: '30_minutes' },
  complaintResolution: { preset: '4_hours' },
}

const LEGACY_SLA_BY_LEVEL: Partial<Record<ClientSlaLevel, ClientSla>> = {
  standard: 'standard',
  premium: 'premium',
  vip: 'vip',
}

export function emptySlaAgreement(): ClientSlaAgreement {
  return {}
}

export function isSlaAgreementEngaged(agreement?: ClientSlaAgreement): boolean {
  if (!agreement) return false
  return Boolean(agreement.level || agreement.supportCoverage || agreement.effectiveDate)
}

export function formatSlaResponseTarget(target?: ClientSlaResponseTarget): string {
  if (!target?.preset) return '—'
  if (target.preset === 'custom') return target.customValue?.trim() || 'Custom'
  return CLIENT_SLA_RESPONSE_TIME_LABELS[target.preset]
}

export function isSlaExpired(expiryDate?: string, today = new Date()): boolean {
  if (!expiryDate?.trim()) return false
  const expiry = new Date(`${expiryDate}T23:59:59`)
  if (Number.isNaN(expiry.getTime())) return false
  const now = new Date(today)
  now.setHours(0, 0, 0, 0)
  return expiry < now
}

export function computeSlaRenewalReminderDate(
  expiryDate: string,
  daysBefore: number,
): string | undefined {
  if (!expiryDate?.trim() || !Number.isFinite(daysBefore) || daysBefore < 0) return undefined
  const expiry = new Date(`${expiryDate}T12:00:00`)
  if (Number.isNaN(expiry.getTime())) return undefined
  expiry.setDate(expiry.getDate() - daysBefore)
  return expiry.toISOString()
}

export function applyVipSlaPresets(agreement: ClientSlaAgreement): ClientSlaAgreement {
  return {
    ...agreement,
    level: 'vip',
    ...VIP_SLA_RESPONSE_PRESETS,
  }
}

export function patchSlaAgreement(
  agreement: ClientSlaAgreement | undefined,
  patch: Partial<ClientSlaAgreement>,
): ClientSlaAgreement {
  return { ...(agreement ?? {}), ...patch }
}

export function patchSlaResponseTarget(
  agreement: ClientSlaAgreement | undefined,
  key: ClientSlaResponseTargetKey,
  target: ClientSlaResponseTarget,
): ClientSlaAgreement {
  return patchSlaAgreement(agreement, { [key]: target })
}

function trimOptional(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function normalizeResponseTarget(target?: ClientSlaResponseTarget): ClientSlaResponseTarget | undefined {
  if (!target?.preset) return undefined
  if (target.preset === 'custom') {
    const customValue = trimOptional(target.customValue)
    return customValue ? { preset: 'custom', customValue } : undefined
  }
  return { preset: target.preset }
}

function normalizeTimeField(
  preset?: ClientSlaResponseTime,
  custom?: string,
): { preset?: ClientSlaResponseTime; custom?: string } {
  if (!preset) return {}
  if (preset === 'custom') {
    const customValue = trimOptional(custom)
    return customValue ? { preset, custom: customValue } : {}
  }
  return { preset }
}

export function normalizeSlaAgreement(agreement?: ClientSlaAgreement): ClientSlaAgreement | undefined {
  if (!agreement) return undefined

  const level = agreement.level && CLIENT_SLA_LEVELS.includes(agreement.level) ? agreement.level : undefined
  const supportCoverage =
    agreement.supportCoverage && CLIENT_SLA_SUPPORT_COVERAGES.includes(agreement.supportCoverage)
      ? agreement.supportCoverage
      : undefined

  const emergency = normalizeTimeField(agreement.emergencyResponseTime, agreement.emergencyResponseCustom)
  const escalation = normalizeTimeField(agreement.escalationAfter, agreement.escalationAfterCustom)

  const normalized: ClientSlaAgreement = {
    level,
    customName: level === 'custom' ? trimOptional(agreement.customName) : undefined,
    customDescription: level === 'custom' ? trimOptional(agreement.customDescription) : undefined,
    supportCoverage,
    emergencyPhone:
      supportCoverage === 'extended_hours' || supportCoverage === '24_7'
        ? trimOptional(agreement.emergencyPhone)
        : undefined,
    emergencyEmail:
      supportCoverage === 'extended_hours' || supportCoverage === '24_7'
        ? trimOptional(agreement.emergencyEmail)
        : undefined,
    emergencyResponseTime: emergency.preset,
    emergencyResponseCustom: emergency.custom,
    inquiryResponse: normalizeResponseTarget(agreement.inquiryResponse),
    quotationDelivery: normalizeResponseTarget(agreement.quotationDelivery),
    bookingConfirmation: normalizeResponseTarget(agreement.bookingConfirmation),
    voucherDelivery: normalizeResponseTarget(agreement.voucherDelivery),
    complaintResponse: normalizeResponseTarget(agreement.complaintResponse),
    complaintResolution: normalizeResponseTarget(agreement.complaintResolution),
    escalationEnabled: Boolean(agreement.escalationEnabled),
    escalationAfter: agreement.escalationEnabled ? escalation.preset : undefined,
    escalationAfterCustom: agreement.escalationEnabled ? escalation.custom : undefined,
    escalationContact: agreement.escalationEnabled ? trimOptional(agreement.escalationContact) : undefined,
    escalationEmail: agreement.escalationEnabled ? trimOptional(agreement.escalationEmail) : undefined,
    escalationPhone: agreement.escalationEnabled ? trimOptional(agreement.escalationPhone) : undefined,
    effectiveDate: trimOptional(agreement.effectiveDate),
    expiryDate: trimOptional(agreement.expiryDate),
    autoRenew: Boolean(agreement.autoRenew),
    renewalPeriod:
      agreement.autoRenew && agreement.renewalPeriod && CLIENT_SLA_RENEWAL_PERIODS.includes(agreement.renewalPeriod)
        ? agreement.renewalPeriod
        : undefined,
    renewalReminderDays:
      agreement.autoRenew && agreement.renewalReminderDays != null && agreement.renewalReminderDays >= 0
        ? Math.round(agreement.renewalReminderDays)
        : undefined,
    trackPerformance: Boolean(agreement.trackPerformance),
    kpiReviewFrequency:
      agreement.trackPerformance &&
      agreement.kpiReviewFrequency &&
      CLIENT_SLA_KPI_FREQUENCIES.includes(agreement.kpiReviewFrequency)
        ? agreement.kpiReviewFrequency
        : undefined,
    slaSuccessTarget:
      agreement.trackPerformance && agreement.slaSuccessTarget != null
        ? Math.min(100, Math.max(0, agreement.slaSuccessTarget))
        : undefined,
    alertBeforeBreach:
      agreement.trackPerformance &&
      agreement.alertBeforeBreach &&
      CLIENT_SLA_BREACH_ALERTS.includes(agreement.alertBeforeBreach)
        ? agreement.alertBeforeBreach
        : undefined,
    hasExceptions: Boolean(agreement.hasExceptions),
    exceptionDetails: agreement.hasExceptions ? trimOptional(agreement.exceptionDetails) : undefined,
    exceptionAppliesTo: agreement.hasExceptions ? trimOptional(agreement.exceptionAppliesTo) : undefined,
    exceptionApprovalRequired: agreement.hasExceptions ? Boolean(agreement.exceptionApprovalRequired) : undefined,
    internalNotes: trimOptional(agreement.internalNotes),
  }

  if (!isSlaAgreementEngaged(normalized)) return undefined
  return normalized
}

export function syncLegacyClientSla(agreement?: ClientSlaAgreement): ClientSla | undefined {
  if (!agreement?.level) return undefined
  return LEGACY_SLA_BY_LEVEL[agreement.level]
}

export function slaAgreementFromLegacySla(sla?: ClientSla): ClientSlaAgreement | undefined {
  if (!sla) return undefined
  const level = (Object.entries(LEGACY_SLA_BY_LEVEL).find(([, legacy]) => legacy === sla)?.[0] ??
    undefined) as ClientSlaLevel | undefined
  return level ? { level } : undefined
}

export function resolveClientSlaAgreement(client: {
  slaAgreement?: ClientSlaAgreement
  sla?: ClientSla
}): ClientSlaAgreement | undefined {
  return client.slaAgreement ?? slaAgreementFromLegacySla(client.sla)
}
