// Lets you open your own copy of the guide PDF inside the app.
// The file is kept only in this browser (IndexedDB); it is never uploaded anywhere.
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PDFDocumentProxy } from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const DB = 'tarot-guide'
const STORE = 'files'

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveGuide(file: Blob) {
  const d = await db()
  await new Promise<void>((res, rej) => {
    const tx = d.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(file, 'guide')
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
  doc = null
}

async function loadBlob(): Promise<Blob | null> {
  try {
    const d = await db()
    return await new Promise((res, rej) => {
      const req = d.transaction(STORE).objectStore(STORE).get('guide')
      req.onsuccess = () => res((req.result as Blob) ?? null)
      req.onerror = () => rej(req.error)
    })
  } catch { return null }
}

export async function forgetGuide() {
  const d = await db()
  d.transaction(STORE, 'readwrite').objectStore(STORE).delete('guide')
  doc = null
}

let doc: PDFDocumentProxy | null = null
export async function getGuide(): Promise<PDFDocumentProxy | null> {
  if (doc) return doc
  const blob = await loadBlob()
  if (!blob) return null
  doc = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise
  return doc
}

/** The PDF file has a cover page before printed page 1. */
export const PDF_OFFSET = 1
