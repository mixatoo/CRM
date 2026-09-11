import { useMemo } from 'react'
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_CATEGORY_LABELS,
  type SupplierCategory,
} from '@/domain/entities/supplier'
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers'
import type { SupplierPanelFilters } from '@/repositories/interfaces'

export interface SupplierFilterOptionItem {
  value: string
  count: number
}

export interface SupplierCategoryFilterOption {
  value: SupplierCategory
  label: string
  count: number
}

function facetMap(suppliers: Array<{ country?: string; city?: string }>, field: 'country' | 'city') {
  const map = new Map<string, number>()
  for (const supplier of suppliers) {
    const raw = supplier[field]?.trim()
    if (!raw) continue
    map.set(raw, (map.get(raw) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

function categoryFacet(suppliers: Array<{ category: SupplierCategory }>): SupplierCategoryFilterOption[] {
  const map = new Map<SupplierCategory, number>()
  for (const category of SUPPLIER_CATEGORIES) {
    map.set(category, 0)
  }
  for (const supplier of suppliers) {
    map.set(supplier.category, (map.get(supplier.category) ?? 0) + 1)
  }
  return SUPPLIER_CATEGORIES.map((category) => ({
    value: category,
    label: SUPPLIER_CATEGORY_LABELS[category],
    count: map.get(category) ?? 0,
  }))
}

export function countActiveSupplierPanelFilters(filters: SupplierPanelFilters) {
  let count = 0
  if (filters.category !== 'all') count += 1
  if (filters.country !== 'all') count += 1
  if (filters.city !== 'all') count += 1
  if ((filters.labelIds?.length ?? 0) > 0) count += 1
  return count
}

export function useSupplierFilterOptions() {
  const { data: suppliers = [] } = useSuppliers()

  return useMemo(() => {
    return {
      totalSuppliers: suppliers.length,
      categories: categoryFacet(suppliers),
      countries: facetMap(suppliers, 'country'),
      cities: facetMap(suppliers, 'city'),
    }
  }, [suppliers])
}
