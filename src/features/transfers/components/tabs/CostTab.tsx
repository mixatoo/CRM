import { useEffect, useState } from 'react'
import type { Transfer } from '@/domain/entities/transfer'
import { transferMargin } from '@/domain/entities/transfer'
import { canMutate } from '@/domain/policies/permissions'
import { Button } from '@/design-system/components/Button'
import { AccountingAmount } from '@/design-system/components/AccountingAmount'
import { CrmFieldGrid, CrmInputCell, CrmMetricCell, CrmPanel } from '@/design-system/layout/CrmPanel'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useTransferMutations } from '@/features/transfers/hooks/use-transfer-mutations'
import { formInputClassName } from '@/features/trips/components/services/flight/operations/operation-worksheet-ui'

interface CostTabProps {
  transfer: Transfer
}

export function CostTab({ transfer }: CostTabProps) {
  const role = useAuthStore((state) => state.user?.role ?? 'guest')
  const canEdit = canMutate(role, 'order', 'update')
  const { updateTransfer, isPending } = useTransferMutations()
  const [currency, setCurrency] = useState(transfer.currency)
  const [sellingPrice, setSellingPrice] = useState(String(transfer.sellingPrice))
  const [supplierCost, setSupplierCost] = useState(String(transfer.supplierCost))

  useEffect(() => {
    setCurrency(transfer.currency)
    setSellingPrice(String(transfer.sellingPrice))
    setSupplierCost(String(transfer.supplierCost))
  }, [transfer])

  const sellingValue = Number.parseFloat(sellingPrice) || 0
  const costValue = Number.parseFloat(supplierCost) || 0
  const draftMargin = transferMargin({ sellingPrice: sellingValue, supplierCost: costValue })

  const dirty =
    currency.trim() !== transfer.currency.trim() ||
    sellingValue !== transfer.sellingPrice ||
    costValue !== transfer.supplierCost

  return (
    <div className="space-y-3">
      <CrmPanel title="Cost">
        <CrmFieldGrid columns={2}>
          <CrmInputCell label="Currency">
            <input
              className={formInputClassName}
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              disabled={!canEdit}
              maxLength={3}
            />
          </CrmInputCell>
          <CrmMetricCell label="Margin">
            <AccountingAmount amount={draftMargin} currency={currency || transfer.currency} />
          </CrmMetricCell>
          <CrmInputCell label="Selling price">
            <input
              type="number"
              min={0}
              step="0.01"
              className={formInputClassName}
              value={sellingPrice}
              onChange={(event) => setSellingPrice(event.target.value)}
              disabled={!canEdit}
            />
          </CrmInputCell>
          <CrmInputCell label="Supplier cost">
            <input
              type="number"
              min={0}
              step="0.01"
              className={formInputClassName}
              value={supplierCost}
              onChange={(event) => setSupplierCost(event.target.value)}
              disabled={!canEdit}
            />
          </CrmInputCell>
        </CrmFieldGrid>
      </CrmPanel>

      {canEdit ? (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={!dirty || isPending || !currency.trim()}
            onClick={() =>
              updateTransfer.mutate({
                id: transfer.id,
                patch: {
                  currency: currency.trim().toUpperCase(),
                  sellingPrice: sellingValue,
                  supplierCost: costValue,
                },
              })
            }
          >
            {isPending ? 'Saving…' : 'Save cost'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
