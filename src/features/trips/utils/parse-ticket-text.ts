import type { FlightPassenger, FlightTripType } from '@/domain/entities/trip-service-flight'
import {
  createEmptyFlightPassenger,
  createEmptyFlightSegment,
  createEmptyFlightTicket,
} from '@/domain/entities/trip-service-flight'
import { displayDateToIso, normalizeTime24Input } from '@/shared/utils/date-format'
import { BASE_CURRENCY } from '@/domain/currency'

export interface ParsedTicketSegment {
  airline: string
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  departureDate: string
  departureTime: string
  arrivalDate: string
  arrivalTime: string
  cabinClass?: string
  segmentStatus?: string
}

export interface ParsedTicket {
  passengerTitle: string
  passengerName: string
  pnr: string
  ticketNumber: string
  segments: ParsedTicketSegment[]
  warnings: string[]
}

const AIRLINE_CODES: Record<string, string> = {
  MS: 'EgyptAir',
  EK: 'Emirates',
  TK: 'Turkish Airlines',
  NP: 'Nile Air',
  QR: 'Qatar Airways',
  SV: 'Saudia',
  EY: 'Etihad Airways',
  LH: 'Lufthansa',
  XY: 'Flynas',
  FZ: 'Flydubai',
  GF: 'Gulf Air',
  RJ: 'Royal Jordanian',
}

const PNR_BLOCKLIST = new Set([
  'NUMBER', 'TICKET', 'FLIGHT', 'STATUS', 'CLASS', 'ECONOMY', 'BUSINESS', 'RECORD', 'LOCATOR', 'BOOKING',
  'RECEIPT', 'ELECTR', 'EGYPT', 'AIRLINE', 'DEPART', 'ARRIVE', 'PASSEN', 'GENDER', 'FEMALE', 'MALE',
])

const KNOWN_IATA = new Set([
  'CAI', 'DXB', 'AUH', 'JED', 'RUH', 'MED', 'IST', 'SAW', 'DOH', 'BAH', 'KWI', 'AMM', 'LHR', 'CDG', 'FRA',
  'MUC', 'FCO', 'MXP', 'ATH', 'HRG', 'SSH', 'LXR', 'ASW', 'HBE', 'RMF', 'SPX', 'JFK', 'LAX', 'ORD',
])

const FLIGHT_CODE_BLOCKLIST = new Set(['AR', 'AT', 'TO', 'IN', 'ON', 'OR', 'IF', 'NO', 'US', 'IT', 'AN', 'TI', 'ME'])

export const SAMPLE_TICKET_TEXT = `ELECTRONIC TICKET RECEIPT
PASSENGER: HASSAN/AHMED MR
PNR: K7X9P2
TKT NUMBER: 176-2847193056
1 MS 702 Y 12AUG26 CAI DXB HK1 1430 1845 ECONOMY`

