// Talks to Google: sign-in (Google Identity Services) and one JSON file in the user's Drive.
// Uses the "drive.file" permission, so the app can only see files it created itself.
import type { SyncDoc } from './merge'

const SCOPE = 'https://www.googleapis.com/auth/drive.file'
export const FILE_NAME = 'Tarot Study sync.json'
const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { google?: any } }

let gisLoading: Promise<void> | null = null
function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  gisLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => { gisLoading = null; reject(new Error('Could not load Google sign-in. Check your connection.')) }
    document.head.append(s)
  })
  return gisLoading
}

export interface Token { access_token: string; expires_at: number }

/** Opens Google's sign-in popup (must be called from a tap/click). */
export async function requestToken(clientId: string, opts: { hint?: string; consent: boolean }): Promise<Token> {
  await loadGis()
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      hint: opts.hint,
      callback: (r: any) => {
        if (r.error) return reject(new Error(r.error_description || r.error))
        if (!window.google.accounts.oauth2.hasGrantedAllScopes(r, SCOPE))
          return reject(new Error('Please allow access to Google Drive so the app can save your sync file.'))
        resolve({ access_token: r.access_token, expires_at: Date.now() + (Number(r.expires_in) - 60) * 1000 })
      },
      error_callback: (e: any) => reject(new Error(e?.type === 'popup_closed' ? 'Sign-in window was closed.' : e?.message || 'Sign-in failed.')),
    })
    client.requestAccessToken({ prompt: opts.consent ? 'consent' : '' })
  })
}

export function revoke(token: string) {
  try { window.google?.accounts?.oauth2?.revoke(token, () => {}) } catch { /* ignore */ }
}

export class AuthError extends Error {}

async function call(token: string, url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` } })
  if (res.status === 401) throw new AuthError('Google sign-in expired.')
  if (!res.ok) throw new Error(`Google Drive error ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res
}

export async function whoAmI(token: string): Promise<string> {
  const r = await call(token, `${API}/about?fields=user(emailAddress)`)
  return (await r.json()).user?.emailAddress ?? ''
}

export async function findFile(token: string): Promise<string | null> {
  const q = encodeURIComponent(`name = '${FILE_NAME}' and trashed = false`)
  const r = await call(token, `${API}/files?q=${q}&spaces=drive&orderBy=modifiedTime desc&fields=files(id)`)
  return (await r.json()).files?.[0]?.id ?? null
}

export async function download(token: string, id: string): Promise<SyncDoc | null> {
  try {
    const r = await call(token, `${API}/files/${id}?alt=media`)
    const doc = await r.json()
    return doc?.app === 'tarot-study' ? doc : null
  } catch (e) {
    if (e instanceof AuthError) throw e
    if (String(e).includes('404')) return null
    throw e
  }
}

export async function create(token: string, doc: SyncDoc): Promise<string> {
  const boundary = 'tarot' + Math.random().toString(36).slice(2)
  const body = [
    `--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '',
    JSON.stringify({ name: FILE_NAME, mimeType: 'application/json', description: 'Progress, notes and journal from the Tarot Study app. Used to sync between your devices.' }),
    `--${boundary}`, 'Content-Type: application/json', '', JSON.stringify(doc), `--${boundary}--`,
  ].join('\r\n')
  const r = await call(token, `${UPLOAD}/files?uploadType=multipart&fields=id`, {
    method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body,
  })
  return (await r.json()).id
}

export async function update(token: string, id: string, doc: SyncDoc): Promise<void> {
  await call(token, `${UPLOAD}/files/${id}?uploadType=media`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc),
  })
}

// ───── Larger files (the guide PDF) ─────

export interface DriveFile { id: string; size: number }

export async function findByName(token: string, name: string): Promise<DriveFile | null> {
  const q = encodeURIComponent(`name = '${name.replace(/'/g, "\\'")}' and trashed = false`)
  const r = await call(token, `${API}/files?q=${q}&spaces=drive&orderBy=modifiedTime desc&fields=files(id,size)`)
  const f = (await r.json()).files?.[0]
  return f ? { id: f.id, size: Number(f.size) || 0 } : null
}

/** Download a file, reporting progress from 0 to 1. */
export async function downloadBlob(token: string, file: DriveFile, onProgress: (p: number) => void): Promise<Blob> {
  const r = await call(token, `${API}/files/${file.id}?alt=media`)
  const total = file.size || Number(r.headers.get('Content-Length')) || 0
  if (!r.body || !total) return r.blob()
  const reader = r.body.getReader()
  const chunks: Uint8Array[] = []
  let got = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    got += value.length
    onProgress(Math.min(1, got / total))
  }
  return new Blob(chunks as BlobPart[], { type: 'application/pdf' })
}

/** Upload a large file with a resumable upload session, reporting progress from 0 to 1. */
export async function uploadBlob(token: string, blob: Blob, name: string, description: string, onProgress: (p: number) => void): Promise<string> {
  const start = await call(token, `${UPLOAD}/files?uploadType=resumable&fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': blob.type || 'application/pdf', 'X-Upload-Content-Length': String(blob.size) },
    body: JSON.stringify({ name, mimeType: blob.type || 'application/pdf', description }),
  })
  const session = start.headers.get('Location')
  if (!session) throw new Error('Google Drive did not accept the upload.')
  // XMLHttpRequest, because fetch can't report upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', session)
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total) }
    xhr.onload = () => {
      if (xhr.status === 401) return reject(new AuthError('Google sign-in expired.'))
      if (xhr.status < 200 || xhr.status >= 300) return reject(new Error(`Upload failed (${xhr.status}).`))
      try { resolve(JSON.parse(xhr.responseText).id) } catch { reject(new Error('Upload failed.')) }
    }
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'))
    xhr.send(blob)
  })
}
