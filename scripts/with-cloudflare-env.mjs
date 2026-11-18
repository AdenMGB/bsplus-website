#!/usr/bin/env node
/**
 * Runs `pnpm exec wrangler …` with CLOUDFLARE_* (and optional R2_*) from `.env` / `.env.local`.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const wranglerArgs = process.argv.slice(2)

if (wranglerArgs.length === 0) {
  console.error('Usage: node scripts/with-cloudflare-env.mjs <wrangler-args…>')
  console.error('Example: node scripts/with-cloudflare-env.mjs whoami')
  process.exit(1)
}

function loadEnvFile(relativePath) {
  const filePath = path.join(root, relativePath)
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnvFile('.env')
loadEnvFile('.env.local')

const result = spawnSync('pnpm', ['exec', 'wrangler', ...wranglerArgs], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}
process.exit(result.status ?? 0)
