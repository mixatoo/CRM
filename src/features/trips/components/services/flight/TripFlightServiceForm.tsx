import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TripService } from '@/domain/entities/trip-service'
import type { FlightPassenger, FlightServiceDetails } from '@/domain/entities/trip-service-flight'
import {
  cloneFlightSegments,
  createEmptyFlightPassenger,
  createEmptyFlightTicket,
  defaultFlightServiceDetails,
  migrateFlightServiceDetails,
  normalizeFlightTicket,
  refreshFlightServiceDetails,
  executeTicketOperation,
  validateTicketOperation,
  reverseTicketTransaction,
} from '@/domain/entities/trip-service-flight'
import { extractTransactionSeed, transactionTypeToOperation } from '@/features/trips/utils/transaction-correction'
import type { TicketOperation } from '@/domain/flight/transitions'
import { useToast } from '@/design-system/components/Toast'
import { Pagination } from '@/design-system/components/Pagination'
import { TripFlightServiceTable } from '@/features/trips/components/services/flight/TripFlightServiceTable'
import { TripFlightServiceToolbar } from '@/features/trips/components/services/flight/TripFlightServiceToolbar'
import { FlightTicketImportDialog } from '@/features/trips/components/services/flight/FlightTicketImportDialog'
import {
  FlightOperationModal,
  type FlightOperationType,
} from '@/features/trips/components/services/flight/FlightOperationModal'
import { FlightTicketDetailDrawer } from '@/features/trips/components/services/flight/FlightTicketDetailDrawer'
import type { TicketRowOperation } from '@/features/trips/components/services/flight/TripFlightSegmentRowActions'
import { useAuthStore } from '@/features/auth/store/auth-store'
import {
  annotateFlightPageRows,
  filterCollapsedSegmentRows,
  flattenFlightSegmentRows,
  getCollapsiblePassengerIds,
  lastFlightSegmentRef,
  paginateFlightSegmentRows,
  withVisibleRowNumbers,
} from '@/features/trips/components/services/flight/flight-segment-rows'
import { useTripRowSelection } from '@/features/trips/hooks/use-trip-row-selection'
import {
  flightServiceDetailsSchema,
  type FlightServiceDetailsFormValues,
} from '@/features/trips/schemas/flight-service.schema'
import {
  canAddFlightSegment,
  clearAllFlightTableData,
  countFlightTableRows,
  moveFlightSegment,
  moveFlightSegmentByDrag,
  removeFlightSegmentAt,
  removeFlightSegmentsByIds,
  removeFlightTicketAt,
  appendFlightSegmentAt,
  cloneFlightSegmentAt,
} from '@/features/trips/utils/flight-service'
import { useSaveFlightDetails } from '@/features/trips/hooks/use-update-trip-service'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useTableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import { useUndoKeyboard } from '@/shared/hooks/use-undo-keyboard'
import { useUndoStack } from '@/shared/hooks/use-undo-stack'
import { TRIP_FLIGHT_SEGMENTS_PAGE_SIZE_STORAGE_KEY } from '@/types/pagination'
import { TRIP_FLIGHT_SEGMENTS_COLUMNS_STORAGE_KEY } from '@/types/table-columns'
import { TableColumnPicker } from '@/design-system/components/TableColumnPicker'
import { FLIGHT_SERVICE_TABLE_COLUMN_OPTIONS } from '@/features/trips/components/services/flight/flight-service-table-columns'
import { cn } from '@/shared/utils/cn'

interface TripFlightServiceFormProps {
  service: TripService
}

function toFormValues(service: TripService): FlightServiceDetailsFormValues {
  if (service.flightDetails) {
    return migrateFlightServiceDetails(service.flightDetails, service.currency) as FlightServiceDetailsFormValues
  }
  return defaultFlightServiceDetails('one_way', service.currency) as FlightServiceDetailsFormValues
}

function clonePassengers(passengers: FlightServiceDetailsFormValues['passengers']) {
  return passengers.map((passenger) => ({
    ...passenger,
    tickets: passenger.tickets.map((ticket) => ({
      ...ticket,
      segments: [...ticket.segments],
    })),
  }))
}

function snapshotPassengers(passengers: FlightServiceDetailsFormValues['passengers']) {
  return structuredClone(passengers)
}

