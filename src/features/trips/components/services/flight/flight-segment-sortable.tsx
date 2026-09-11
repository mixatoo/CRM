import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { createContext, useContext, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface SortableRowContextValue {
  attributes: ReturnType<typeof useSortable>['attributes']
  listeners: ReturnType<typeof useSortable>['listeners']
  isDragging: boolean
}

const SortableRowContext = createContext<SortableRowContextValue | null>(null)

export function FlightSegmentTableDnD({
  segmentIds,
  dragEnabled,
  onDragSegment,
  children,
}: {
  segmentIds: string[]
  dragEnabled: boolean
  onDragSegment: (activeSegmentId: string, overSegmentId: string) => void
  children: ReactNode
}) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    onDragSegment(String(active.id), String(over.id))
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  if (!dragEnabled) {
    return <>{children}</>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={segmentIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-accent)]/40 bg-[var(--color-surface)] px-3 py-2 text-xs font-medium text-[var(--color-foreground)] shadow-lg">
            Moving segment…
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export function SortableFlightSegmentRow({
  segmentId,
  disabled,
  className,
  children,
  ...rest
}: {
  segmentId: string
  disabled?: boolean
  className?: string
  children: ReactNode
} & ComponentPropsWithoutRef<'tr'>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: segmentId,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <SortableRowContext.Provider value={{ attributes, listeners, isDragging }}>
      <tr
        ref={setNodeRef}
        style={style}
        className={cn(className, isDragging && 'relative z-[1] opacity-50')}
        data-dragging={isDragging ? 'true' : undefined}
        {...rest}
      >
        {children}
      </tr>
    </SortableRowContext.Provider>
  )
}

export function FlightSegmentDragHandle({ disabled }: { disabled?: boolean }) {
  const context = useContext(SortableRowContext)

  if (!context || disabled) return null

  return (
    <button
      type="button"
      className={cn(
        'flex h-5 w-5 shrink-0 cursor-grab items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-subtle)]',
        'hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]',
        'active:cursor-grabbing',
        context.isDragging && 'cursor-grabbing text-[var(--color-accent)]',
      )}
      aria-label="Drag to reorder or move segment"
      {...context.attributes}
      {...context.listeners}
      onClick={(event) => event.stopPropagation()}
    >
      <GripVertical className="h-3.5 w-3.5" aria-hidden />
    </button>
  )
}
