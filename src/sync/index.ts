// Keeps this browser's data in sync with a file in the user's Google Drive.
import { reactive, watch } from 'vue'
import { GOOGLE_CLIENT_ID } from '@/config'
import { store, replaceState } from '@/store'
import * as drive from './drive'
import {
  entriesToFlat, entriesToStamps, flatten, mergeEntries, sameEntries, stamp, toEntries, unflatten, type Flat, type SyncDoc,
} from './merge'

const META_KEY = 'tarot-sync-meta'
interface Meta {
  enabled: boolean
  email: string
  fileId: string | null
  lastSync: string | null
  stamps: Record<string, number>
  token: drive.Token | null
}
function loadMeta(): Meta {
  const empty: Meta = { enabled: false, email: '', fileId: null, lastSync: null, stamps: {}, token: null }
  try { return { ...empty, ...JSON.parse(localStorage.getItem(META_KEY) || '{}') } } catch { return empty }
}
const meta = loadMeta()
function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(meta)) } catch { /* ignore */ } }

export const sync = reactive({
  configured: !!GOOGLE_CLIENT_ID,
  enabled: meta.enabled,
  email: meta.email,
  lastSync: meta.lastSync,
  status: 'idle' as 'idle' | 'syncing' | 'needs-signin' | 'error',
  error: '',
  pending: false, // local changes not yet uploaded
})

// ───── Track local changes ─────
let prev: Flat = flatten(store)
let changeTimer: number | undefined
let pushTimer: number | undefined
watch(store, () => {
  clearTimeout(changeTimer)
  changeTimer = window.setTimeout(() => {
    const next = flatten(store)
    const stamps = stamp(prev, next, meta.stamps, Date.now())
    if (Object.keys(stamps).length !== Object.keys(meta.stamps).length || Object.entries(stamps).some(([k, t]) => meta.stamps[k] !== t)) {
      meta.stamps = stamps
      saveMeta()
      sync.pending = true
      if (sync.enabled) { clearTimeout(pushTimer); pushTimer = window.setTimeout(() => syncNow(false), 3000) }
    }
    prev = next
  }, 300)
}, { deep: true })

const tokenValid = () => !!meta.token && meta.token.expires_at > Date.now()

async function signIn(consent: boolean) {
  meta.token = await drive.requestToken(GOOGLE_CLIENT_ID, { hint: meta.email || undefined, consent })
  if (!meta.email) { meta.email = await drive.whoAmI(meta.token.access_token); sync.email = meta.email }
  saveMeta()
}

let running: Promise<void> | null = null
/**
 * Sync now. `interactive` means it was started by a tap, so a Google sign-in popup may open
 * if the previous sign-in (valid for about an hour) has expired.
 */
export function syncNow(interactive: boolean): Promise<void> {
  if (!sync.enabled || !sync.configured) return Promise.resolve()
  running ??= run(interactive).finally(() => { running = null })
  return running
}

async function run(interactive: boolean, retried = false): Promise<void> {
  if (!tokenValid()) {
    if (!interactive) { sync.status = 'needs-signin'; return }
    try { await signIn(false) } catch (e) { sync.status = 'error'; sync.error = (e as Error).message; return }
  }
  sync.status = 'syncing'
  sync.error = ''
  try {
    const token = meta.token!.access_token
    // Flush any change the watcher hasn't stamped yet
    clearTimeout(changeTimer)
    const now = flatten(store)
    meta.stamps = stamp(prev, now, meta.stamps, Date.now())
    prev = now

    if (!meta.fileId) meta.fileId = await drive.findFile(token)
    let remote: SyncDoc | null = meta.fileId ? await drive.download(token, meta.fileId) : null
    if (meta.fileId && !remote) { meta.fileId = await drive.findFile(token); remote = meta.fileId ? await drive.download(token, meta.fileId) : null }

    const local = toEntries(now, meta.stamps)
    const merged = mergeEntries(local, remote?.entries ?? {})
    const doc: SyncDoc = { app: 'tarot-study', version: 1, entries: merged }

    // Apply what came from other devices
    const mergedFlat = entriesToFlat(merged)
    const nextState = unflatten(mergedFlat, store)
    prev = flatten(nextState)
    meta.stamps = entriesToStamps(merged)
    replaceState(nextState)

    // Upload if Drive is missing anything we have
    if (!meta.fileId) meta.fileId = await drive.create(token, doc)
    else if (!remote || !sameEntries(remote.entries, merged)) await drive.update(token, meta.fileId, doc)

    meta.lastSync = new Date().toISOString()
    sync.lastSync = meta.lastSync
    sync.pending = false
    sync.status = 'idle'
    saveMeta()
  } catch (e) {
    if (e instanceof drive.AuthError) {
      meta.token = null; saveMeta()
      if (interactive && !retried) return run(true, true)
      sync.status = 'needs-signin'
      return
    }
    console.error(e)
    sync.status = 'error'
    sync.error = (e as Error).message
  }
}

/**
 * A Google access token for other Drive features (e.g. the guide PDF).
 * Returns null if sync is off, or if signing in again would need a tap and `interactive` is false.
 */
export async function getAccessToken(interactive: boolean): Promise<string | null> {
  if (!sync.enabled || !sync.configured) return null
  if (!tokenValid()) {
    if (!interactive) return null
    await signIn(false)
  }
  return meta.token!.access_token
}
/** Forget the current token after Google rejected it. */
export function dropToken() { meta.token = null; saveMeta(); sync.status = 'needs-signin' }

/** Turn sync on (from a tap): sign in with Google, then do the first sync. */
export async function connect() {
  sync.error = ''
  sync.status = 'syncing'
  try {
    await signIn(true)
  } catch (e) {
    sync.status = 'error'; sync.error = (e as Error).message; return
  }
  meta.enabled = true
  sync.enabled = true
  saveMeta()
  await syncNow(true)
}

export function disconnect() {
  if (meta.token) drive.revoke(meta.token.access_token)
  Object.assign(meta, { enabled: false, email: '', fileId: null, lastSync: null, token: null })
  saveMeta()
  Object.assign(sync, { enabled: false, email: '', lastSync: null, status: 'idle', error: '' })
}

// Sync when the app opens, when you come back to it, and every couple of minutes while open.
export function startAutoSync() {
  syncNow(false)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(false) })
  window.setInterval(() => { if (document.visibilityState === 'visible') syncNow(false) }, 120_000)
}
