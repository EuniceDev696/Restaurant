import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultStorePath = path.join(__dirname, '..', 'data', 'store.json')
const STORE_PATH = process.env.STORE_PATH ? path.resolve(process.env.STORE_PATH) : defaultStorePath

function sanitizeJson(raw) {
  return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
}

async function ensureStoreFile() {
  try {
    await fs.access(STORE_PATH)
    return
  } catch {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  }

  try {
    const bundledStore = await fs.readFile(defaultStorePath, 'utf8')
    await fs.writeFile(STORE_PATH, sanitizeJson(bundledStore), 'utf8')
  } catch {
    const emptyStore = { menu: [], events: [], reservations: [] }
    await fs.writeFile(STORE_PATH, JSON.stringify(emptyStore, null, 2), 'utf8')
  }
}

export async function readStore() {
  await ensureStoreFile()
  const raw = await fs.readFile(STORE_PATH, 'utf8')
  return JSON.parse(sanitizeJson(raw))
}

export async function writeStore(nextStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(nextStore, null, 2), 'utf8')
}

export function createId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 900000 + 100000)}`
}
