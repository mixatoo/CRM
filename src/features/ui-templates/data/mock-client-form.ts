import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'
import { EMPTY_CLIENT_FORM } from '@/features/clients/components/ClientProfileFields'

export function createMockClientForm(overrides?: Partial<ClientFormInput>): ClientFormInput {
  return { ...EMPTY_CLIENT_FORM, ...overrides }
}
