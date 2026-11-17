// Keeps a copy of the guide PDF in the user's Google Drive, so every device can get it.
import { reactive } from 'vue'
import { dropToken, getAccessToken, sync } from './index'
import { AuthError, downloadBlob, findByName, uploadBlob, type DriveFile } from './drive'

export const GUIDE_NAME = 'Tarot Study guide.pdf'

export const guideCloud = reactive({
  state: 'unknown' as 'unknown' | 'checking' | 'in-drive' | 'not-in-drive' | 'uploading' | 'downloading' | 'error',
  progress: 0,
  error: '',
})
let file: DriveFile | null = null

async function withToken<T>(interactive: boolean, fn: (token: string) => Promise<T>): Promise<T | null> {
  let token: string | null
  try { token = await getAccessToken(interactive) } catch (e) { fail(e); return null }
  if (!token) return null
  try {
    return await fn(token)
  } catch (e) {
    if (e instanceof AuthError) {
      dropToken()
      if (interactive) return withToken(true, fn)
      guideCloud.state = 'unknown'
      return null
    }
    fail(e)
    return null
  }
}
function fail(e: unknown) {
  console.error(e)
  guideCloud.state = 'error'
  guideCloud.error = (e as Error).message
}

/** Is the guide in Drive? Returns null if it couldn't check (e.g. sign-in needs a tap). */
export async function checkGuide(interactive: boolean): Promise<boolean | null> {
  if (!sync.enabled) return null
  guideCloud.state = 'checking'
  let checked = false
  await withToken(interactive, async (t) => { file = await findByName(t, GUIDE_NAME); checked = true })
  if (!checked) {
    if (guideCloud.state === 'checking') guideCloud.state = 'unknown'
    return null
  }
  guideCloud.state = file ? 'in-drive' : 'not-in-drive'
  return !!file
}

export async function uploadGuide(blob: Blob, interactive: boolean): Promise<boolean> {
  guideCloud.progress = 0
  const prevState = guideCloud.state
  guideCloud.state = 'uploading'
  const id = await withToken(interactive, (t) =>
    uploadBlob(t, blob, GUIDE_NAME, 'Your copy of the tarot guide, used by the Tarot Study app on all your devices.', (p) => (guideCloud.progress = p)))
  if (id) { file = { id, size: blob.size }; guideCloud.state = 'in-drive'; return true }
  if (guideCloud.state === 'uploading') guideCloud.state = prevState
  return false
}

export async function downloadGuide(interactive: boolean): Promise<Blob | null> {
  if (!file && !(await checkGuide(interactive))) return null
  guideCloud.progress = 0
  guideCloud.state = 'downloading'
  const blob = await withToken(interactive, (t) => downloadBlob(t, file!, (p) => (guideCloud.progress = p)))
  if (blob) guideCloud.state = 'in-drive'
  else if (guideCloud.state === 'downloading') guideCloud.state = 'in-drive'
  return blob
}
