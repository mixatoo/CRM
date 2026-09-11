import { useId } from 'react'
import { cn } from '@/shared/utils/cn'

interface AppLogoMarkProps {
  size?: number
  className?: string
  title?: string
}

export function AppLogoMark({ size = 32, className, title = 'Egyliere OPs' }: AppLogoMarkProps) {
  const uid = useId().replace(/:/g, '')
  const accentId = `egyliere-logo-accent-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={accentId} x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${accentId})`} />
      <path
        d="M10 10h10.5M10 16h7.5M10 22h10.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M10 10v12" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