/** Normalize OCR / PDF text before parsing. */
export function preprocessTicketText(text: string): string {
  let out = text
    .replace(/\r/g, '\n')
    .replace(/[|]/g, ' ')
    .replace(/[‘’`]/g, "'")
    .replace(/[""]/g, '"')

  // Split glued tokens common in PDF extract: 12AUG26CAI -> 12AUG26 CAI
  out = out.replace(/(\d{1,2}[A-Z]{3}\d{0,4})([A-Z]{3})\b/gi, '$1 $2')
  // MS702CAI -> MS702 CAI
  out = out.replace(/\b([A-Z]{2}\d{2,4})([A-Z]{3})\b/gi, '$1 $2')
  // CAI-DXB, CAI/DXB, CAI→DXB
  out = out.replace(/\b([A-Z]{3})\s*[-/–>→]\s*([A-Z]{3})\b/gi, '$1 $2')

  out = out
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')

  // OCR: CAL -> CAI, DX8 -> DXB
  out = out.replace(/\bCAL\b/gi, 'CAI')
  out = out.replace(/\bDX8\b/gi, 'DXB')

  return out
}

function normalizeTitle(value: string | undefined): string {
  if (!value) return ''
  const upper = value.toUpperCase()
  if (upper === 'MSTR') return 'Mstr'
  return upper.charAt(0) + upper.slice(1).toLowerCase()
}

function normalizeIata(code: string): string {
  const raw = code.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const ocrFixed = raw
    .replace(/0/g, 'O')
    .replace(/1/g, 'I')
    .replace(/8/g, 'B')
  const mapped = ocrFixed === 'CAL' ? 'CAI' : ocrFixed
  const fixed = mapped.slice(0, 3)
  if (KNOWN_IATA.has(fixed)) return fixed
  return fixed
}

function normalizeFlightDigits(digits: string): string {
  return digits.replace(/O/g, '0').replace(/I/g, '1').replace(/S/g, '5')
}

function parseCompactDate(token: string): string {
  const compact = token.replace(/\s+/g, '').toUpperCase()
  if (/^\d{4}-\d{2}-\d{2}$/.test(compact)) return compact

  const spaced = token.trim().toUpperCase().replace(/\s+/g, ' ')
  const spacedMatch = spaced.match(/^(\d{1,2})\s+([A-Z]{3})\s*(\d{2,4})?$/)
  const source = spacedMatch ? `${spacedMatch[1]}${spacedMatch[2]}${spacedMatch[3] ?? ''}` : compact

  const match = source.match(/^(\d{1,2})([A-Z]{3})(\d{2,4})?$/)
  if (!match) {
    const slash = spaced.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/)
    if (slash) {
      const day = slash[1].padStart(2, '0')
      const month = slash[2].padStart(2, '0')
      const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3]
      return displayDateToIso(`${day}/${month}/${year}`) ?? ''
    }
    return ''
  }

  const day = match[1].padStart(2, '0')
  const monthMap: Record<string, string> = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
  }
  const month = monthMap[match[2]]
  if (!month) return ''

  const year = match[3]
    ? match[3].length === 2 ? `20${match[3]}` : match[3]
    : String(new Date().getFullYear())

  return displayDateToIso(`${day}/${month}/${year}`) ?? ''
}

function parseTimeToken(token: string | undefined): string {
  if (!token) return ''
  const cleaned = token.replace(/[^\d:]/g, '')
  const digits = cleaned.replace(/\D/g, '')
  if (digits.length === 3) return normalizeTime24Input(`${digits.slice(0, 1)}:${digits.slice(1)}`)
  if (digits.length === 4) return normalizeTime24Input(`${digits.slice(0, 2)}:${digits.slice(2)}`)
  return normalizeTime24Input(cleaned)
}

function segmentKey(segment: ParsedTicketSegment): string {
  return [segment.flightNumber, segment.departureAirport, segment.arrivalAirport, segment.departureDate].join('|')
}

function dedupeSegments(segments: ParsedTicketSegment[]): ParsedTicketSegment[] {
  const seen = new Set<string>()
  return segments.filter((segment) => {
    const key = segmentKey(segment)
    if (seen.has(key)) return false
    seen.add(key)
    return Boolean(segment.flightNumber || (segment.departureAirport && segment.arrivalAirport))
  })
}

function buildSegment(partial: Partial<ParsedTicketSegment> & { airlineCode?: string }): ParsedTicketSegment | null {
  const airlineCode = partial.airlineCode?.toUpperCase() ?? partial.flightNumber?.slice(0, 2).toUpperCase()
  let resolvedFlight = partial.flightNumber?.replace(/\s+/g, '').toUpperCase() ?? ''

  if (!resolvedFlight && airlineCode && partial.flightNumber) {
    resolvedFlight = `${airlineCode}${normalizeFlightDigits(partial.flightNumber)}`
  }

  const flightMatch = resolvedFlight.match(/^([A-Z]{2})-?(\d{1,4})$/)
  if (flightMatch) {
    resolvedFlight = `${flightMatch[1]}${normalizeFlightDigits(flightMatch[2])}`
  }

  const from = partial.departureAirport ? normalizeIata(partial.departureAirport) : ''
  const to = partial.arrivalAirport ? normalizeIata(partial.arrivalAirport) : ''

  if (!resolvedFlight && !(from && to)) return null

  const code = resolvedFlight.slice(0, 2) || airlineCode || ''
  return {
    airline: partial.airline || AIRLINE_CODES[code] || code,
    flightNumber: resolvedFlight,
    departureAirport: from,
    arrivalAirport: to,
    departureDate: partial.departureDate ?? '',
    departureTime: partial.departureTime ?? '',
    arrivalDate: partial.arrivalDate ?? partial.departureDate ?? '',
    arrivalTime: partial.arrivalTime ?? '',
    cabinClass: partial.cabinClass,
    segmentStatus: partial.segmentStatus ?? 'HK',
  }
}

function extractPassenger(text: string): { title: string; name: string } {
  const upper = text.toUpperCase()

  const labeled = upper.match(
    /\b(?:PASSENGER|PASSENGER\s+NAME|NAME|PAX|TRAVELLER|TRAVELER|GUEST)\s*[:#]?\s*(?:\d+\s+)?(?:([A-Z]{2,})\/([A-Z][A-Z\s.'-]+?))(?:\s+(MR|MRS|MS|MISS|DR|MSTR))?\b/,
  )
  if (labeled?.[1] && labeled[2]) {
    const name = `${labeled[2].trim()} ${labeled[1].trim()}`.replace(/\s+/g, ' ').toUpperCase()
    return { name, title: normalizeTitle(labeled[3]) }
  }

  const labeledPlain = upper.match(
    /\b(?:PASSENGER|NAME|PAX|TRAVELLER|TRAVELER|GUEST)\s*[:#]?\s*(?:\d+\s+)?([A-Z][A-Z\s.'-]{2,}?)(?:\s+(MR|MRS|MS|MISS|DR|MSTR))?\b/,
  )
  if (labeledPlain?.[1] && !labeledPlain[1].includes('/')) {
    return { name: labeledPlain[1].trim(), title: normalizeTitle(labeledPlain[2]) }
  }

  const titleFirst = upper.match(/\b(MR|MRS|MS|MISS|DR|MSTR)\s+([A-Z][A-Z\s.'-]{2,})\b/)
  if (titleFirst) {
    return { name: titleFirst[2].trim(), title: normalizeTitle(titleFirst[1]) }
  }

  for (const line of upper.split('\n')) {
    const slash = line.match(/\b([A-Z]{2,})\/([A-Z][A-Z\s.'-]+)\b/)
    if (!slash) continue
    if (/\b(FLIGHT|CLASS|BAG|FARE|SEAT)\b/.test(line)) continue
    const titleMatch = slash[2].match(/\b(MR|MRS|MS|MISS|DR|MSTR)\b/)
    const name = `${slash[2].replace(/\b(MR|MRS|MS|MISS|DR|MSTR)\b/g, '').trim()} ${slash[1]}`
      .replace(/\s+/g, ' ')
      .trim()
    if (name.length >= 3) return { name, title: normalizeTitle(titleMatch?.[1]) }
  }

  return { title: '', name: '' }
}

function extractPnr(text: string): string {
  const upper = text.toUpperCase()
  const labeled =
    upper.match(/\b(?:PNR|BOOKING(?:\s+REF(?:ERENCE)?)?|RECORD\s+LOCATOR|RL|LOCATOR)\s*[:#]?\s*([A-Z0-9]{6})\b/)?.[1] ??
    upper.match(/\bREF(?:ERENCE)?\s*[:#]?\s*([A-Z0-9]{6})\b/)?.[1]

  if (labeled && !PNR_BLOCKLIST.has(labeled)) return labeled

  // GDS line often ends with /PNR or space PNR at end
  const inline = upper.match(/\s([A-Z0-9]{6})\s*(?:\/|\n|$)/)
  if (inline?.[1] && !PNR_BLOCKLIST.has(inline[1])) return inline[1]

  return ''
}

function extractCabinClass(text: string): string | undefined {
  const match = text.match(/\b(ECONOMY|PREMIUM\s+ECONOMY|BUSINESS|FIRST)\b/i)
  if (!match) return undefined
  return match[1].replace(/\s+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function extractSegmentsGdsLine(text: string): ParsedTicketSegment[] {
  const cabinClass = extractCabinClass(text)
  const pattern =
    /(?:^|\s)(\d+\.?\s+)?([A-Z]{2})\s*([A-Z0-9]{2,4})\s+(?:[A-Z]\s+)?(\d{1,2}\s*[A-Z]{3}\s*\d{0,4}|\d{1,2}[A-Z]{3}\d{0,4}|\d{4}-\d{2}-\d{2})\s+([A-Z]{3})\s+([A-Z]{3})(?:\s+([A-Z]{2}\d?))?(?:\s+(\d{3,4}))?(?:\s+(\d{3,4}))?/i

  const segments: ParsedTicketSegment[] = []

  for (const rawLine of text.split('\n')) {
    if (/\b(TIME|PASSENGER|BOOKING|REFERENCE|TICKET|RECEIPT|PHONE|EMAIL)\b/i.test(rawLine)) continue

    const line = rawLine.toUpperCase()
    const match = pattern.exec(line)
    if (!match) continue

    const code = match[2]
    if (FLIGHT_CODE_BLOCKLIST.has(code)) continue

    const digits = normalizeFlightDigits(match[3])
    if (!/^\d{2,4}$/.test(digits)) continue

    const from = normalizeIata(match[5])
    const to = normalizeIata(match[6])
    if (!KNOWN_IATA.has(from) || !KNOWN_IATA.has(to)) continue

    const departureDate = parseCompactDate(match[4])
    const status = match[7]

    const built = buildSegment({
      airlineCode: code,
      flightNumber: `${code}${digits}`,
      departureAirport: from,
      arrivalAirport: to,
      departureDate,
      departureTime: parseTimeToken(match[8]),
      arrivalDate: departureDate,
      arrivalTime: parseTimeToken(match[9]),
      cabinClass,
      segmentStatus: status?.startsWith('HK') ? 'HK' : status?.startsWith('HL') ? 'HL' : 'HK',
    })
    if (built) segments.push(built)
  }

  return segments
}

function extractSegmentsLabeled(text: string): ParsedTicketSegment[] {
  const upper = text.toUpperCase()
  const cabinClass = extractCabinClass(text)
  const segments: ParsedTicketSegment[] = []

  const flightMatches = [...upper.matchAll(/\b(?:FLIGHT|FLT)\s*[:#]?\s*([A-Z]{2})\s*-?\s*([A-Z0-9]{2,4})\b/gi)]
  const from =
    upper.match(/\bFROM\s*[:#]?\s*(?:\([A-Z\s]+\)\s*)?([A-Z]{3})\b/)?.[1] ??
    upper.match(/\bORIGIN\s*[:#]?\s*([A-Z]{3})\b/)?.[1] ??
    upper.match(/\bDEPARTURE\s+AIRPORT\s+([A-Z]{3})\b/)?.[1]
  const to =
    upper.match(/\bTO\s*[:#]?\s*(?:\([A-Z\s]+\)\s*)?([A-Z]{3})\b/)?.[1] ??
    upper.match(/\bDESTINATION\s*[:#]?\s*([A-Z]{3})\b/)?.[1] ??
    upper.match(/\bARRIVAL\s+AIRPORT\s+([A-Z]{3})\b/)?.[1]

  const dateMatch =
    upper.match(/\b(?:DATE|DEPARTURE\s+DATE)\s*[:#]?\s*(\d{1,2}\s*[A-Z]{3}\s*\d{0,4}|\d{1,2}[A-Z]{3}\d{0,4}|\d{4}-\d{2}-\d{2})/)?.[1] ??
    upper.match(/\b(\d{1,2}\s+[A-Z]{3}\s+\d{4})\b/)?.[1]

  const depTime = upper.match(/\bDEPARTURE\s+TIME\s*[:#]?\s*(\d{3,4}|\d{1,2}:\d{2})\b/)?.[1]
  const arrTime = upper.match(/\bARRIVAL\s+TIME\s*[:#]?\s*(\d{3,4}|\d{1,2}:\d{2})\b/)?.[1]

  if (flightMatches.length > 0 && from && to) {
    const fromCode = normalizeIata(from)
    const toCode = normalizeIata(to)
    if (!KNOWN_IATA.has(fromCode) || !KNOWN_IATA.has(toCode)) return segments

    for (const match of flightMatches) {
      const built = buildSegment({
        airlineCode: match[1],
        flightNumber: `${match[1]}${normalizeFlightDigits(match[2])}`,
        departureAirport: fromCode,
        arrivalAirport: toCode,
        departureDate: dateMatch ? parseCompactDate(dateMatch) : '',
        departureTime: parseTimeToken(depTime),
        arrivalDate: dateMatch ? parseCompactDate(dateMatch) : '',
        arrivalTime: parseTimeToken(arrTime),
        cabinClass,
      })
      if (built) segments.push(built)
    }
  }

  return segments
}

function extractSegmentsLoose(text: string): ParsedTicketSegment[] {
  const upper = text.toUpperCase()
  const cabinClass = extractCabinClass(text)
  const segments: ParsedTicketSegment[] = []

  for (const line of upper.split('\n')) {
    if (/\b(TIME|PASSENGER|BOOKING|REFERENCE|TICKET|RECEIPT|PHONE|EMAIL)\b/.test(line)) continue

    const flight = line.match(/\b([A-Z]{2})\s*-?\s*([A-Z0-9]{2,4})\b/)
    if (!flight || FLIGHT_CODE_BLOCKLIST.has(flight[1])) continue

    const digits = normalizeFlightDigits(flight[2])
    if (!/^\d{2,4}$/.test(digits)) continue

    const airports = [...line.matchAll(/\b([A-Z]{3})\b/g)]
      .map((m) => normalizeIata(m[1]))
      .filter((code) => KNOWN_IATA.has(code))

    const uniqueAirports = [...new Set(airports)]
    if (uniqueAirports.length < 2) continue

    const dateToken = line.match(/\b(\d{1,2}\s*[A-Z]{3}\s*\d{0,4}|\d{1,2}[A-Z]{3}\d{0,4}|\d{4}-\d{2}-\d{2})\b/)?.[1]
    const times = [...line.matchAll(/\b(\d{3,4})\b/g)].map((m) => m[1]).filter((t) => t.length === 4)

    const built = buildSegment({
      airlineCode: flight[1],
      flightNumber: `${flight[1]}${digits}`,
      departureAirport: uniqueAirports[0],
      arrivalAirport: uniqueAirports[1],
      departureDate: dateToken ? parseCompactDate(dateToken) : '',
      departureTime: parseTimeToken(times[0]),
      arrivalDate: dateToken ? parseCompactDate(dateToken) : '',
      arrivalTime: parseTimeToken(times[1]),
      cabinClass,
    })
    if (built) segments.push(built)
  }

  return segments
}

function extractSegments(text: string): ParsedTicketSegment[] {
  const strategies = [extractSegmentsGdsLine, extractSegmentsLabeled, extractSegmentsLoose]
  for (const strategy of strategies) {
    const found = dedupeSegments(strategy(text))
    if (found.length > 0) return found
  }
  return []
}

export function parseTicketText(rawText: string): ParsedTicket {
  const normalized = preprocessTicketText(rawText)
  const warnings: string[] = []

  const { title, name } = extractPassenger(normalized)
  const pnr = extractPnr(normalized)
  const ticketNumber =
    normalized.match(/\b(?:TKT|ETKT|TICKET)\s*(?:NO|NUMBER)?\s*[:#]?\s*([\d-]{10,20})\b/i)?.[1] ?? ''

  const segments = extractSegments(normalized)

  if (!name) warnings.push('Passenger name not found — edit after import.')
  if (!pnr) warnings.push('PNR not found — add manually if needed.')
  if (segments.length === 0) warnings.push('No flight segments detected — add legs manually.')

  return {
    passengerTitle: title,
    passengerName: name || 'PASSENGER',
    pnr,
    ticketNumber,
    segments,
    warnings,
  }
}

export function canParseTicketText(text: string): boolean {
  const parsed = parseTicketText(text)
  const hasSegment = parsed.segments.some(
    (segment) =>
      Boolean(segment.flightNumber) ||
      (Boolean(segment.departureAirport) && Boolean(segment.arrivalAirport)),
  )
  const hasPassenger = Boolean(parsed.passengerName) && parsed.passengerName !== 'PASSENGER'
  const hasPnr = Boolean(parsed.pnr)
  return hasSegment || (hasPassenger && hasPnr)
}

export function buildPassengerFromTicketText(
  text: string,
  tripType: FlightTripType,
  defaultCurrency = BASE_CURRENCY,
): FlightPassenger {
  const parsed = parseTicketText(text)
  const inferredTripType: FlightTripType = parsed.segments.length > 1 ? 'round_trip' : tripType

  const passenger = createEmptyFlightPassenger(
    inferredTripType,
    {
      passengerTitle: parsed.passengerTitle,
      passengerName: parsed.passengerName,
    },
    defaultCurrency,
  )

  const segments =
    parsed.segments.length > 0
      ? parsed.segments.map((segment) => createEmptyFlightSegment(segment))
      : undefined

  const ticket = createEmptyFlightTicket(
    passenger.id,
    inferredTripType,
    {
      pnr: parsed.pnr,
      ticketNumber: parsed.ticketNumber,
      segments,
    },
    defaultCurrency,
  )

  return { ...passenger, tickets: [ticket] }
}
