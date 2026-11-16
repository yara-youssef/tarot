<script setup lang="ts">
import { nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { ui } from '@/store'
import Modal from './Modal.vue'

const doc = shallowRef<PDFDocumentProxy | null>(null) // pdf.js objects must not be made reactive
const status = ref<'loading' | 'missing' | 'ready' | 'error'>('loading')
const canvas = ref<HTMLCanvasElement | null>(null)
const page = ref(ui.guidePage ?? 1)
let task: RenderTask | null = null
let lib: typeof import('@/guidePdf') | null = null

async function init() {
  status.value = 'loading'
  try {
    lib = await import('@/guidePdf')
    doc.value = await lib.getGuide()
    status.value = doc.value ? 'ready' : 'missing'
    if (doc.value) { await nextTick(); render() }
  } catch (e) {
    console.error(e)
    status.value = 'error'
  }
}

async function render() {
  if (!doc.value || !canvas.value || !lib) return
  const n = Math.min(Math.max(page.value + lib.PDF_OFFSET, 1), doc.value.numPages)
  const p = await doc.value.getPage(n)
  const width = Math.min(canvas.value.parentElement!.clientWidth, 760)
  const base = p.getViewport({ scale: 1 })
  const dpr = window.devicePixelRatio || 1
  const vp = p.getViewport({ scale: (width / base.width) * dpr })
  canvas.value.width = vp.width
  canvas.value.height = vp.height
  canvas.value.style.width = `${width}px`
  task?.cancel()
  task = p.render({ canvasContext: canvas.value.getContext('2d')!, viewport: vp })
  try { await task.promise } catch { /* cancelled */ }
}
watch(page, render)

async function pick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f || !lib) return
  status.value = 'loading'
  await lib.saveGuide(f)
  await init()
}
async function forget() {
  await lib?.forgetGuide()
  doc.value = null
  status.value = 'missing'
}
onMounted(init)
</script>

<template>
  <Modal @close="ui.guidePage = null">
    <h2>📖 Your guide</h2>
    <p v-if="status === 'loading'" class="muted">Opening…</p>

    <div v-else-if="status === 'missing' || status === 'error'" class="stack">
      <p>
        To read the full chapter for any card, open your copy of
        <em>The Ultimate Guide to Tarot Card Meanings</em> (PDF) once. It is stored only in this browser and never uploaded.
        After that, every "Read in my guide" button jumps straight to the right page.
      </p>
      <p v-if="status === 'error'" style="color: var(--bad)">That file could not be opened. Please choose the PDF again.</p>
      <label class="btn primary pick">Choose the guide PDF…<input type="file" accept="application/pdf" hidden @change="pick" /></label>
      <p class="small muted">Without the PDF you can still use every other part of the app. The card is on page {{ ui.guidePage }} of the guide.</p>
    </div>

    <div v-else class="stack">
      <div class="row bar">
        <button class="btn" :disabled="page <= 1" @click="page--">← Page</button>
        <span class="muted small">Page <input v-model.number="page" type="number" min="1" class="pg" /> of {{ doc!.numPages - 1 }}</span>
        <button class="btn" @click="page++">Page →</button>
        <button class="btn ghost small forget" @click="forget">Remove PDF from this browser</button>
      </div>
      <div class="canvas-wrap"><canvas ref="canvas" /></div>
    </div>
  </Modal>
</template>

<style scoped>
.pick { display: inline-block; }
.bar { justify-content: center; }
.pg { width: 70px; padding: .25em .4em; display: inline-block; text-align: center; }
.canvas-wrap { display: flex; justify-content: center; background: #fff; border-radius: 8px; overflow: hidden; }
canvas { display: block; max-width: 100%; }
.forget { margin-left: auto; }
@media (max-width: 600px) { .forget { margin-left: 0; } }
</style>
