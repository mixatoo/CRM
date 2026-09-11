import * as ToastPrimitive from '@radix-ui/react-toast'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Info,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/shared/utils/cn'

export type ToastIntent = 'deleted' | 'cloned' | 'updated' | 'failed' | 'info'

/** @deprecated Use `intent` instead */
type ToastType = 'default' | 'success' | 'error' | 'warning'

export interface ToastInput {
  title: string
  description?: string
  intent?: ToastIntent
  /** @deprecated Maps to intent when `intent` is omitted */
  type?: ToastType
  cta?: { label: string; onClick: () => void }
}

interface ToastItem extends ToastInput {
  id: string
}

interface ToastContextValue {
  toast: (item: ToastInput) => void
  dismiss: (id?: string) => void
}

interface ToastStateContextValue {
  queue: ToastItem[]
  dismiss: (id?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
const ToastStateContext = createContext<ToastStateContextValue | null>(null)

const DEBOUNCE_MS = 350
const CTA_DURATION = 30_000
const MAX_VISIBLE = 4
const COUNTDOWN_RADIUS = 9
const COUNTDOWN_CIRCUMFERENCE = 2 * Math.PI * COUNTDOWN_RADIUS

const TOAST_DURATION: Record<ToastIntent, number> = {
  deleted: 5000,
  cloned: 5000,
  updated: 4500,
  failed: 10_000,
  info: 5000,
}

const INTENT_META: Record<
  ToastIntent,
  {
    icon: LucideIcon
    tag: string
    accent: string
    glow: string
    ring: string
    iconColor: string
  }
> = {
  updated: {
    icon: CheckCircle2,
    tag: 'Saved',
    accent: 'bg-[var(--color-success)]',
    glow: 'shadow-[inset_3px_0_0_var(--color-success),0_20px_50px_-12px_rgba(22,163,74,0.35)]',
    ring: 'stroke-[var(--color-success)]',
    iconColor: 'text-[var(--color-success)]',
  },
  cloned: {
    icon: Copy,
    tag: 'Copied',
    accent: 'bg-[var(--color-accent)]',
    glow: 'shadow-[inset_3px_0_0_var(--color-accent),0_20px_50px_-12px_rgba(37,99,235,0.35)]',
    ring: 'stroke-[var(--color-accent)]',
    iconColor: 'text-[var(--color-accent)]',
  },
  deleted: {
    icon: Trash2,
    tag: 'Removed',
    accent: 'bg-[var(--color-danger)]',
    glow: 'shadow-[inset_3px_0_0_var(--color-danger),0_20px_50px_-12px_rgba(220,38,38,0.3)]',
    ring: 'stroke-[var(--color-danger)]',
    iconColor: 'text-[var(--color-danger)]',
  },
  failed: {
    icon: AlertCircle,
    tag: 'Error',
    accent: 'bg-[var(--color-danger)]',
    glow: 'shadow-[inset_3px_0_0_var(--color-danger),0_24px_60px_-12px_rgba(220,38,38,0.45)]',
    ring: 'stroke-[var(--color-danger)]',
    iconColor: 'text-[var(--color-danger)]',
  },
  info: {
    icon: Info,
    tag: 'Notice',
    accent: 'bg-[var(--color-info)]',
    glow: 'shadow-[inset_3px_0_0_var(--color-info),0_20px_50px_-12px_rgba(8,145,178,0.3)]',
    ring: 'stroke-[var(--color-info)]',
    iconColor: 'text-[var(--color-info)]',
  },
}

function resolveIntent(item: Pick<ToastInput, 'intent' | 'type'>): ToastIntent {
  if (item.intent) return item.intent
  if (item.type === 'error') return 'failed'
  if (item.type === 'success') return 'info'
  if (item.type === 'warning') return 'failed'
  return 'info'
}

function toastSignature(item: Pick<ToastInput, 'intent' | 'type' | 'title' | 'description'>) {
  return `${resolveIntent(item)}::${item.title}::${item.description ?? ''}`
}

function getDuration(item: ToastItem): number {
  if (item.cta) return CTA_DURATION
  return TOAST_DURATION[resolveIntent(item)]
}

function ToastCountdownRing({ duration, ringClass }: { duration: number; ringClass: string }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      className="pointer-events-none absolute inset-0 -rotate-90"
      aria-hidden
    >
      <circle
        cx="13"
        cy="13"
        r={COUNTDOWN_RADIUS}
        fill="none"
        className="stroke-white/10"
        strokeWidth="2"
      />
      <circle
        cx="13"
        cy="13"
        r={COUNTDOWN_RADIUS}
        fill="none"
        className={cn(
          'toast-countdown-ring group-hover/toast:[animation-play-state:paused] group-focus-within/toast:[animation-play-state:paused]',
          ringClass,
        )}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={COUNTDOWN_CIRCUMFERENCE}
        style={{
          animationDuration: `${duration}ms`,
          ['--toast-ring-circumference' as string]: `${COUNTDOWN_CIRCUMFERENCE}`,
        }}
      />
    </svg>
  )
}

function SignalToast({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  const intent = resolveIntent(item)
  const meta = INTENT_META[intent]
  const Icon = meta.icon
  const duration = getDuration(item)

  return (
    <ToastPrimitive.Root
      duration={duration}
      className={cn(
        'group/toast pointer-events-auto relative w-full overflow-hidden rounded-[var(--radius-lg)]',
        'border border-white/[0.08] bg-[var(--color-sidebar)] text-[var(--color-sidebar-text-strong)]',
        meta.glow,
        'data-[state=open]:animate-toast-slide-in data-[state=closed]:animate-toast-slide-out',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
        'data-[swipe=end]:animate-toast-slide-out',
      )}
      onOpenChange={(open) => {
        if (!open) onDismiss(item.id)
      }}
    >
      <div className={cn('absolute inset-y-0 left-0 w-[3px]', meta.accent)} aria-hidden />

      <div className="flex gap-3 px-3.5 py-3.5 pr-3">
        <div className="mt-0.5 shrink-0">
          <Icon className={cn('h-4 w-4', meta.iconColor)} strokeWidth={2.25} aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <span
            className={cn(
              'font-mono text-[10px] font-semibold uppercase tracking-[0.14em]',
              meta.iconColor,
            )}
          >
            {meta.tag}
          </span>

          <ToastPrimitive.Title className="text-sm font-semibold leading-snug text-[var(--color-sidebar-text-strong)]">
            {item.title}
          </ToastPrimitive.Title>

          {item.description ? (
            <ToastPrimitive.Description className="text-xs leading-relaxed text-[var(--color-sidebar-text)]">
              {item.description}
            </ToastPrimitive.Description>
          ) : null}

          {item.cta ? (
            <button
              type="button"
              className={cn(
                'mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-white/90 transition-colors',
                'hover:text-white',
              )}
              onClick={() => {
                item.cta?.onClick()
                onDismiss(item.id)
              }}
            >
              {item.cta.label}
              <ArrowRight className="h-3 w-3" aria-hidden />
            </button>
          ) : null}
        </div>

        <ToastPrimitive.Close asChild>
          <button
            type="button"
            aria-label="Dismiss"
            className={cn(
              'relative flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full',
              'text-[var(--color-sidebar-text)] transition-colors hover:text-white',
            )}
          >
            <ToastCountdownRing duration={duration} ringClass={meta.ring} />
            <X className="relative h-3 w-3" strokeWidth={2.5} aria-hidden />
          </button>
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  )
}

/** Fixed bottom-right toast stack — "Ops Signal" notifications. */
export function ToastHost() {
  const state = useContext(ToastStateContext)
  if (!state) return null

  const { queue, dismiss } = state

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={240} label="Notifications">
      <ToastPrimitive.Viewport
        className={cn(
          'fixed bottom-4 right-4 z-[200] flex w-[min(calc(100vw-2rem),22rem)] flex-col-reverse gap-2.5',
          'm-0 max-h-[min(80vh,28rem)] list-none overflow-hidden p-0 outline-none',
          '[&>li]:m-0 [&>li]:w-full [&>li]:list-none',
          queue.length === 0 && 'pointer-events-none',
        )}
      />

      {queue.map((item) => (
        <SignalToast key={item.id} item={item} onDismiss={dismiss} />
      ))}
    </ToastPrimitive.Provider>
  )
}

/** @deprecated Use ToastHost — kept for import compatibility */
export const HeaderToastHost = ToastHost

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([])
  const lastShownRef = useRef<{ signature: string; at: number } | null>(null)

  const dismiss = useCallback((id?: string) => {
    if (id) {
      setQueue((prev) => prev.filter((item) => item.id !== id))
      return
    }
    setQueue([])
  }, [])

  const toast = useCallback((item: ToastInput) => {
    const signature = toastSignature(item)
    const now = Date.now()
    const last = lastShownRef.current

    if (last && last.signature === signature && now - last.at < DEBOUNCE_MS) {
      return
    }

    lastShownRef.current = { signature, at: now }

    const entry: ToastItem = { ...item, id: crypto.randomUUID() }
    setQueue((prev) => [entry, ...prev].slice(0, MAX_VISIBLE))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastStateContext.Provider value={{ queue, dismiss }}>
        {children}
        <ToastHost />
      </ToastStateContext.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
