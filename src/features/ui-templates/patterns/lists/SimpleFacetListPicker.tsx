import { FacetListPicker, type FacetListPickerProps } from '@/features/ui-templates/patterns/lists/FacetListPicker'

type SimpleFacetListPickerProps = Omit<
  FacetListPickerProps,
  'secondaryCountColumn' | 'totalSecondaryCount' | 'showAvatar'
>

/** Destination-style facet list: label + single count column. */
export function SimpleFacetListPicker(props: SimpleFacetListPickerProps) {
  return <FacetListPicker {...props} showAvatar={false} />
}
