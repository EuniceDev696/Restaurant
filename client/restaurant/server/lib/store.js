import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultStorePath = path.join(__dirname, '..', 'data', 'store.json')
const STORE_PATH = process.env.STORE_PATH ? path.resolve(process.env.STORE_PATH) : defaultStorePath

export async function readStore() {
  const raw = await fs.readFile(STORE_PATH, 'utf8')
  // Some editors may save JSON with a UTF-8 BOM; strip it before parsing.
  const sanitized = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  return JSON.parse(sanitized)
}

export async function writeStore(nextStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(nextStore, null, 2), 'utf8')
}

export function createId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 900000 + 100000)}`
}
