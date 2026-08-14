import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

const sourceRoot = path.resolve("src")
const baselinePath = path.resolve("scripts/source-size-baseline.json")
const maximumFileLines = 600
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx", ".vue"])

const parsedBaseline = JSON.parse(await readFile(baselinePath, "utf8"))
if (!parsedBaseline || Array.isArray(parsedBaseline) || typeof parsedBaseline !== "object") {
  throw new TypeError("Source-size baseline must be a JSON object")
}
const baseline = new Map()
for (const [file, limit] of Object.entries(parsedBaseline)) {
  if (!Number.isInteger(limit) || limit <= maximumFileLines) {
    throw new TypeError(`${file} must have an integer baseline above ${maximumFileLines}`)
  }
  baseline.set(file, limit)
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async entry => {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        if (["typings"].includes(entry.name)) return []
        return sourceFiles(absolute)
      }
      if (!entry.isFile() || !sourceExtensions.has(path.extname(entry.name))) return []
      return [absolute]
    }),
  )
  return nested.flat()
}

const violations = []
const observedBaselinePaths = new Set()
for (const absolute of await sourceFiles(sourceRoot)) {
  const repositoryRelative = path.relative(process.cwd(), absolute).split(path.sep).join("/")
  const source = await readFile(absolute, "utf8")
  const lineCount =
    source === "" ? 0 : source.split(/\r?\n/u).length - (/\r?\n$/u.test(source) ? 1 : 0)
  const baselineMaximum = baseline.get(repositoryRelative)
  if (baselineMaximum !== undefined) observedBaselinePaths.add(repositoryRelative)
  const fileMaximum = baselineMaximum ?? maximumFileLines

  if (lineCount > fileMaximum) {
    violations.push(`${repositoryRelative}: ${lineCount} lines (maximum ${fileMaximum})`)
  }
  if (baselineMaximum !== undefined && lineCount < baselineMaximum) {
    const removalHint = lineCount <= maximumFileLines ? " or remove the entry" : ""
    violations.push(
      `${repositoryRelative}: lower its baseline from ${baselineMaximum} to ${lineCount}${removalHint}`,
    )
  }
}

for (const file of baseline.keys()) {
  if (!observedBaselinePaths.has(file)) {
    violations.push(`${file}: remove the stale source-size baseline entry`)
  }
}

if (violations.length) {
  console.error(
    [
      "Source-size guard failed. Split responsibilities; legacy baselines may only decrease:",
      ...violations,
    ].join("\n"),
  )
  process.exitCode = 1
} else {
  console.log("Source-size guard passed.")
}
