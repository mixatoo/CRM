import type { FormPicklistOption } from '@/design-system/components/FormPicklist'
import { CITIES_BY_COUNTRY, COUNTRIES, COUNTRY_ALIASES } from '@/domain/catalog/locations-data'

export function resolveCountryName(value?: string): string {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return COUNTRY_ALIASES[trimmed] ?? trimmed
}

export function getCitiesForCountry(country: string): string[] {
  const resolved = resolveCountryName(country)
  return CITIES_BY_COUNTRY[resolved] ?? []
}

export function getCountryPicklistOptions(): FormPicklistOption[] {
  return COUNTRIES.map((country) => ({ value: country, label: country }))
}

export function getCityPicklistOptions(country: string, currentCity?: string): FormPicklistOption[] {
  const resolved = resolveCountryName(country)
  const cities = getCitiesForCountry(resolved)
  const options = cities.map((city) => ({ value: city, label: city }))

  const trimmed = currentCity?.trim()
  if (trimmed && !cities.includes(trimmed)) {
    options.unshift({ value: trimmed, label: trimmed })
  }

  return options
}

export function isCityValidForCountry(country: string, city?: string): boolean {
  const trimmed = city?.trim()
  if (!trimmed) return true
  return getCitiesForCountry(country).includes(trimmed)
}
