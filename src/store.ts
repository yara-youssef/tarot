import { reactive, watch } from 'vue'

export interface DrawnCard { id: string; reversed: boolean; position: string; intuition: string }
export interface Reading {
  id: string
  date: string
  spreadId: string
  question: string
  reversalMethod: string | null
  cards: DrawnCard[]
  physical?: boolean // drawn from a physical deck
  story: string
  reflection: string // added later, when looking back
}

export interface Highlight {
  id: string
  page: number // printed page in the guide
  cardId: string | null // the card this passage is about
  text: string
  color: string
  rects: [number, number, number, number][] // x, y, w, h as fractions of the page
  date: string
}

interface State {
  learned: string[] // card ids marked as learned
  notes: Record<string, string> // personal meaning per card
  boxes: Record<string, number> // flashcard Leitner box per card (0 = new … 4 = mastered)
  quiz: { answered: number; correct: number }
  readings: Reading[]
  highlights: Highlight[]
  useReversals: boolean
  drawMode: 'app' | 'deck' // draw on screen, or enter cards from your own physical deck
  reversalMethod: string
}

const KEY = 'tarot-study-v1'
const defaults: State = {
  learned: [], notes: {}, boxes: {}, quiz: { answered: 0, correct: 0 }, readings: [], highlights: [],
  useReversals: false, reversalMethod: 'internal', drawMode: 'app',
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch { /* storage unavailable */ }
  return structuredClone(defaults)
}

export const store = reactive<State>(load())

watch(store, (s) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
}, { deep: true })

export function isLearned(id: string) { return store.learned.includes(id) }
export function toggleLearned(id: string) {
  const i = store.learned.indexOf(id)
  if (i >= 0) store.learned.splice(i, 1)
  else store.learned.push(id)
}

/** Append a passage from the guide to a card's personal notes. */
export function addQuoteToNotes(cardId: string, text: string, page: number) {
  const quote = `“${text.trim()}” (guide p. ${page})`
  const prev = store.notes[cardId]?.trim()
  store.notes[cardId] = prev ? `${prev}\n\n${quote}` : quote
}

export function exportData(): string { return JSON.stringify(store, null, 2) }
export function importData(json: string) {
  const data = JSON.parse(json)
  Object.assign(store, { ...defaults, ...data })
}

// UI state shared across views (which modal is open)
export const ui = reactive({
  cardId: null as string | null,
  guidePage: null as number | null,
})
export function openCard(id: string) { ui.cardId = id }
export function openGuide(page: number) { ui.guidePage = page }

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}
