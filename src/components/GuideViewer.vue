<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { CARD_BY_ID, DECK, cardForPage } from '@/data/deck'
import { addQuoteToNotes, openCard, store, ui, type Highlight } from '@/store'
import Modal from './Modal.vue'
import { sync } from '@/sync'
import { checkGuide, downloadGuide, guideCloud, uploadGuide } from '@/sync/guide'

const doc = shallowRef<PDFDocumentProxy | null>(null) // pdf.js objects must not be made reactive
const status = ref<'loading' | 'missing' | 'ready' | 'error'>('loading')
const canvas = ref<HTMLCanvasElement | null>(null)
const pageEl = ref<HTMLDivElement | null>(null)
const textEl = ref<HTMLDivElement | null>(null)
const page = ref(ui.guidePage ?? 1)
let task: RenderTask | null = null
let textLayer: { cancel(): void } | null = null
let lib: typeof import('@/guidePdf') | null = null

const COLORS = [
  { name: 'Yellow', value: '#ffd84d' },
  { name: 'Pink', value: '#ff8fc8' },
  { name: 'Green', value: '#8de08a' },
  { name: 'Blue', value: '#8cc8ff' },
]
const color = ref(COLORS[0]!.value)

// Which card notes and highlights belong to: the chapter this page is in, or the card you came from.
const chosenCard = ref<string | null>(null)
const pageCard = computed(() => cardForPage(page.value)?.id ?? null)
const targetCard = computed(() => chosenCard.value ?? pageCard.value ?? ui.cardId)
watch(page, () => { chosenCard.value = null })

const pageHighlights = computed(() => store.highlights.filter((h) => h.page === page.value))

async function init() {
  status.value = 'loading'
  try {
    lib = await import('@/guidePdf')
    doc.value = await lib.getGuide()
    status.value = doc.value ? 'ready' : 'missing'
    if (doc.value) { await nextTick(); render() }
    if (sync.enabled) cloudOnOpen()
  } catch (e) {
    console.error(e)
    status.value = 'error'
  }
}

async function render() {
  if (!doc.value || !canvas.value || !lib || !textEl.value || !pageEl.value) return
  selection.value = null
  const n = Math.min(Math.max(page.value + lib.PDF_OFFSET, 1), doc.value.numPages)
  const p = await doc.value.getPage(n)
  const width = Math.min(pageEl.value.parentElement!.clientWidth, 760)
  const base = p.getViewport({ scale: 1 })
  const scale = width / base.width
  const dpr = window.devicePixelRatio || 1
  const vp = p.getViewport({ scale: scale * dpr })
  canvas.value.width = vp.width
  canvas.value.height = vp.height
  pageEl.value.style.width = `${width}px`
  pageEl.value.style.height = `${base.height * scale}px`
  task?.cancel()
  task = p.render({ canvasContext: canvas.value.getContext('2d')!, viewport: vp })

  // Selectable text on top of the page image
  textLayer?.cancel()
  textEl.value.replaceChildren()
  textEl.value.style.setProperty('--scale-factor', String(scale))
  const tl = new lib.TextLayer({ textContentSource: p.streamTextContent(), container: textEl.value, viewport: p.getViewport({ scale }) })
  textLayer = tl
  try { await Promise.all([task.promise, tl.render()]) } catch { /* cancelled */ }
  const end = document.createElement('div')
  end.className = 'endOfContent'
  textEl.value.append(end)
}
watch(page, render)

// ───── Selection → highlight / notes ─────
interface Sel { text: string; rects: Highlight['rects']; top: number }
const selection = ref<Sel | null>(null)

function readSelection() {
  const s = window.getSelection()
  if (!s || s.isCollapsed || !textEl.value || !pageEl.value) { selection.value = null; return }
  const range = s.getRangeAt(0)
  if (!textEl.value.contains(range.commonAncestorContainer)) { selection.value = null; return }
  const text = s.toString().replace(/\s+/g, ' ').trim()
  if (!text) { selection.value = null; return }
  const box = pageEl.value.getBoundingClientRect()
  const rects = [...range.getClientRects()]
    .filter((r) => r.width > 1 && r.height > 1 && r.height < box.height * 0.08)
    .map((r) => [(r.left - box.left) / box.width, (r.top - box.top) / box.height, r.width / box.width, r.height / box.height] as [number, number, number, number])
  if (!rects.length) { selection.value = null; return }
  selection.value = { text, rects, top: Math.max(...rects.map((r) => r[1] + r[3])) }
}
let selTimer: number | undefined
const onSelChange = () => { clearTimeout(selTimer); selTimer = window.setTimeout(readSelection, 150) }
onMounted(() => document.addEventListener('selectionchange', onSelChange))
onUnmounted(() => { document.removeEventListener('selectionchange', onSelChange); clearTimeout(selTimer) })

const flash = ref('')
function toast(msg: string) { flash.value = msg; setTimeout(() => (flash.value = ''), 2500) }

