import fs from 'node:fs'
import path from 'node:path'

const root = 'src/template-kit'
const prim = path.join(root, 'primitives')
const patt = path.join(root, 'patterns')

const primCopies = [
  ['src/shared/utils/cn.ts', 'utils/cn.ts'],
  ['src/shared/utils/date-format.ts', 'utils/date-format.ts'],
  ['src/shared/utils/amount-input.ts', 'utils/amount-input.ts'],
  ['src/shared/utils/text-format.ts', 'utils/text-format.ts'],
  ['src/types/pagination.ts', 'types/pagination.ts'],
  ['src/types/table-columns.ts', 'types/table-columns.ts'],
  ['src/shared/hooks/use-table-column-visibility.ts', 'hooks/use-table-column-visibility.ts'],
  ['src/design-system/tokens/layout.ts', 'tokens/layout.ts'],
]

for (const f of fs.readdirSync('src/design-system/components')) {
  primCopies.push([`src/design-system/components/${f}`, `components/${f}`])
}
for (const f of fs.readdirSync('src/design-system/layout')) {
  primCopies.push([`src/design-system/layout/${f}`, `layout/${f}`])
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function rewritePrimitives(content, relFile) {
  const depth = relFile.split('/').length - 1
  const up = '../'.repeat(depth)
  return content
    .replaceAll('@/shared/utils/cn', `${up}utils/cn`)
    .replaceAll('@/shared/utils/date-format', `${up}utils/date-format`)
    .replaceAll('@/shared/utils/amount-input', `${up}utils/amount-input`)
    .replaceAll('@/shared/utils/text-format', `${up}utils/text-format`)
    .replaceAll('@/shared/hooks/use-table-column-visibility', `${up}hooks/use-table-column-visibility`)
    .replaceAll('@/types/pagination', `${up}types/pagination`)
    .replaceAll('@/types/table-columns', `${up}types/table-columns`)
    .replaceAll('@/design-system/tokens/layout', `${up}tokens/layout`)
    .replaceAll('@/design-system/components/', `${up}components/`)
    .replaceAll('@/design-system/layout/', `${up}layout/`)
    .replaceAll('@/features/trips/utils/format', `${up}utils/format-accounting`)
    .replaceAll('@/features/trips/components/list/TripStageBadge', `${up}components/TripStageBadge`)
    .replaceAll('@/features/trips/components/list/TripServiceStatusBadge', `${up}components/TripServiceStatusBadge`)
    .replaceAll('@/features/trips/components/list/service-styles', `${up}components/service-styles`)
}

for (const [src, dest] of primCopies) {
  if (!fs.existsSync(src)) {
    console.log('SKIP missing:', src)
    continue
  }
  const destPath = path.join(prim, dest)
  ensureDir(destPath)
  let content = fs.readFileSync(src, 'utf8')
  content = rewritePrimitives(content, dest)
  fs.writeFileSync(destPath, content)
  console.log('prim:', dest)
}

const patternCopies = []
function walk(dir, base = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, rel)
    else if (/\.(tsx?|ts)$/.test(entry.name)) patternCopies.push([full, rel])
  }
}
walk('src/features/ui-templates/patterns')
walk('src/features/ui-templates/components')
walk('src/features/ui-templates/data')

function rewritePatterns(content, relFile) {
  const depth = relFile.split('/').length
  const toPrim = '../'.repeat(depth) + 'primitives/'
  return content
    .replaceAll('@/features/ui-templates/', '../')
    .replaceAll('@/design-system/tokens/layout', `${toPrim}tokens/layout`)
    .replaceAll('@/design-system/components/', `${toPrim}components/`)
    .replaceAll('@/design-system/layout/', `${toPrim}layout/`)
    .replaceAll('@/shared/utils/cn', `${toPrim}utils/cn`)
    .replaceAll('@/shared/utils/date-format', `${toPrim}utils/date-format`)
    .replaceAll('@/shared/hooks/use-table-column-visibility', `${toPrim}hooks/use-table-column-visibility`)
    .replaceAll('@/types/table-columns', `${toPrim}types/table-columns`)
    .replaceAll('@/types/pagination', `${toPrim}types/pagination`)
    .replaceAll("@/domain/entities'", "'../stubs/domain-entities'")
    .replaceAll('@/domain/entities/client', '../stubs/domain-client')
    .replaceAll('@/domain/entities/trip-service', '../stubs/domain-trip-service')
    .replaceAll('@/domain/membership/term', '../stubs/membership-term')
    .replaceAll('@/features/clients/hooks/use-client-mutations', '../stubs/use-client-mutations')
    .replaceAll('@/features/clients/components/ClientProfileFields', '../stubs/ClientProfileFields')
    .replaceAll('@/features/clients/components/client-form-ui', '../stubs/client-form-ui')
    .replaceAll('@/features/clients/components/ClientFormWizard', '../stubs/ClientFormWizard')
    .replaceAll('@/features/clients/components/IndividualNameFields', '../stubs/IndividualNameFields')
    .replaceAll('@/features/clients/components/FinancialFormFields', '../stubs/FinancialFormFields')
    .replaceAll('@/features/clients/components/membership/MembershipTermEditor', '../stubs/MembershipTermEditor')
    .replaceAll('@/features/trips/components/list/TripStageBadge', `${toPrim}components/TripStageBadge`)
    .replaceAll('@/features/trips/components/list/TripServiceStatusBadge', `${toPrim}components/TripServiceStatusBadge`)
    .replaceAll('@/features/trips/components/list/service-styles', `${toPrim}components/service-styles`)
    .replaceAll('@/features/trips/components/workspace/TripInfoBar', '../stubs/TripInfoBar')
    .replaceAll('@/features/trips/components/workspace/TripProgressBar', '../stubs/TripProgressBar')
    .replaceAll('@/features/trips/components/workspace/TripWorkspaceNav', '../stubs/TripWorkspaceNav')
    .replaceAll(
      '@/features/trips/components/services/flight/operations/operation-worksheet-ui',
      '../stubs/operation-worksheet-ui',
    )
}

for (const [src, dest] of patternCopies) {
  const destPath = path.join(patt, dest)
  ensureDir(destPath)
  let content = fs.readFileSync(src, 'utf8')
  content = rewritePatterns(content, dest)
  fs.writeFileSync(destPath, content)
  console.log('pat:', dest)
}

console.log('Done:', primCopies.length, 'primitives,', patternCopies.length, 'patterns')
console.log('Run: node scripts/fix-template-kit-imports.mjs')
