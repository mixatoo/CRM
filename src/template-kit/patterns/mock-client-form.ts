import type { ClientFormInput } from '../stubs/use-client-mutations'
import { EMPTY_CLIENT_FORM } from '../stubs/ClientProfileFields'

export function createMockClientForm(overrides?: Partial<ClientFormInput>): ClientFormInput {
  return { ...EMPTY_CLIENT_FORM, ...overrides }
}