function highlight(alsoNote: boolean) {
  const s = selection.value
  if (!s) return
  store.highlights.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    page: page.value, cardId: targetCard.value, text: s.text, color: color.value, rects: s.rects, date: new Date().toISOString(),
  })
  if (alsoNote && targetCard.value) addQuoteToNotes(targetCard.value, s.text, page.value)
  window.getSelection()?.removeAllRanges()
  selection.value = null
  toast(alsoNote && targetCard.value ? `Highlighted and added to your notes on ${CARD_BY_ID[targetCard.value]!.name}` : 'Highlighted')
}
function noteOnly() {
  const s = selection.value
  if (!s || !targetCard.value) return
  addQuoteToNotes(targetCard.value, s.text, page.value)
  window.getSelection()?.removeAllRanges()
  selection.value = null
  toast(`Added to your notes on ${CARD_BY_ID[targetCard.value]!.name}`)
}
function removeHighlight(id: string) {
  store.highlights = store.highlights.filter((h) => h.id !== id)
}
function noteFromHighlight(h: Highlight) {
  const id = h.cardId ?? targetCard.value
  if (!id) return
  addQuoteToNotes(id, h.text, h.page)
  toast(`Added to your notes on ${CARD_BY_ID[id]!.name}`)
}

async function pick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f || !lib) return
  status.value = 'loading'
  await lib.saveGuide(f)
  await init()
}

// ───── Google Drive copy of the guide ─────
const pct = computed(() => Math.round(guideCloud.progress * 100))
async function cloudOnOpen() {
  if (guideCloud.state === 'unknown' || guideCloud.state === 'error') await checkGuide(false)
  if (status.value === 'missing' && guideCloud.state === 'in-drive') await fromDrive(false)
  // This device has the PDF but Drive doesn't yet: save it there for the other devices
  else if (status.value === 'ready' && guideCloud.state === 'not-in-drive') await toDrive(false)
}
async function fromDrive(interactive: boolean) {
  const blob = await downloadGuide(interactive)
  if (!blob || !lib) return
  await lib.saveGuide(blob)
  await init()
}
async function toDrive(interactive: boolean) {
  const blob = await lib?.loadBlob()
  if (!blob) return
  if (interactive && guideCloud.state !== 'in-drive' && (await checkGuide(true))) return // already there
  await uploadGuide(blob, interactive)
}
async function forget() {
  await lib?.forgetGuide()
  doc.value = null
  status.value = 'missing'
}
function goToCard(id: string) { ui.guidePage = null; openCard(id) }
onMounted(init)
</script>

