import { reactive, watch } from 'vue'

export interface DrawnCard { id: string; reversed: boolean; position: string; intuition: string }
export interface Reading {
  id: string
  date: string
  spreadId: string
  question: string
  reversalMethod: string | null
  cards: DrawnCard[]
  story: string
  reflection: string // added later, when looking back
}

interface State {
  learned: string[] // card ids marked as learned
  notes: Record<string, string> // personal meaning per card
  boxes: Record<string, number> // flashcard Leitner box per card (0 = new … 4 = mastered)
  quiz: { answered: number; correct: number }
  readings: Reading[]
  useReversals: boolean
  reversalMethod: string
}

const KEY = 'tarot-study-v1'
const defaults: State = {
  learned: [], notes: {}, boxes: {}, quiz: { answered: 0, correct: 0 }, readings: [],
  useReversals: false, reversalMethod: 'internal',
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
