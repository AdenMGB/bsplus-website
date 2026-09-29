#!/usr/bin/env node
/**
 * Local Cloudflare dev (Windows + Unix). Sets CF_DEV=1 for the whole pipeline.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.env.CF_DEV = '1'

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
    process.env[key] = value
  }
}

function loadEnvForBuild() {
  loadEnvFile('.env')
  loadEnvFile('.env.local')
}

function run(label, command, args) {
  console.log(`\n[cf:dev] ${label}\n`)

  const isWin = process.platform === 'win32'
  const result =
    isWin && command === 'pnpm'
      ? spawnSync(`pnpm ${args.join(' ')}`, {
          cwd: root,
          stdio: 'inherit',
          env: process.env,
          shell: true,
        })
      : spawnSync(command, args, {
          cwd: root,
          stdio: 'inherit',
          env: process.env,
        })

  if (result.error) {
    console.error(result.error)
    process.exit(1)
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

run('resolve dev service URLs', 'node', ['scripts/resolve-dev-services.mjs'])
run('sync wrangler dev vars', 'node', ['scripts/sync-dev-vars.mjs'])
loadEnvForBuild()
run('build', 'pnpm', ['build'])
run('wrangler dev', 'pnpm', [
  'exec',
  'wrangler',
  'dev',
  '--local',
  '--persist-to',
  '.wrangler/d1-local',
])
