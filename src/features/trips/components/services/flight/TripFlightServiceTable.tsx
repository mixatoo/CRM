import { ChevronDown, Plane } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { DataTableEmptyRow } from '@/design-system/components/DataTableEmptyState'
import type { FlightTripType } from '@/domain/entities/trip-service-flight'
import { normalizeFlightTicket } from '@/domain/entities/trip-service-flight'
import {
  CABIN_CLASS_OPTIONS,
  FLIGHT_AIRLINE_OPTIONS,
  flightSegmentShortLabel,
  PASSENGER_TITLE_OPTIONS,
} from '@/domain/entities/trip-service-flight'
import { DataTableColumnHeader } from '@/design-system/components/DataTableColumnHeader'
import { StickyDataTable } from '@/design-system/components/StickyDataTable'
import {
  tableSelectionCellClass,
  tableSelectionHeadClass,
} from '@/design-system/components/table-styles'
import { TableRowCheckbox } from '@/features/trips/components/list/TableRowCheckbox'
import { FlightTableDateTimeField, FlightTableInput, FlightTableOptionSelect } from '@/features/trips/components/services/flight/FlightFormField'
import {
  FLIGHT_SERVICE_TABLE_COLUMN_ORDER,
  FLIGHT_SERVICE_TABLE_MIN_WIDTH_CLASS,
  FLIGHT_SERVICE_TABLE_SELECTION_COL_WIDTH,
  FlightServiceTableColgroup,
  type FlightServiceTableColumnKey,
} from '@/features/trips/components/services/flight/flight-service-table-columns'
import {
  FlightSegmentDragHandle,
  FlightSegmentTableDnD,
  SortableFlightSegmentRow,
} from '@/features/trips/components/services/flight/flight-segment-sortable'
import {
  countPassengerSegments,
  type AnnotatedFlightSegmentRow,
} from '@/features/trips/components/services/flight/flight-segment-rows'
import { TripFlightSegmentRowActions, type TicketRowOperation } from '@/features/trips/components/services/flight/TripFlightSegmentRowActions'
import type { TicketOperationContext } from '@/domain/flight/transitions'
import {
  flightTableActionsCellClass,
  flightTableActionsHeadClass,
  flightTableEditCellClass,
  FLIGHT_TABLE_HEAD_CLASS,
  FLIGHT_TABLE_SCROLL_INSET_X,
} from '@/features/trips/components/services/flight/flight-table-styles'
import type { TripRowSelection } from '@/features/trips/hooks/use-trip-row-selection'
import type { FlightServiceDetailsFormValues } from '@/features/trips/schemas/flight-service.schema'
import {
  canAddFlightSegment,
  canRemoveFlightSegment,
  canRemoveFlightTicketAt,
  canReorderFlightSegments,
} from '@/features/trips/utils/flight-service'
import { formatCount } from '@/features/trips/utils/format'
import type { TableColumnVisibility } from '@/shared/hooks/use-table-column-visibility'
import { cn } from '@/shared/utils/cn'

const ROW_CELL = 'py-2'

interface TripFlightServiceTableProps {
  tripType: FlightTripType
  readOnly: boolean
  control: Control<FlightServiceDetailsFormValues>
  register: UseFormRegister<FlightServiceDetailsFormValues>
  passengers: FlightServiceDetailsFormValues['passengers']
  pageRows: AnnotatedFlightSegmentRow[]
  isEmpty: boolean
  errors?: FieldErrors<FlightServiceDetailsFormValues>['passengers']
  selection: TripRowSelection
  collapsedPassengerIds: ReadonlySet<string>
  onTogglePassengerCollapse: (passengerId: string) => void
  onRemoveRow: (passengerIndex: number, ticketIndex: number, segmentIndex: number) => void
  onRemoveTicket: (passengerIndex: number, ticketIndex: number) => void
  onMoveSegment: (passengerIndex: number, ticketIndex: number, segmentIndex: number, direction: 'up' | 'down') => void
  onDragSegment?: (activeSegmentId: string, overSegmentId: string) => void
  onAddSegmentAt: (passengerIndex: number, ticketIndex: number) => void
  onCloneSegment: (passengerIndex: number, ticketIndex: number, segmentIndex: number) => void
  onTicketOperation?: (passengerIndex: number, ticketIndex: number, operation: TicketRowOperation) => void
  onOpenTicketDetails?: (passengerIndex: number, ticketIndex: number) => void
  ticketOperationContext?: TicketOperationContext
  defaultCurrency?: string
  columnVisibility: TableColumnVisibility<FlightServiceTableColumnKey>
}