export function TripFlightServiceForm({ service }: TripFlightServiceFormProps) {
  const { toast } = useToast()
  const { page, pageSize, setPage, setPageSize } = usePagination({
    persistKey: TRIP_FLIGHT_SEGMENTS_PAGE_SIZE_STORAGE_KEY,
  })
  const segmentColumnVisibility = useTableColumnVisibility(
    TRIP_FLIGHT_SEGMENTS_COLUMNS_STORAGE_KEY,
    FLIGHT_SERVICE_TABLE_COLUMN_OPTIONS,
  )

  const [isReadOnly, setIsReadOnly] = useState(false)
  const { saveFlightDetails, isPending: isSaving } = useSaveFlightDetails(service.tripId, service)

  const {
    control,
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FlightServiceDetailsFormValues>({
    resolver: zodResolver(flightServiceDetailsSchema),
    defaultValues: toFormValues(service),
    mode: 'onBlur',
  })

  const { append: appendPassenger, replace: replacePassengers } = useFieldArray({
    control,
    name: 'passengers',
  })

  const [collapsedPassengerIds, setCollapsedPassengerIds] = useState<Set<string>>(() => new Set())
  const [importOpen, setImportOpen] = useState(false)
  const [operationOpen, setOperationOpen] = useState(false)
  const [operation, setOperation] = useState<FlightOperationType | null>(null)
  const [operationSeed, setOperationSeed] = useState<unknown>(null)
  const [operationTicketRef, setOperationTicketRef] = useState<{ passengerIndex: number; ticketIndex: number } | null>(
    null,
  )
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [detailTicketRef, setDetailTicketRef] = useState<{ passengerIndex: number; ticketIndex: number } | null>(null)
  const { push: pushSegmentDragUndo, undo: undoSegmentDrag, canUndo: canUndoSegmentDrag, clear: clearSegmentDragUndo } =
    useUndoStack<FlightServiceDetailsFormValues['passengers']>()
  const user = useAuthStore((state) => state.user)

  const bookingPnr = watch('bookingPnr')
  const tripType = watch('tripType')
  const passengers = watch('passengers')
  const domainPassengers = passengers as unknown as FlightPassenger[]

  const activeCollapsedPassengerIds = useMemo(() => {
    const passengerIds = new Set(passengers.map((passenger) => passenger.id))
    return new Set([...collapsedPassengerIds].filter((id) => passengerIds.has(id)))
  }, [collapsedPassengerIds, passengers])

  const collapsiblePassengerIds = useMemo(
    () => getCollapsiblePassengerIds(passengers),
    [passengers],
  )

  const canToggleCollapseAll = collapsiblePassengerIds.length > 0

  const hasCollapsedPassengers = useMemo(
    () => collapsiblePassengerIds.some((id) => activeCollapsedPassengerIds.has(id)),
    [collapsiblePassengerIds, activeCollapsedPassengerIds],
  )

  const allRows = useMemo(() => flattenFlightSegmentRows(passengers), [passengers])
  const visibleRows = useMemo(
    () => withVisibleRowNumbers(filterCollapsedSegmentRows(allRows, passengers, activeCollapsedPassengerIds)),
    [allRows, passengers, activeCollapsedPassengerIds],
  )
  const total = visibleRows.length
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const pageRows = useMemo(
    () => annotateFlightPageRows(paginateFlightSegmentRows(visibleRows, page, pageSize)),
    [visibleRows, page, pageSize],
  )
  const pageRowIds = useMemo(() => pageRows.map((row) => row.segmentId), [pageRows])
  const allRowIds = useMemo(() => allRows.map((row) => row.segmentId), [allRows])
  const tableStats = useMemo(() => countFlightTableRows(domainPassengers), [domainPassengers])
  const selection = useTripRowSelection(pageRowIds)

  useEffect(() => {
    reset(toFormValues(service))
    clearSegmentDragUndo()
  }, [service, reset, clearSegmentDragUndo])

  useEffect(() => {
    setIsReadOnly(false)
    clearSegmentDragUndo()
  }, [service.id, clearSegmentDragUndo])

  useEffect(() => {
    if (isReadOnly) {
      selection.clear()
      clearSegmentDragUndo()
    }
  }, [isReadOnly, selection.clear, clearSegmentDragUndo])

  useEffect(() => {
    selection.clear()
  }, [service.id, selection.clear])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages, setPage])

  const handleAddPassenger = () => {
    appendPassenger(createEmptyFlightPassenger(tripType, {}, service.currency))
    if (total === 0) setPage(1)
  }

  const handleAddSegmentAt = (passengerIndex: number, ticketIndex: number) => {
    const ticket = passengers[passengerIndex]?.tickets[ticketIndex]
    if (!ticket) return

    if (canAddFlightSegment(tripType, ticket.segments.length)) {
      const next = appendFlightSegmentAt(domainPassengers, passengerIndex, ticketIndex)
      if (next) setValue('passengers', next as FlightServiceDetailsFormValues['passengers'], { shouldDirty: true })
      return
    }

    const next = clonePassengers(passengers)
    const passenger = passengers[passengerIndex]
    next[passengerIndex].tickets.push(
      createEmptyFlightTicket(passenger.id, tripType, {
        segments: ticket.segments.length ? cloneFlightSegments(ticket.segments) : undefined,
      }, service.currency),
    )
    setValue('passengers', next, { shouldDirty: true })
  }

  const handleAddSegment = () => {
    if (passengers.length === 0) {
      appendPassenger(createEmptyFlightPassenger(tripType, {}, service.currency))
      setPage(1)
      return
    }

    if (selection.selectedCount === 1) {
      const selectedId = [...selection.selectedIds][0]
      const row = allRows.find((entry) => entry.segmentId === selectedId)
      if (row) {
        handleAddSegmentAt(row.passengerIndex, row.ticketIndex)
        return
      }
    }

    const ref = lastFlightSegmentRef(passengers)
    if (!ref) {
      appendPassenger(createEmptyFlightPassenger(tripType, {}, service.currency))
      setPage(1)
      return
    }

    handleAddSegmentAt(ref.passengerIndex, ref.ticketIndex)
  }

  const handleRemoveRow = (passengerIndex: number, ticketIndex: number, segmentIndex: number) => {
    replacePassengers(
      removeFlightSegmentAt(domainPassengers, passengerIndex, ticketIndex, segmentIndex, tripType) as FlightServiceDetailsFormValues['passengers'],
    )
    selection.clear()
  }

  const handleRemoveTicket = (passengerIndex: number, ticketIndex: number) => {
    replacePassengers(
      removeFlightTicketAt(domainPassengers, passengerIndex, ticketIndex, tripType) as FlightServiceDetailsFormValues['passengers'],
    )
    selection.clear()
  }

  const handleBulkDelete = () => {
    if (selection.selectedCount === 0) return
    replacePassengers(
      removeFlightSegmentsByIds(domainPassengers, selection.selectedIds, tripType) as FlightServiceDetailsFormValues['passengers'],
    )
    selection.clear()
    setPage(1)
  }

  const handleClearAll = () => {
    replacePassengers(clearAllFlightTableData() as FlightServiceDetailsFormValues['passengers'])
    setCollapsedPassengerIds(new Set())
    selection.clear()
    clearSegmentDragUndo()
    setPage(1)
  }

  const handleSelectAllRows = () => {
    selection.selectAll(allRowIds)
  }

  const handleTogglePassengerCollapse = (passengerId: string) => {
    setCollapsedPassengerIds((current) => {
      const next = new Set(current)
      if (next.has(passengerId)) next.delete(passengerId)
      else next.add(passengerId)
      return next
    })
    selection.clear()
  }

  const handleToggleCollapseAll = () => {
    setCollapsedPassengerIds(
      hasCollapsedPassengers ? new Set() : new Set(collapsiblePassengerIds),
    )
    selection.clear()
  }

  const handleCloneSegment = (passengerIndex: number, ticketIndex: number, segmentIndex: number) => {
    const next = cloneFlightSegmentAt(domainPassengers, passengerIndex, ticketIndex, segmentIndex, tripType)
    if (next) replacePassengers(next as FlightServiceDetailsFormValues['passengers'])
    selection.clear()
  }

  const handleMoveSegment = (
    passengerIndex: number,
    ticketIndex: number,
    segmentIndex: number,
    direction: 'up' | 'down',
  ) => {
    const next = clonePassengers(passengers)
    const segments = next[passengerIndex].tickets[ticketIndex].segments
    next[passengerIndex].tickets[ticketIndex].segments = moveFlightSegment(segments, segmentIndex, direction)
    setValue('passengers', next, { shouldDirty: true })
  }

  const handleDragSegment = (activeSegmentId: string, overSegmentId: string) => {
    const fromRow = visibleRows.find((row) => row.segmentId === activeSegmentId)
    const toRow = visibleRows.find((row) => row.segmentId === overSegmentId)
    if (!fromRow || !toRow) return

    const next = moveFlightSegmentByDrag(
      domainPassengers,
      {
        passengerIndex: fromRow.passengerIndex,
        ticketIndex: fromRow.ticketIndex,
        segmentIndex: fromRow.segmentIndex,
      },
      {
        passengerIndex: toRow.passengerIndex,
        ticketIndex: toRow.ticketIndex,
        segmentIndex: toRow.segmentIndex,
      },
      tripType,
    )

    if (!next) {
      toast({
        intent: 'failed',
        title: 'Cannot move segment',
        description:
          tripType === 'round_trip'
            ? 'Round-trip segments can only be reordered within the same ticket.'
            : 'This move would break the ticket segment rules for the selected trip type.',
      })
      return
    }

    pushSegmentDragUndo(snapshotPassengers(passengers))
    replacePassengers(next as FlightServiceDetailsFormValues['passengers'])
    selection.clear()
  }

  const handleUndoSegmentDrag = useCallback(() => {
    const previous = undoSegmentDrag()
    if (!previous) return

    replacePassengers(previous)
    selection.clear()
    toast({
      intent: 'info',
      title: 'Move undone',
      description: 'Segment order restored. Press Ctrl+Z again to undo earlier moves.',
    })
  }, [replacePassengers, undoSegmentDrag, selection, toast])

  useUndoKeyboard({
    enabled: !isReadOnly,
    canUndo: canUndoSegmentDrag,
    onUndo: handleUndoSegmentDrag,
  })

  const handleEdit = () => {
    setIsReadOnly(false)
  }

  const handleImportPassenger = (passenger: FlightPassenger) => {
    appendPassenger(passenger as FlightServiceDetailsFormValues['passengers'][number])
    setIsReadOnly(false)
    setPage(1)
    selection.clear()
  }

  const operationTicket = useMemo(() => {
    if (!operationTicketRef) return null
    const passenger = passengers[operationTicketRef.passengerIndex]
    const ticket = passenger?.tickets[operationTicketRef.ticketIndex]
    if (!passenger || !ticket) return null
    return normalizeFlightTicket(ticket, passenger.id, service.currency)
  }, [operationTicketRef, passengers, service.currency])

  const detailPassenger = useMemo(() => {
    if (!detailTicketRef) return null
    return domainPassengers[detailTicketRef.passengerIndex] ?? null
  }, [detailTicketRef, domainPassengers])

  const detailTicket = useMemo(() => {
    if (!detailTicketRef || !detailPassenger) return null
    const ticket = detailPassenger.tickets[detailTicketRef.ticketIndex]
    if (!ticket) return null
    return normalizeFlightTicket(ticket, detailPassenger.id, service.currency)
  }, [detailTicketRef, detailPassenger, service.currency])

  const ticketOperationContext = useMemo(
    () => ({
      serviceStatus: service.status,
      userRole: user?.role,
    }),
    [service.status, user?.role],
  )

  const handleTicketOperation = (
    passengerIndex: number,
    ticketIndex: number,
    ticketOperation: TicketRowOperation,
  ) => {
    const passenger = passengers[passengerIndex]
    const rawTicket = passenger?.tickets[ticketIndex]
    if (!passenger || !rawTicket) return

    const ticket = normalizeFlightTicket(rawTicket, passenger.id, service.currency)
    const gate = validateTicketOperation(ticket, ticketOperation as TicketOperation, ticketOperationContext)
    if (!gate.ok) {
      toast({
        intent: 'failed',
        title: 'Operation not available',
        description: gate.error.message,
      })
      return
    }

    setOperationTicketRef({ passengerIndex, ticketIndex })
    setOperationSeed(null)
    setOperation(ticketOperation as FlightOperationType)
    setOperationOpen(true)
  }

  const handleOpenTicketDetails = (passengerIndex: number, ticketIndex: number) => {
    setDetailTicketRef({ passengerIndex, ticketIndex })
    setDetailDrawerOpen(true)
  }

  const handleDetailTicketChange = (ticket: ReturnType<typeof normalizeFlightTicket>) => {
    if (!detailTicketRef) return
    const next = clonePassengers(passengers)
    const passenger = next[detailTicketRef.passengerIndex]
    if (!passenger) return
    passenger.tickets[detailTicketRef.ticketIndex] = ticket as FlightServiceDetailsFormValues['passengers'][number]['tickets'][number]
    setValue('passengers', next, { shouldDirty: true })
    setIsReadOnly(false)
  }

  const handleDetailOperation = (op: FlightOperationType) => {
    if (!detailTicketRef) return
    setOperationSeed(null)
    handleTicketOperation(detailTicketRef.passengerIndex, detailTicketRef.ticketIndex, op)
  }

  const buildCurrentFlightDetails = useCallback((): FlightServiceDetails => {
    return refreshFlightServiceDetails(
      migrateFlightServiceDetails(
        {
          tripType,
          passengers: domainPassengers,
          bookingPnr,
        },
        service.currency,
      ),
      service.currency,
    )
  }, [tripType, domainPassengers, bookingPnr, service.currency])

  const persistFlightDetails = useCallback(
    (details: FlightServiceDetails, options?: { onSuccess?: () => void }) => {
      setValue('passengers', details.passengers as FlightServiceDetailsFormValues['passengers'], { shouldDirty: true })
      saveFlightDetails(details, options)
    },
    [setValue, saveFlightDetails],
  )

  const handleReverseTransaction = (transactionId: string, reason: string) => {
    if (!detailTicketRef) return
    const ticketId = passengers[detailTicketRef.passengerIndex]?.tickets[detailTicketRef.ticketIndex]?.id
    if (!ticketId) return

    const result = reverseTicketTransaction(buildCurrentFlightDetails(), ticketId, transactionId, reason, {
      ...ticketOperationContext,
      userId: user?.id,
      userName: user?.name,
    })

    if (!result.ok) {
      toast({
        intent: 'failed',
        title: 'Could not reverse transaction',
        description: result.error.message,
      })
      return
    }

    persistFlightDetails(refreshFlightServiceDetails(result.value, service.currency), {
      onSuccess: () => {
        toast({
          intent: 'updated',
          title: 'Transaction reversed',
          description: 'Ledger entries were reversed. You can record the operation again if needed.',
        })
        setIsReadOnly(true)
      },
    })
  }

  const handleCorrectTransaction = (transactionId: string, reason: string) => {
    if (!detailTicketRef) return
    const passenger = passengers[detailTicketRef.passengerIndex]
    const rawTicket = passenger?.tickets[detailTicketRef.ticketIndex]
    if (!passenger || !rawTicket) return

    const ticket = normalizeFlightTicket(rawTicket, passenger.id, service.currency)
    const ticketId = ticket.id

    const txn = ticket.transactions.find((row) => row.id === transactionId)
    if (!txn) return

    const nextOperation = transactionTypeToOperation(txn.type)
    const seed = extractTransactionSeed(txn)
    if (!nextOperation || !seed) {
      toast({
        intent: 'failed',
        title: 'Cannot correct this transaction',
        description: 'This transaction type does not support correction.',
      })
      return
    }

    const result = reverseTicketTransaction(buildCurrentFlightDetails(), ticketId, transactionId, reason, {
      ...ticketOperationContext,
      userId: user?.id,
      userName: user?.name,
    })

    if (!result.ok) {
      toast({
        intent: 'failed',
        title: 'Could not start correction',
        description: result.error.message,
      })
      return
    }

    const refreshed = refreshFlightServiceDetails(result.value, service.currency)
    setValue('passengers', refreshed.passengers as FlightServiceDetailsFormValues['passengers'], { shouldDirty: true })
    setOperationTicketRef(detailTicketRef)
    setOperationSeed(seed)
    setOperation(nextOperation)
    setOperationOpen(true)

    saveFlightDetails(refreshed, {
      onSuccess: () => {
        setIsReadOnly(false)
      },
    })
  }

  const handleOperationConfirm = (op: FlightOperationType, data: unknown) => {
    if (!operationTicketRef) return

    const ticketId = passengers[operationTicketRef.passengerIndex]?.tickets[operationTicketRef.ticketIndex]?.id
    if (!ticketId) return

    const currentDetails = refreshFlightServiceDetails(
      migrateFlightServiceDetails(
        {
          tripType,
          passengers: domainPassengers,
          bookingPnr,
        },
        service.currency,
      ),
      service.currency,
    )

    const result = executeTicketOperation(currentDetails, ticketId, op as TicketOperation, data, {
      ...ticketOperationContext,
      userId: user?.id,
      userName: user?.name,
    })

    if (!result.ok) {
      toast({
        intent: 'failed',
        title: 'Could not complete operation',
        description: result.error.message,
      })
      return
    }

    const refreshed = refreshFlightServiceDetails(result.value, service.currency)
    setValue('passengers', refreshed.passengers as FlightServiceDetailsFormValues['passengers'], { shouldDirty: true })
    setOperationOpen(false)
    setOperation(null)
    setOperationSeed(null)
    setOperationTicketRef(null)
    if (detailTicketRef) {
      setDetailDrawerOpen(true)
    }

    saveFlightDetails(refreshed, {
      onSuccess: () => {
        setIsReadOnly(true)
        selection.clear()
      },
    })
  }

  const handleSave = handleSubmit((values) => {
    saveFlightDetails(values as unknown as FlightServiceDetails, {
      onSuccess: () => {
        setIsReadOnly(true)
        selection.clear()
      },
    })
  })

  const passengersError =
    typeof errors.passengers?.message === 'string' ? errors.passengers.message : errors.passengers?.root?.message

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TripFlightServiceToolbar
        readOnly={isReadOnly}
        isSaving={isSaving}
        canAddSegment
        canToggleCollapseAll={canToggleCollapseAll}
        hasCollapsedPassengers={hasCollapsedPassengers}
        hasTableData={tableStats.segmentCount > 0}
        tablePassengerCount={tableStats.passengerCount}
        tableTicketCount={tableStats.ticketCount}
        tableSegmentCount={tableStats.segmentCount}
        totalRowCount={total}
        allRowIds={allRowIds}
        selection={selection}
        pageRowCount={pageRows.length}
        onAddPassenger={handleAddPassenger}
        onAddSegment={handleAddSegment}
        onToggleCollapseAll={handleToggleCollapseAll}
        onSelectAllRows={handleSelectAllRows}
        onBulkDelete={handleBulkDelete}
        onClearAll={handleClearAll}
        onSave={handleSave}
        onEdit={handleEdit}
        onImportTicket={() => setImportOpen(true)}
        columnPicker={
          <TableColumnPicker columnVisibility={segmentColumnVisibility} />
        }
      />
      <input type="hidden" {...register('bookingPnr')} />

      <div className="min-h-0 flex-1 overflow-hidden">
        <TripFlightServiceTable
          tripType={tripType}
          readOnly={isReadOnly}
          control={control}
          register={register}
          passengers={passengers}
          pageRows={pageRows}
          isEmpty={total === 0}
          errors={errors.passengers}
          selection={selection}
          collapsedPassengerIds={activeCollapsedPassengerIds}
          onTogglePassengerCollapse={handleTogglePassengerCollapse}
          onRemoveRow={handleRemoveRow}
          onRemoveTicket={handleRemoveTicket}
          onMoveSegment={handleMoveSegment}
          onDragSegment={handleDragSegment}
          onAddSegmentAt={handleAddSegmentAt}
          onCloneSegment={handleCloneSegment}
          onTicketOperation={handleTicketOperation}
          onOpenTicketDetails={handleOpenTicketDetails}
          ticketOperationContext={ticketOperationContext}
          defaultCurrency={service.currency}
          columnVisibility={segmentColumnVisibility}
        />
      </div>

      <Pagination
        compact
        showWhenEmpty
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {passengersError ? (
        <p className={cn('shrink-0 border-t border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-danger)]')}>
          {passengersError}
        </p>
      ) : null}

      <FlightTicketImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        tripType={tripType}
        defaultCurrency={service.currency}
        onImport={handleImportPassenger}
      />
      <FlightTicketDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={(open) => {
          setDetailDrawerOpen(open)
          if (!open) setDetailTicketRef(null)
        }}
        ticket={detailTicket}
        passenger={detailPassenger}
        onTicketChange={handleDetailTicketChange}
        onOperation={handleDetailOperation}
        onReverseTransaction={handleReverseTransaction}
        onCorrectTransaction={handleCorrectTransaction}
        isReversingTransaction={isSaving}
        readOnly={isReadOnly}
        operationContext={ticketOperationContext}
        initialTab="ledger"
      />
      <FlightOperationModal
        open={operationOpen}
        onOpenChange={(open) => {
          setOperationOpen(open)
          if (!open) {
            setOperation(null)
            setOperationSeed(null)
            setOperationTicketRef(null)
          }
        }}
        operation={operation}
        ticket={operationTicket}
        operationSeed={operationSeed}
        isPending={isSaving}
        operationContext={ticketOperationContext}
        onConfirm={handleOperationConfirm}
      />
    </div>
  )
}
