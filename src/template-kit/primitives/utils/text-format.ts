function capitalizeSegment(segment: string): string {
  if (!segment) return segment
  if (segment.includes("'")) {
    return segment
      .split("'")
      .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
      .join("'")
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
}

function capitalizeWord(word: string): string {
  return word
    .split(/(-)/)
    .map((part) => (part === '-' ? part : capitalizeSegment(part)))
    .join('')
}

/** Title-case for person / company names. Preserves internal spacing; trims ends. */
export function toTitleCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return trimmed.split(/\s+/).map(capitalizeWord).join(' ')
}

/** Title-case completed words while typing; keeps the active word editable and preserves a trailing space. */
export function formatNameWhileTyping(value: string): string {
  const withoutLead = value.replace(/^\s+/, '')
  const trailingSpace = withoutLead.endsWith(' ') ? ' ' : ''
  const collapsed = withoutLead.trimEnd()
  if (!collapsed) return trailingSpace

  const parts = collapsed.split(/\s+/)
  const formatted = parts.map((part, index) => {
    const isActiveWord = index === parts.length - 1 && !trailingSpace
    if (!part) return part
    if (isActiveWord) {
      return part.charAt(0).toLocaleUpperCase() + part.slice(1)
    }
    return capitalizeWord(part)
  })

  return `${formatted.join(' ')}${trailingSpace}`
}

/** Normalize a name field that may contain multiple names (collapses extra spaces). */
export function normalizeNameField(value?: string | null): string {
  const trimmed = value?.trim().replace(/\s+/g, ' ') ?? ''
  return trimmed ? toTitleCase(trimmed) : ''
}

/** Uppercase for free-text notes fields across the app. */
export function formatNotesText(value: string): string {
  return value.toUpperCase()
}
