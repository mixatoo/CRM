import fs from 'node:fs'
import path from 'node:path'

const patternsRoot = 'src/template-kit/patterns'

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (/\.(tsx?|ts)$/.test(entry.name)) files.push(full)
  }
  return files
}

function resolvePatternImport(filePath, importPath) {
  if (!importPath.startsWith('../patterns/')) return importPath
  const target = importPath.slice('../patterns/'.length)
  const fileDir = path.relative(patternsRoot, path.dirname(filePath)).replace(/\\/g, '/')
  const targetDir = target.includes('/') ? target.slice(0, target.lastIndexOf('/')) : '.'
  const targetFile = target.includes('/') ? target.slice(target.lastIndexOf('/') + 1) : target

  if (fileDir === targetDir) return `./${targetFile}`
  if (fileDir === '.') return `./${target}`

  const fileParts = fileDir.split('/').filter(Boolean)
  const targetParts = targetDir === '.' ? [] : targetDir.split('/').filter(Boolean)

  let common = 0
  while (common < fileParts.length && common < targetParts.length && fileParts[common] === targetParts[common]) {
    common += 1
  }

  const up = fileParts.length - common
  const down = targetParts.slice(common)
  const prefix = up === 0 ? './' : `${'../'.repeat(up)}`
  const rest = [...down, targetFile].join('/')
  return `${prefix}${rest}`
}

for (const file of walk(patternsRoot)) {
  let content = fs.readFileSync(file, 'utf8')
  const original = content

  content = content.replaceAll("''../", "'../")
  content = content.replaceAll('""../', '"../')

  content = content.replace(/from '(\.\.\/patterns\/[^']+)'/g, (_, importPath) => {
    return `from '${resolvePatternImport(file, importPath)}'`
  })

  content = content
    .replaceAll(
      "@/features/trips/components/services/TripServiceStatusBadge",
      '../primitives/components/TripServiceStatusBadge',
    )
    .replaceAll('@/features/trips/components/services/service-styles', '../primitives/components/service-styles')

  if (content !== original) {
    fs.writeFileSync(file, content)
    console.log('fixed:', path.relative(patternsRoot, file))
  }
}

console.log('Import fix complete')
