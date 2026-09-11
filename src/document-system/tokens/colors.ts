/**
 * Warm neutral palette — comfortable for long reading & print.
 * Inspired by premium travel / hospitality brands: soft stone + muted teal.
 */
export const DOC_COLORS = {
  ink: '#292524',
  inkSoft: '#57534E',
  muted: '#78716C',
  subtle: '#A8A29E',
  paper: '#FEFDFB',
  canvas: '#FAF9F7',
  surface: '#F5F4F1',
  surfaceAlt: '#EEEDEA',
  border: '#E7E5E4',
  borderLight: '#F0EEEB',
  accent: '#0F766E',
  accentDeep: '#115E59',
  accentSoft: '#E6F4F3',
  brand: '#1E3A4C',
  brandSoft: '#E8EEF2',
  success: '#047857',
  successSoft: '#ECFDF5',
  warning: '#B45309',
  warningSoft: '#FFFBEB',
  danger: '#BE123C',
  dangerSoft: '#FFF1F2',
  white: '#FFFFFF',
} as const

export type DocColorKey = keyof typeof DOC_COLORS

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized
  const num = Number.parseInt(value, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

export const DOC_RGB = Object.fromEntries(
  Object.entries(DOC_COLORS).map(([key, hex]) => [key, hexToRgb(hex)]),
) as Record<DocColorKey, [number, number, number]>
