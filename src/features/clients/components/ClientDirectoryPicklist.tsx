import { useMemo } from 'react'
import { clientPrimaryLabel, type Client } from '@/domain/entities/client'
import { ClientStatusBadge } from '@/features/clients/components/ClientStatusBadge'
import { useClients } from '@/features/clients/hooks/use-clients'
import { FormPicklist, type FormPicklistOption } from '@/design-system/components/FormPicklist'

interface ClientDirectoryPicklistProps {
  value: string
  onChange: (clientId: string) => void
  onClientSelect?: (client: Client | null) => void
  disabled?: boolean
}

export function ClientDirectoryPicklist({
  value,
  onChange,
  onClientSelect,
  disabled,
}: ClientDirectoryPicklistProps) {
  const { data: clients = [], isLoading } = useClients()

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => clientPrimaryLabel(a).localeCompare(clientPrimaryLabel(b))),
    [clients],
  )

  const options: FormPicklistOption[] = useMemo(
    () =>
      sortedClients.map((client) => ({
        value: client.id,
        label: `${client.reference} · ${clientPrimaryLabel(client)}`,
        description: [client.email, client.city, client.country].filter(Boolean).join(' · ') || undefined,
        badge: <ClientStatusBadge status={client.status} className="shrink-0 scale-90" />,
      })),
    [sortedClients],
  )

  const handleChange = (clientId: string) => {
    onChange(clientId)
    if (!clientId) {
      onClientSelect?.(null)
      return
    }
    const client = sortedClients.find((row) => row.id === clientId) ?? null
    onClientSelect?.(client)
  }

  return (
    <FormPicklist
      value={value}
      onChange={handleChange}
      options={options}
      emptyOption={{ value: '', label: 'No client selected' }}
      placeholder="Select client from directory"
      panelTitle="Client directory"
      ariaLabel="Client from directory"
      disabled={disabled}
      searchable
      searchPlaceholder="Search by name, reference, email…"
      loading={isLoading}
    />
  )
}