export function TripFlightServiceTable({
  tripType,
  readOnly,
  control,
  register,
  passengers,
  pageRows,
  isEmpty,
  errors,
  selection,
  collapsedPassengerIds,
  onTogglePassengerCollapse,
  onRemoveRow,
  onRemoveTicket,
  onMoveSegment,
  onDragSegment,
  onAddSegmentAt,
  onCloneSegment,
  onTicketOperation,
  onOpenTicketDetails,
  ticketOperationContext,
  defaultCurrency = 'EGP',
  columnVisibility,
}: TripFlightServiceTableProps) {
  const { isVisible } = columnVisibility
  const visibleKeys = useMemo(
    () => new Set(FLIGHT_SERVICE_TABLE_COLUMN_ORDER.filter((key) => isVisible(key))),
    [isVisible],
  )
  const visibleColCount = visibleKeys.size
  const show = isVisible

  const {
    allPageSelected,
    somePageSelected,
    isDragSelecting,
    isSelected,
    togglePage,
    handleSelectionPointerDown,
    handleSelectionPointerEnter,
    handleSelectionClick,
  } = selection

  const dragEnabled = !readOnly && pageRows.length > 0 && Boolean(onDragSegment)
  const segmentIds = pageRows.map((row) => row.segmentId)

  const rowBody = isEmpty ? (
    <DataTableEmptyRow
      colSpan={visibleColCount}
      icon={Plane}
      title="No flight segments yet"
      description="Add a passenger or segment to start building this itinerary."
    />
  ) : (
    pageRows.map((row) => {
            const {
              passengerIndex,
              ticketIndex,
              segmentIndex,
              rowNumber,
              segmentId,
              isFirstPassengerOnPage,
              passengerRowSpanOnPage,
              isFirstTicketOnPage,
              ticketRowSpanOnPage,
              isSegmentIndented,
            } = row
            const passenger = passengers[passengerIndex]
            const passengerSegmentTotal = countPassengerSegments(passengers, passengerIndex)
            const passengerCollapsed = passenger ? collapsedPassengerIds.has(passenger.id) : false
            const hiddenSegmentCount = passengerCollapsed ? passengerSegmentTotal - 1 : 0
            const passengerPath = `passengers.${passengerIndex}` as const
            const ticketPath = `${passengerPath}.tickets.${ticketIndex}` as const
            const segmentPath = `${ticketPath}.segments.${segmentIndex}` as const
            const ticket = passengers[passengerIndex]?.tickets[ticketIndex]
            const segments = ticket?.segments ?? []
            const segmentErrors = errors?.[passengerIndex]?.tickets?.[ticketIndex]?.segments?.[segmentIndex]
            const passengerErrors = errors?.[passengerIndex]
            const ticketErrors = errors?.[passengerIndex]?.tickets?.[ticketIndex]
            const minDepartureDate = segmentIndex > 0 ? segments[segmentIndex - 1]?.departureDate : undefined
            const showLeg = segments.length > 1
            const canMove = canReorderFlightSegments(tripType, segments.length)
            const canRemoveSegment = canRemoveFlightSegment(tripType, segments.length)
            const canRemoveTicket = canRemoveFlightTicketAt(
              passengers as unknown as import('@/domain/entities/trip-service-flight').FlightPassenger[],
              passengerIndex,
              ticketIndex,
            )
            const canAdd = canAddFlightSegment(tripType, segments.length)
            const selected = isSelected(segmentId)
            const passengerGroupSingleRow = passengerRowSpanOnPage === 1
            const passengerCellAlign = passengerGroupSingleRow ? 'align-middle' : 'align-top'

            const rowClassName = cn(
              'group/flight-row border-b border-[var(--color-border)] last:border-0',
              isSegmentIndented && 'bg-[var(--color-surface-muted)]/20',
              selected && 'bg-[var(--color-accent-muted)]/55 hover:bg-[var(--color-accent-muted)]/70',
            )

            const rowCells = (
              <>
                <td
                  className={tableSelectionCellClass(
                    cn('py-2', selected && 'bg-[var(--color-accent-muted)]/60', isDragSelecting && 'cursor-grabbing'),
                  )}
                  data-flight-row-selection=""
                  data-segment-id={segmentId}
                  onPointerDown={(event) => {
                    if (readOnly) return
                    event.stopPropagation()
                    handleSelectionPointerDown(segmentId, event.button)
                  }}
                  onPointerEnter={() => {
                    if (!readOnly) handleSelectionPointerEnter(segmentId)
                  }}
                  onClick={(event) => {
                    if (readOnly) return
                    event.stopPropagation()
                    handleSelectionClick(segmentId, event.shiftKey)
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <TableRowCheckbox
                    checked={selected}
                    disabled={readOnly}
                    onChange={(shiftKey) => handleSelectionClick(segmentId, shiftKey ?? false)}
                    aria-label={`Select segment ${rowNumber}`}
                  />
                </td>

                <td className={flightTableEditCellClass('center', cn('font-mono text-xs text-[var(--color-accent)]', ROW_CELL))}>
                  {isFirstPassengerOnPage ? <input type="hidden" {...register(`${passengerPath}.id`)} /> : null}
                  {isFirstTicketOnPage ? (
                    <>
                      <input type="hidden" {...register(`${ticketPath}.id`)} />
                      <input type="hidden" {...register(`${ticketPath}.ticketNumber`)} />
                      <input type="hidden" {...register(`${ticketPath}.fareClass`)} />
                      <input type="hidden" {...register(`${ticketPath}.baggageAllowance`)} />
                      <input type="hidden" {...register(`${ticketPath}.seats`)} />
                      <input type="hidden" {...register(`${ticketPath}.clientId`)} />
                      <input type="hidden" {...register(`${ticketPath}.status`)} />
                    </>
                  ) : null}
                  <input type="hidden" {...register(`${segmentPath}.id`)} />
                  <div className="flex items-center justify-center gap-0.5">
                    <FlightSegmentDragHandle disabled={readOnly || !dragEnabled} />
                    <span>{formatCount(rowNumber)}</span>
                  </div>
                </td>

                {show('title') && isFirstPassengerOnPage ? (
                  <td
                    rowSpan={passengerRowSpanOnPage}
                    className={flightTableEditCellClass('left', cn(passengerCellAlign, ROW_CELL))}
                  >
                    <Controller
                      control={control}
                      name={`${passengerPath}.passengerTitle`}
                      render={({ field }) => (
                        <FlightTableOptionSelect
                          id={`${passengerPath}-title`}
                          aria-label="Passenger type"
                          options={PASSENGER_TITLE_OPTIONS}
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          readOnly={readOnly}
                          error={passengerErrors?.passengerTitle?.message}
                        />
                      )}
                    />
                  </td>
                ) : null}

                {show('passenger') && isFirstPassengerOnPage ? (
                  <td
                    rowSpan={passengerRowSpanOnPage}
                    className={flightTableEditCellClass(
                      'left',
                      cn(
                        passengerCellAlign,
                        'border-r border-[var(--color-border)]/70 bg-[var(--color-surface-muted)]/20',
                        ROW_CELL,
                      ),
                    )}
                  >
                    <div className={cn('flex min-w-0 gap-1', passengerGroupSingleRow ? 'items-center' : 'items-start')}>
                      {passengerSegmentTotal > 1 && passenger ? (
                        <button
                          type="button"
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted)]',
                            'hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]',
                            !passengerGroupSingleRow && 'mt-0.5',
                          )}
                          onClick={() => onTogglePassengerCollapse(passenger.id)}
                          aria-label={passengerCollapsed ? 'Expand passenger segments' : 'Collapse passenger segments'}
                          aria-expanded={!passengerCollapsed}
                          title={
                            passengerCollapsed
                              ? `Expand ${hiddenSegmentCount} hidden segments`
                              : 'Collapse segments'
                          }
                        >
                          <ChevronDown
                            className={cn('h-3.5 w-3.5 transition-transform', passengerCollapsed && '-rotate-90')}
                          />
                        </button>
                      ) : (
                        <span className={cn('w-5 shrink-0', !passengerGroupSingleRow && 'mt-0.5')} aria-hidden />
                      )}
                      <div className="min-w-0 flex-1">
                        <FlightTableInput
                          id={`${passengerPath}-passenger`}
                          placeholder="PASSENGER"
                          className="font-medium"
                          showFullValueOnHover
                          readOnly={readOnly}
                          error={passengerErrors?.passengerName?.message}
                          {...register(`${passengerPath}.passengerName`)}
                        />
                        {passengerSegmentTotal > 1 && !passengerGroupSingleRow ? (
                          <p className="mt-1 text-[10px] uppercase text-[var(--color-muted)]">
                            {passengerSegmentTotal} SEGMENTS
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                ) : null}

                {show('pnr') && isFirstTicketOnPage ? (
                  <td
                    rowSpan={ticketRowSpanOnPage}
                    className={flightTableEditCellClass('left', cn(passengerCellAlign, ROW_CELL))}
                  >
                    <FlightTableInput
                      id={`${ticketPath}-pnr`}
                      placeholder="PNR"
                      className="font-mono"
                      showFullValueOnHover
                      readOnly={readOnly}
                      error={ticketErrors?.pnr?.message}
                      {...register(`${ticketPath}.pnr`)}
                    />
                  </td>
                ) : null}

                {show('flight') ? (
                <td className={flightTableEditCellClass('left', ROW_CELL)}>
                  <div className="flex min-w-0 items-center gap-1">
                    {showLeg ? (
                      <span
                        className="shrink-0 font-mono text-[10px] font-semibold text-[var(--color-muted)]"
                        title="Leg"
                      >
                        {flightSegmentShortLabel(tripType, segmentIndex, segments.length)}
                      </span>
                    ) : null}
                    <FlightTableInput
                      id={`${segmentPath}-flight-number`}
                      placeholder="FLIGHT"
                      className="min-w-0 flex-1 font-mono"
                      showFullValueOnHover
                      readOnly={readOnly}
                      error={segmentErrors?.flightNumber?.message}
                      {...register(`${segmentPath}.flightNumber`)}
                    />
                  </div>
                </td>
                ) : null}

                {show('from') ? (
                <td className={flightTableEditCellClass('left', ROW_CELL)}>
                  <FlightTableInput
                    id={`${segmentPath}-from`}
                    placeholder="FROM"
                    className="font-mono"
                    maxLength={3}
                    readOnly={readOnly}
                    error={segmentErrors?.departureAirport?.message}
                    {...register(`${segmentPath}.departureAirport`)}
                  />
                </td>
                ) : null}

                {show('to') ? (
                <td className={flightTableEditCellClass('left', ROW_CELL)}>
                  <FlightTableInput
                    id={`${segmentPath}-to`}
                    placeholder="TO"
                    className="font-mono"
                    maxLength={3}
                    readOnly={readOnly}
                    error={segmentErrors?.arrivalAirport?.message}
                    {...register(`${segmentPath}.arrivalAirport`)}
                  />
                </td>
                ) : null}

                {show('depDateTime') ? (
                <td className={flightTableEditCellClass('left', ROW_CELL)}>
                  <Controller
                    control={control}
                    name={`${segmentPath}.departureDate`}
                    render={({ field }) => (
                      <FlightTableDateTimeField
                        kind="departure"
                        idPrefix={`${segmentPath}-departure`}
                        dateAriaLabel="Departure"
                        dateValue={field.value}
                        onDateChange={field.onChange}
                        onDateBlur={field.onBlur}
                        minDate={minDepartureDate}
                        readOnly={readOnly}
                        dateError={segmentErrors?.departureDate?.message}
                        timeError={segmentErrors?.departureTime?.message}
                        timeInputProps={register(`${segmentPath}.departureTime`)}
                      />
                    )}
                  />
                </td>
                ) : null}

                {show('arrDateTime') ? (
                <td className={flightTableEditCellClass('left', ROW_CELL)}>
                  <Controller
                    control={control}
                    name={`${segmentPath}.arrivalDate`}
                    render={({ field }) => (
                      <FlightTableDateTimeField
                        kind="arrival"
                        idPrefix={`${segmentPath}-arrival`}
                        dateAriaLabel="Arrival"
                        dateValue={field.value}
                        onDateChange={field.onChange}
                        onDateBlur={field.onBlur}
                        minDate={minDepartureDate}
                        readOnly={readOnly}
                        dateError={segmentErrors?.arrivalDate?.message}
                        timeError={segmentErrors?.arrivalTime?.message}
                        timeInputProps={register(`${segmentPath}.arrivalTime`)}
                      />
                    )}
                  />
                </td>
                ) : null}

                {show('cabin') ? (
                <td className={flightTableEditCellClass('left', ROW_CELL)}>
                  <Controller
                    control={control}
                    name={`${segmentPath}.cabinClass`}
                    render={({ field }) => (
                      <FlightTableOptionSelect
                        id={`${segmentPath}-cabin`}
                        aria-label="Class"
                        options={CABIN_CLASS_OPTIONS}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        readOnly={readOnly}
                        error={segmentErrors?.cabinClass?.message}
                      />
                    )}
                  />
                </td>
                ) : null}

                {show('airline') ? (
                <td className={flightTableEditCellClass('left', ROW_CELL)}>
                  <Controller
                    control={control}
                    name={`${segmentPath}.airline`}
                    render={({ field }) => (
                      <FlightTableOptionSelect
                        id={`${segmentPath}-airline`}
                        aria-label="Airline"
                        options={FLIGHT_AIRLINE_OPTIONS}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        readOnly={readOnly}
                        error={segmentErrors?.airline?.message}
                      />
                    )}
                  />
                </td>
                ) : null}

                <td className={flightTableActionsCellClass(ROW_CELL)} data-flight-row-action="" onClick={(event) => event.stopPropagation()}>
                  <Controller
                    control={control}
                    name={`${segmentPath}.segmentStatus`}
                    render={({ field }) => (
                      <TripFlightSegmentRowActions
                        readOnly={readOnly}
                        segmentLabel={String(rowNumber)}
                        segmentStatus={field.value ?? ''}
                        onSegmentStatusChange={field.onChange}
                        onSegmentStatusBlur={field.onBlur}
                        statusError={segmentErrors?.segmentStatus?.message}
                        canAdd={canAdd}
                        canClone={canAdd}
                        canMoveUp={canMove && segmentIndex > 0}
                        canMoveDown={canMove && segmentIndex < segments.length - 1}
                        isTicketHeadRow={segmentIndex === 0}
                        canRemoveSegment={canRemoveSegment}
                        canRemoveTicket={canRemoveTicket}
                        ticketSegmentCount={segments.length}
                        ticketLabel={ticket?.pnr}
                        ticket={
                          ticket && passengers[passengerIndex]
                            ? normalizeFlightTicket(ticket, passengers[passengerIndex].id, defaultCurrency)
                            : undefined
                        }
                        ticketOperationContext={ticketOperationContext}
                        onAdd={() => onAddSegmentAt(passengerIndex, ticketIndex)}
                        onClone={() => onCloneSegment(passengerIndex, ticketIndex, segmentIndex)}
                        onMoveUp={() => onMoveSegment(passengerIndex, ticketIndex, segmentIndex, 'up')}
                        onMoveDown={() => onMoveSegment(passengerIndex, ticketIndex, segmentIndex, 'down')}
                        onRemoveSegment={() => onRemoveRow(passengerIndex, ticketIndex, segmentIndex)}
                        onRemoveTicket={() => onRemoveTicket(passengerIndex, ticketIndex)}
                        onTicketOperation={
                          segmentIndex === 0
                            ? (operation) => onTicketOperation?.(passengerIndex, ticketIndex, operation)
                            : undefined
                        }
                        onOpenTicketDetails={
                          segmentIndex === 0
                            ? () => onOpenTicketDetails?.(passengerIndex, ticketIndex)
                            : undefined
                        }
                      />
                    )}
                  />
                </td>
              </>
            )

            if (dragEnabled) {
              return (
                <SortableFlightSegmentRow
                  key={segmentId}
                  segmentId={segmentId}
                  className={rowClassName}
                  data-selected={selected ? 'true' : undefined}
                >
                  {rowCells}
                </SortableFlightSegmentRow>
              )
            }

            return (
              <tr key={segmentId} data-selected={selected ? 'true' : undefined} className={rowClassName}>
                {rowCells}
              </tr>
            )
          })
  )

  return (
    <StickyDataTable
      fill
      className={FLIGHT_TABLE_SCROLL_INSET_X}
      freezeLeadingColumns={2}
      freezeLeadingColumnWidth={FLIGHT_SERVICE_TABLE_SELECTION_COL_WIDTH}
      tableClassName={cn('w-full table-fixed text-sm', FLIGHT_SERVICE_TABLE_MIN_WIDTH_CLASS, isDragSelecting && 'select-none')}
    >
      <FlightServiceTableColgroup visibleKeys={visibleKeys} />
      <thead>
        <tr>
          <th
            className={tableSelectionHeadClass(undefined, true)}
            data-flight-row-selection=""
            onClick={(event) => {
              if (readOnly) return
              event.stopPropagation()
              togglePage()
            }}
          >
            <TableRowCheckbox
              checked={allPageSelected}
              indeterminate={somePageSelected}
              disabled={readOnly}
              onChange={() => togglePage()}
              aria-label={allPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
            />
          </th>
          <DataTableColumnHeader label="#" sortable={false} align="center" className={FLIGHT_TABLE_HEAD_CLASS} compact />
          {show('title') ? (
            <DataTableColumnHeader label="Title" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          {show('passenger') ? (
            <DataTableColumnHeader label="Passenger" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          {show('pnr') ? (
            <DataTableColumnHeader label="PNR" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          {show('flight') ? (
            <DataTableColumnHeader label="Flight" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          {show('from') ? (
            <DataTableColumnHeader label="From" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          {show('to') ? (
            <DataTableColumnHeader label="To" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          {show('depDateTime') ? (
            <DataTableColumnHeader label="Dep" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          {show('arrDateTime') ? (
            <DataTableColumnHeader label="Arr" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          {show('cabin') ? (
            <DataTableColumnHeader label="Class" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          {show('airline') ? (
            <DataTableColumnHeader label="Airline" sortable={false} className={FLIGHT_TABLE_HEAD_CLASS} compact />
          ) : null}
          <DataTableColumnHeader
            label="Actions"
            sortable={false}
            align="center"
            className={flightTableActionsHeadClass(FLIGHT_TABLE_HEAD_CLASS)}
            compact
          />
        </tr>
      </thead>
      <FlightSegmentTableDnD
        segmentIds={segmentIds}
        dragEnabled={dragEnabled}
        onDragSegment={(activeId, overId) => onDragSegment?.(activeId, overId)}
      >
        <tbody>{rowBody}</tbody>
      </FlightSegmentTableDnD>
    </StickyDataTable>
  )
}
