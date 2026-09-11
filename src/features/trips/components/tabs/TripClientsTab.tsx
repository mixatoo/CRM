import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import type { Trip } from '@/domain/entities'
import { clientPrimaryLabel } from '@/domain/entities/client'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { Input } from '@/design-system/components/Input'
import { FormPicklist } from '@/design-system/components/FormPicklist'
import { CrmFieldGrid, CrmInputCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTripWorkspaceMutations } from '@/features/trips/hooks/use-trip-workspace'
import { useClients, useClient } from '@/features/clients/hooks/use-clients'
import { ClientStatusBadge } from '@/features/clients/components/ClientStatusBadge'
import {
  compositeFieldClassName,
  formFieldPrefixClassName,
  formInputClassName,
} from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface TripClientsTabProps {
  trip: Trip
}

export function TripClientsTab({ trip }: TripClientsTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'order', 'update')
  const { updateTripAsync, isUpdating } = useTripWorkspaceMutations(trip.id)
  const { data: clients = [] } = useClients()
  const { data: linkedClient } = useClient(trip.clientId)

  const [clientId, setClientId] = useState('')
  const [mainContactName, setMainContactName] = useState('')
  const [mainContactEmail, setMainContactEmail] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [destination, setDestination] = useState('')

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => clientPrimaryLabel(a).localeCompare(clientPrimaryLabel(b))),
    [clients],
  )

  useEffect(() => {
    setClientId(trip.clientId ?? '')
    setMainContactName(trip.mainContactName ?? '')
    setMainContactEmail(trip.mainContactEmail ?? '')
    setAgentName(trip.agentName ?? '')
    setAgentEmail(trip.agentEmail ?? '')
    setDestination(trip.destination ?? '')
  }, [trip])

  const handleClientSelect = (nextClientId: string) => {
    setClientId(nextClientId)
    if (!nextClientId) return
    const client = clients.find((row) => row.id === nextClientId)
    if (!client) return
    setMainContactName(clientPrimaryLabel(client))
    setMainContactEmail(client.email ?? '')
  }

  const handleSave = () => {
    void updateTripAsync({
      clientId: clientId || undefined,
      mainContactName: mainContactName.trim() || undefined,
      mainContactEmail: mainContactEmail.trim() || undefined,
      agentName: agentName.trim() || undefined,
      agentEmail: agentEmail.trim() || undefined,
      destination: destination.trim() || undefined,
    })
  }

  return (
    <div className="space-y-3 p-3">
      <CrmPanel
        title="Directory client"
        actions={
          linkedClient ? (
            <Link
              to={`/clients/${linkedClient.id}/profile`}
              className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-accent)] hover:underline"
            >
              Open client
              <ExternalLink className="h-3 w-3" />
            </Link>
          ) : null
        }
      >
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Client record" className="sm:col-span-2">
            <FormPicklist
              value={clientId}
              onChange={handleClientSelect}
              options={sortedClients.map((client) => ({
                value: client.id,
                label: `${client.reference} · ${clientPrimaryLabel(client)}`,
              }))}
              placeholder="— No linked client —"
              emptyOption={{ value: '', label: '— No linked client —' }}
              panelTitle="Client record"
              ariaLabel="Client record"
              disabled={!canEdit}
              searchable
              searchPlaceholder="Search clients…"
            />
          </CrmInputCell>
          {linkedClient ? (
            <>
              <CrmInputCell label="Status">
                <div className="flex h-9 items-center">
                  <ClientStatusBadge status={linkedClient.status} />
                </div>
              </CrmInputCell>
              <CrmInputCell label="Reference">
                <Input value={linkedClient.reference} className={formInputClassName} disabled />
              </CrmInputCell>
            </>
          ) : null}
        </CrmFieldGrid>
      </CrmPanel>

      <CrmPanel title="Primary client contact">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Client name">
            <div className={compositeFieldClassName}>
              <span className={formFieldPrefixClassName}>Name</span>
              <Input
                value={mainContactName}
                onChange={(event) => setMainContactName(event.target.value)}
                className={formInputClassName}
                disabled={!canEdit}
              />
            </div>
          </CrmInputCell>
          <CrmInputCell label="Client email">
            <div className={compositeFieldClassName}>
              <span className={formFieldPrefixClassName}>Email</span>
              <Input
                value={mainContactEmail}
                onChange={(event) => setMainContactEmail(event.target.value)}
                className={formInputClassName}
                disabled={!canEdit}
              />
            </div>
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      <CrmPanel title="Sales agent">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Agent name">
            <Input
              value={agentName}
              onChange={(event) => setAgentName(event.target.value)}
              className={formInputClassName}
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Agent email">
            <Input
              value={agentEmail}
              onChange={(event) => setAgentEmail(event.target.value)}
              className={formInputClassName}
              disabled={!canEdit}
            />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      <CrmPanel title="Trip context">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Destination">
            <Input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className={formInputClassName}
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Branch">
            <Input value={trip.branch} className={formInputClassName} disabled />
          </CrmInputCell>
          <CrmInputCell label="Owner">
            <Input value={trip.ownerName} className={formInputClassName} disabled />
          </CrmInputCell>
          <CrmInputCell label="Reference">
            <Input value={trip.reference} className={formInputClassName} disabled />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      {canEdit ? (
        <div className="flex justify-end">
          <Button type="button" size="sm" disabled={isUpdating} onClick={handleSave}>
            {isUpdating ? 'Saving…' : 'Save client details'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