<template>
  <Modal @close="ui.guidePage = null">
    <h2>📖 Your guide</h2>
    <p v-if="status === 'loading'" class="muted">Opening…</p>

    <div v-else-if="status === 'missing' || status === 'error'" class="stack">
      <p>
        To read the full chapter for any card, open your copy of
        <em>The Ultimate Guide to Tarot Card Meanings</em> (PDF) once. It's kept in this browser, and in your own Google Drive
        if sync is on; it's never published. After that, every "Read in my guide" button jumps straight to the right page.
      </p>
      <div v-if="sync.enabled" class="cloud-box small">
        <template v-if="guideCloud.state === 'downloading'">
          <span>☁ Getting your guide from Google Drive… {{ pct }}%</span>
          <div class="progress"><span :style="{ width: pct + '%' }" /></div>
        </template>
        <span v-else-if="guideCloud.state === 'checking'">☁ Looking for your guide in Google Drive…</span>
        <template v-else-if="guideCloud.state === 'not-in-drive'">
          ☁ Your guide isn't in your Google Drive yet. Choose the PDF below; it will be saved to your Drive so your other devices get it automatically.
        </template>
        <template v-else>
          <button class="btn primary" @click="fromDrive(true)">☁ Get my guide from Google Drive</button>
          <span v-if="guideCloud.state === 'error'" class="bad">{{ guideCloud.error }}</span>
        </template>
      </div>
      <p v-else-if="sync.configured" class="small muted">Tip: turn on Google Drive sync (Journal tab) and the PDF will be saved to your Drive, so your other devices get it automatically.</p>
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
      <div v-if="sync.enabled" class="cloud-line small">
        <template v-if="guideCloud.state === 'uploading'">
          <span>☁ Saving your guide to Google Drive… {{ pct }}%</span>
          <div class="progress"><span :style="{ width: pct + '%' }" /></div>
        </template>
        <span v-else-if="guideCloud.state === 'in-drive'" class="good">☁ Saved in your Google Drive. Your other devices will get it automatically.</span>
        <span v-else-if="guideCloud.state === 'checking'" class="muted">☁ Checking Google Drive…</span>
        <template v-else>
          <button class="btn small" @click="toDrive(true)">☁ Save to Google Drive</button>
          <span v-if="guideCloud.state === 'error'" class="bad">{{ guideCloud.error }}</span>
          <span v-else class="muted">so your other devices get it too</span>
        </template>
      </div>

      <!-- Tools: always visible so it works on phones too -->
      <div class="tools" :class="{ active: selection }">
        <template v-if="selection">
          <div class="sel-text small">“{{ selection.text.length > 140 ? selection.text.slice(0, 140) + '…' : selection.text }}”</div>
          <div class="row">
            <div class="swatches" role="radiogroup" aria-label="Highlight colour">
              <button v-for="c in COLORS" :key="c.value" class="sw" :class="{ on: color === c.value }" :style="{ background: c.value }"
                :aria-label="c.name" :aria-checked="color === c.value" role="radio" @mousedown.prevent @click="color = c.value" />
            </div>
            <button class="btn small" @mousedown.prevent @click="highlight(false)">🖍 Highlight</button>
            <button class="btn small" :disabled="!targetCard" @mousedown.prevent @click="noteOnly">✎ Add to notes</button>
            <button class="btn primary small" :disabled="!targetCard" @mousedown.prevent @click="highlight(true)">Highlight + add to notes</button>
          </div>
        </template>
        <p v-else class="small muted hint">Select text on the page to highlight it or add it to your notes about a card.</p>
        <label class="small card-pick">
          Notes go to
          <select :value="targetCard ?? ''" @change="chosenCard = ($event.target as HTMLSelectElement).value || null">
            <option value="" disabled>Choose a card…</option>
            <option v-for="c in DECK" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </label>
      </div>
      <p v-if="flash" class="toast small" role="status">✓ {{ flash }}</p>

      <div class="canvas-wrap">
        <div ref="pageEl" class="page">
          <canvas ref="canvas" />
          <div class="marks" aria-hidden="true">
            <template v-for="h in pageHighlights" :key="h.id">
              <span v-for="(r, i) in h.rects" :key="i" class="mark" :style="{ left: r[0] * 100 + '%', top: r[1] * 100 + '%', width: r[2] * 100 + '%', height: r[3] * 100 + '%', background: h.color }" />
            </template>
          </div>
          <div ref="textEl" class="textLayer" />
        </div>
      </div>

      <div v-if="pageHighlights.length" class="panel list">
        <h3>Highlights on this page</h3>
        <div v-for="h in pageHighlights" :key="h.id" class="hl" :style="{ borderColor: h.color }">
          <p class="small">“{{ h.text }}”</p>
          <div class="row small">
            <a v-if="h.cardId" href="#" @click.prevent="goToCard(h.cardId)">{{ CARD_BY_ID[h.cardId]!.name }}</a>
            <button class="btn ghost small" @click="noteFromHighlight(h)">✎ Add to notes</button>
            <button class="btn ghost small bad" @click="removeHighlight(h.id)">Remove</button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.pick { display: inline-block; }
.bar { justify-content: center; }
.pg { width: 70px; padding: .25em .4em; display: inline-block; text-align: center; }
.forget { margin-left: auto; }
.cloud-box { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.cloud-box .progress, .cloud-line .progress { width: 100%; max-width: 360px; }
.cloud-line { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; justify-content: center; text-align: center; }
.good { color: var(--good); }
.bad { color: var(--bad); }
.tools { position: sticky; top: -24px; z-index: 5; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.tools.active { border-color: var(--accent); box-shadow: var(--shadow); }
.hint { margin: 0; }
.sel-text { font-style: italic; color: var(--muted); }
.swatches { display: flex; gap: 6px; }
.sw { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; padding: 0; }
.sw.on { border-color: var(--text); }
.btn.small { padding: .35em .85em; font-size: .875rem; }
.card-pick { display: flex; align-items: center; gap: 8px; color: var(--muted); }
.card-pick select { width: auto; padding: .3em .5em; }
.toast { margin: 0; color: var(--good); }

.canvas-wrap { display: flex; justify-content: center; background: #fff; border-radius: 8px; overflow: hidden; }
.page { position: relative; }
canvas { display: block; width: 100%; height: 100%; }
.marks { position: absolute; inset: 0; pointer-events: none; }
.mark { position: absolute; mix-blend-mode: multiply; opacity: .55; border-radius: 2px; }

/* pdf.js text layer (transparent text you can select) */
.textLayer { position: absolute; inset: 0; overflow: clip; line-height: 1; text-align: initial; transform-origin: 0 0; z-index: 1; }
.textLayer :deep(span), .textLayer :deep(br) { color: transparent; position: absolute; white-space: pre; cursor: text; transform-origin: 0% 0%; }
.textLayer :deep(span.markedContent) { top: 0; height: 0; }
.textLayer :deep(::selection) { background: rgb(107 79 160 / .3); }
.textLayer :deep(.endOfContent) { display: block; position: absolute; inset: 100% 0 0; z-index: 0; cursor: default; user-select: none; }

.list h3 { margin-bottom: .4em; }
.hl { border-left: 4px solid; padding: 4px 0 4px 12px; margin-bottom: 10px; }
.hl p { margin: 0 0 4px; }
@media (max-width: 600px) { .forget { margin-left: 0; } .tools { top: -18px; } }
</style>
