import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { normalizeClientFormInput } from '@/domain/entities/client'
import type { ClientFormInput } from '@/features/clients/hooks/use-client-mutations'

function fieldValuesEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function getModifiedClientFormKeys(
  saved: ClientFormInput,
  current: ClientFormInput,
): Set<string> {
  const savedNorm = normalizeClientFormInput(saved)
  const currentNorm = normalizeClientFormInput(current)
  const keys = new Set<string>()

  for (const key of new Set([
    ...Object.keys(savedNorm),
    ...Object.keys(currentNorm),
  ])) {
    const typedKey = key as keyof ClientFormInput
    if (!fieldValuesEqual(savedNorm[typedKey], currentNorm[typedKey])) {
      keys.add(key)
    }
  }

  return keys
}

interface ClientFormModifiedContextValue {
  modifiedKeys: Set<string>
}

const ClientFormModifiedContext = createContext<ClientFormModifiedContextValue | null>(null)

export function useClientFormFieldState(fieldKey?: string) {
  const context = useContext(ClientFormModifiedContext)

  if (!fieldKey || !context) {
    return { isModified: false }
  }

  return {
    isModified: context.modifiedKeys.has(fieldKey),
  }
}

export function ClientFormModifiedProvider({
  savedForm,
  currentForm,
  children,
}: {
  savedForm: ClientFormInput
  currentForm: ClientFormInput
  children: ReactNode
}) {
  const modifiedKeys = useMemo(
    () => getModifiedClientFormKeys(savedForm, currentForm),
    [currentForm, savedForm],
  )

  const value = useMemo(() => ({ modifiedKeys }), [modifiedKeys])

  return (
    <ClientFormModifiedContext.Provider value={value}>{children}</ClientFormModifiedContext.Provider>
  )
}
