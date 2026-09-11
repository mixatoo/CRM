import { useCallback, useRef, useState } from 'react'
import type { Trip } from '@/domain/entities'
import type { TripService } from '@/domain/entities/trip-service'
import { DataTableShell } from '@/design-system/layout/DataTableShell'
import { TripServiceDetailPanel } from '@/features/trips/components/services/TripServiceDetailPanel'
import { TripServiceDetailToolbar } from '@/features/trips/components/services/TripServiceDetailToolbar'
import {
  TripServiceEditorForm,
  type TripServiceEditorActions,
} from '@/features/trips/components/services/TripServiceEditorForm'

interface TripServiceDetailTabProps {
  trip: Trip
  service: TripService
}

export function TripServiceDetailTab({ trip, service }: TripServiceDetailTabProps) {
  const saveRef = useRef<(() => void) | undefined>(undefined)
  const [editorDirty, setEditorDirty] = useState(false)
  const [editorSaving, setEditorSaving] = useState(false)

  const handleActionsChange = useCallback((actions: TripServiceEditorActions) => {
    saveRef.current = actions.save
    setEditorDirty((current) => (current === actions.isDirty ? current : actions.isDirty))
    setEditorSaving((current) => (current === actions.isSaving ? current : actions.isSaving))
  }, [])

  const isEditableCategory = service.category !== 'flight'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DataTableShell
        className="h-full min-h-0 flex-1"
        header={
          <TripServiceDetailToolbar
            tripId={trip.id}
            service={service}
            activeView="overview"
            onSave={isEditableCategory ? () => saveRef.current?.() : undefined}
            canSave={editorDirty && !editorSaving}
            isSaving={editorSaving}
          />
        }
        headerClassName="p-0"
        contentClassName="overflow-y-auto overscroll-contain"
      >
        <div className="p-3 sm:p-4">
          {isEditableCategory ? (
            <TripServiceEditorForm tripId={trip.id} service={service} onActionsChange={handleActionsChange} />
          ) : (
            <TripServiceDetailPanel service={service} />
          )}
        </div>
      </DataTableShell>
    </div>
  )
}
