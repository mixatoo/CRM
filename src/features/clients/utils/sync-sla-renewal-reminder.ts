import { appContainer } from '@/app/container'
import type { Client } from '@/domain/entities/client'
import { clientPrimaryLabel } from '@/domain/entities/client'
import { computeSlaRenewalReminderDate, resolveClientSlaAgreement } from '@/domain/entities/client-sla'
import { nextReminderReference } from '@/infrastructure/database/reminder-seed'

const SLA_RENEWAL_TITLE_PREFIX = 'SLA renewal — '

function slaRenewalTitle(clientReference: string): string {
  return `${SLA_RENEWAL_TITLE_PREFIX}${clientReference}`
}

async function findExistingSlaRenewalReminder(clientReference: string) {
  const reminders = await appContainer.uow.reminders.findAll()
  const title = slaRenewalTitle(clientReference)
  return reminders.find((reminder) => reminder.title === title && reminder.category === 'client') ?? null
}

export async function syncClientSlaRenewalReminder(client: Client): Promise<void> {
  const agreement = resolveClientSlaAgreement(client)
  const existing = await findExistingSlaRenewalReminder(client.reference)

  if (!agreement?.autoRenew || !agreement.expiryDate || agreement.renewalReminderDays == null) {
    if (existing && existing.status === 'open') {
      await appContainer.uow.reminders.update(existing.id, {
        status: 'canceled',
        updatedAt: new Date().toISOString(),
      })
    }
    return
  }

  const dueAt = computeSlaRenewalReminderDate(agreement.expiryDate, agreement.renewalReminderDays)
  if (!dueAt) {
    if (existing && existing.status === 'open') {
      await appContainer.uow.reminders.update(existing.id, {
        status: 'canceled',
        updatedAt: new Date().toISOString(),
      })
    }
    return
  }

  const dueTime = new Date(dueAt).getTime()
  if (dueTime <= Date.now()) {
    if (existing && existing.status === 'open') {
      await appContainer.uow.reminders.update(existing.id, {
        status: 'canceled',
        updatedAt: new Date().toISOString(),
      })
    }
    return
  }

  const description = [
    `Client: ${clientPrimaryLabel(client)}`,
    `SLA expires: ${agreement.expiryDate}`,
    agreement.renewalPeriod ? `Renewal period: ${agreement.renewalPeriod.replace('_', '-')}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const payload = {
    title: slaRenewalTitle(client.reference),
    description,
    status: 'open' as const,
    priority: 'normal' as const,
    category: 'client' as const,
    dueAt,
  }

  if (existing) {
    await appContainer.uow.reminders.update(existing.id, {
      ...payload,
      updatedAt: new Date().toISOString(),
    })
    return
  }

  const now = new Date().toISOString()
  const reference = await nextReminderReference()
  await appContainer.uow.reminders.create({
    ...payload,
    reference,
    createdAt: now,
    updatedAt: now,
  })
}
