import { createContext, useContext, type ReactNode } from 'react'

const ClientFormProfileLayoutContext = createContext(false)

export function ClientFormProfileLayoutProvider({ children }: { children: ReactNode }) {
  return (
    <ClientFormProfileLayoutContext.Provider value={true}>{children}</ClientFormProfileLayoutContext.Provider>
  )
}

export function useClientFormProfileLayout() {
  return useContext(ClientFormProfileLayoutContext)
}
