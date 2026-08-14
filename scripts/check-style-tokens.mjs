import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

const sourceRoot = path.resolve("src")
const baselinePath = path.resolve("scripts/style-token-baseline.json")
const sourceExtensions = new Set([".css", ".scss", ".ts", ".vue"])
const literalPattern = /#[0-9a-fA-F]{3,8}\b|rgba?\s*\(/gu
const canonicalStyleSources = new Set(["src/assets/styles/css/tailwind/tokens.css"])
const canonicalStyleDirectories = [
  "src/assets/styles/css/tailwind/themes/",
  "src/components/Chart/theme/",
]

const parsedBaseline = JSON.parse(await readFile(baselinePath, "utf8"))
if (!parsedBaseline || Array.isArray(parsedBaseline) || typeof parsedBaseline !== "object") {
  throw new TypeError("Style-token baseline must be a JSON object")
}
const baseline = new Map()
for (const [file, count] of Object.entries(parsedBaseline)) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new TypeError(`${file} must have a positive integer style-token baseline`)
  }
  baseline.set(file, count)
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async entry => {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === "typings") return []
        return sourceFiles(absolute)
      }
      if (!entry.isFile() || !sourceExtensions.has(path.extname(entry.name))) return []
      return [absolute]
    }),
  )
  return nested.flat()
}

function isCanonicalStyleSource(repositoryRelative) {
  return (
    canonicalStyleSources.has(repositoryRelative) ||
    canonicalStyleDirectories.some(directory => repositoryRelative.startsWith(directory))
  )
}

const violations = []
const observedBaselinePaths = new Set()
for (const absolute of await sourceFiles(sourceRoot)) {
  const repositoryRelative = path.relative(process.cwd(), absolute).split(path.sep).join("/")
  if (isCanonicalStyleSource(repositoryRelative)) continue

  const source = await readFile(absolute, "utf8")
  const literalCount = source.match(literalPattern)?.length ?? 0
  const allowedCount = baseline.get(repositoryRelative) ?? 0
  if (baseline.has(repositoryRelative)) observedBaselinePaths.add(repositoryRelative)

  if (literalCount > allowedCount) {
    violations.push(
      `${repositoryRelative}: ${literalCount} raw colors (baseline ${allowedCount}); use shared tokens`,
    )
  }
  if (allowedCount > 0 && literalCount < allowedCount) {
    const removalHint = literalCount === 0 ? " or remove the entry" : ""
    violations.push(
      `${repositoryRelative}: lower its style-token baseline from ${allowedCount} to ${literalCount}${removalHint}`,
    )
  }
}

for (const file of baseline.keys()) {
  if (!observedBaselinePaths.has(file)) {
    violations.push(`${file}: remove the stale style-token baseline entry`)
  }
}

if (violations.length) {
  console.error(
    [
      "Style-token guard failed. Put new colors in the shared theme; legacy baselines may only decrease:",
      ...violations,
    ].join("\n"),
  )
  process.exitCode = 1
} else {
  console.log("Style-token guard passed.")
}
