import { db } from '@/infrastructure/database/db'
import type { ClientCreditCard } from '@/domain/entities/client-credit-card'
import type { ClientCreditCardRepository } from '@/repositories/interfaces'
import { createGenericRepository } from '@/repositories/implementations/dexie-repositories'

type LegacyClientCreditCard = ClientCreditCard & { cardholderName?: string; nickname?: string }

function normalizeLegacyClientCreditCard(card: LegacyClientCreditCard): ClientCreditCard {
  if (card.cardName?.trim()) return card

  const cardName = card.nickname?.trim() || card.cardholderName?.trim() || undefined
  if (!cardName) return card

  return { ...card, cardName }
}

export class DexieClientCreditCardRepository implements ClientCreditCardRepository {
  private generic = createGenericRepository<ClientCreditCard>(db.clientCreditCards, 'CCD')

  findAll() {
    return this.generic.findAll()
  }

  findById(id: string) {
    return this.generic.findById(id)
  }

  create(data: Omit<ClientCreditCard, 'id'>) {
    return this.generic.create(data)
  }

  update(id: string, data: Partial<ClientCreditCard>) {
    return this.generic.update(id, data)
  }

  delete(id: string) {
    return this.generic.delete(id)
  }

  async findByClientId(clientId: string) {
    const cards = await db.clientCreditCards.where('clientId').equals(clientId).toArray()
    return cards
      .map((card) => normalizeLegacyClientCreditCard(card as LegacyClientCreditCard))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async deleteByClientId(clientId: string) {
    const cards = await db.clientCreditCards.where('clientId').equals(clientId).toArray()
    await Promise.all(cards.map((card) => db.clientCreditCards.delete(card.id)))
  }
}

