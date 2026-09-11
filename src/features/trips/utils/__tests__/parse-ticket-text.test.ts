import { describe, expect, it } from 'vitest'
import {
  canParseTicketText,
  parseTicketText,
  preprocessTicketText,
} from '@/features/trips/utils/parse-ticket-text'

const GDS_SAMPLE = `ELECTRONIC TICKET RECEIPT
PASSENGER: DOE/JOHN MR
PNR: ABC12X
TKT NUMBER: 176-1234567890
1 MS 702 Y 15JUL26 CAI DXB HK1 1430 1845 ECONOMY`

const LABELED_SAMPLE = `EgyptAir E-Ticket
Passenger Name : HASSAN/AHMED MR
Booking Reference : K7X9P2
Flight MS702  12 Aug 2026
From CAI To DXB
Departure Time 14:30  Arrival Time 18:45`

const OCR_SAMPLE = preprocessTicketText(`MS 7O2 l2AUG26 CAl DXB
PASSENGER HASSAN/AHMED MR
BOOKING REF K7X9P2`)

describe('parseTicketText', () => {
  it('parses GDS e-ticket text', () => {
    const result = parseTicketText(GDS_SAMPLE)
    expect(result.passengerName).toContain('JOHN')
    expect(result.pnr).toBe('ABC12X')
    expect(result.segments[0]?.flightNumber).toBe('MS702')
    expect(result.segments[0]?.departureAirport).toBe('CAI')
    expect(canParseTicketText(GDS_SAMPLE)).toBe(true)
  })

  it('parses labeled airline ticket layout', () => {
    const result = parseTicketText(LABELED_SAMPLE)
    expect(result.passengerName).toContain('AHMED')
    expect(result.pnr).toBe('K7X9P2')
    expect(result.segments[0]?.flightNumber).toBe('MS702')
    expect(result.segments[0]?.departureAirport).toBe('CAI')
    expect(result.segments[0]?.arrivalAirport).toBe('DXB')
  })

  it('tolerates common OCR mistakes', () => {
    const result = parseTicketText(OCR_SAMPLE)
    expect(result.segments[0]?.flightNumber).toBe('MS702')
    expect(result.segments[0]?.departureAirport).toBe('CAI')
    expect(result.pnr).toBe('K7X9P2')
  })
})
