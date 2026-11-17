// Merging app data between devices.
//
// The app state is flattened into small independent entries (one per learned card, note,
// journal reading, highlight, …). Each entry remembers when it last changed; when two devices
// disagree, the most recent change wins for that entry only. Deleted items are kept as
// "tombstones" (value null) so a deletion on one device also removes the item on the others.
// No imports here, so this file can be tested on its own.

export type Flat = Record<string, unknown>
export interface Entry { v: unknown; t: number } // v === null means deleted
export type SyncDoc = { app: 'tarot-study'; version: 1; entries: Record<string, Entry> }

interface Syncable {
  learned: string[]
  notes: Record<string, string>
  boxes: Record<string, number>
  quiz: { answered: number; correct: number }
  readings: { id: string; date: string }[]
  highlights: { id: string; date: string }[]
  useReversals: boolean
  reversalMethod: string
  drawMode: string
}

export function flatten(s: Syncable): Flat {
  const f: Flat = {}
  for (const id of s.learned) f[`learned:${id}`] = true
  for (const [id, n] of Object.entries(s.notes)) if (n.trim()) f[`note:${id}`] = n
  for (const [id, b] of Object.entries(s.boxes)) f[`box:${id}`] = b
  for (const r of s.readings) f[`reading:${r.id}`] = r
  for (const h of s.highlights) f[`hl:${h.id}`] = h
  f.quiz = s.quiz
  f.prefs = { useReversals: s.useReversals, reversalMethod: s.reversalMethod, drawMode: s.drawMode }
  return f
}

export function unflatten<T extends Syncable>(f: Flat, base: T): T {
  const s: T = { ...base, learned: [], notes: {}, boxes: {}, readings: [], highlights: [] }
  for (const [k, v] of Object.entries(f)) {
    const i = k.indexOf(':')
    const kind = i < 0 ? k : k.slice(0, i)
    const id = k.slice(i + 1)
    if (kind === 'learned') s.learned.push(id)
    else if (kind === 'note') s.notes[id] = v as string
    else if (kind === 'box') s.boxes[id] = v as number
    else if (kind === 'reading') (s.readings as unknown[]).push(v)
    else if (kind === 'hl') (s.highlights as unknown[]).push(v)
    else if (kind === 'quiz') s.quiz = v as T['quiz']
    else if (kind === 'prefs') Object.assign(s, v)
  }
  s.readings.sort((a, b) => b.date.localeCompare(a.date))
  s.highlights.sort((a, b) => a.date.localeCompare(b.date))
  return s
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Update the change times after a local edit: entries whose value changed (or disappeared)
 * since `prev` get the time `now`. Returns the new stamps.
 */
export function stamp(prev: Flat, next: Flat, stamps: Record<string, number>, now: number): Record<string, number> {
  const out = { ...stamps }
  for (const k of new Set([...Object.keys(prev), ...Object.keys(next)])) {
    if (!same(prev[k], next[k])) out[k] = now
  }
  return out
}

/** Local data + change times as sync entries (missing-but-stamped keys become tombstones). */
export function toEntries(flat: Flat, stamps: Record<string, number>): Record<string, Entry> {
  const e: Record<string, Entry> = {}
  for (const [k, t] of Object.entries(stamps)) e[k] = { v: k in flat ? flat[k] : null, t }
  // Data that has never been edited since sync was set up counts as very old (t = 0),
  // so anything newer on another device wins, but nothing is lost.
  for (const [k, v] of Object.entries(flat)) if (!(k in e)) e[k] = { v, t: 0 }
  return e
}

/** Combine two sets of entries: for each key, the most recent change wins. */
export function mergeEntries(a: Record<string, Entry>, b: Record<string, Entry>): Record<string, Entry> {
  const out: Record<string, Entry> = { ...a }
  for (const [k, e] of Object.entries(b)) {
    const mine = out[k]
    if (!mine || e.t > mine.t || (e.t === mine.t && mine.v === null && e.v !== null)) out[k] = e
  }
  return out
}

export function entriesToFlat(e: Record<string, Entry>): Flat {
  const f: Flat = {}
  for (const [k, { v }] of Object.entries(e)) if (v !== null) f[k] = v
  return f
}

export function entriesToStamps(e: Record<string, Entry>): Record<string, number> {
  const s: Record<string, number> = {}
  for (const [k, { t }] of Object.entries(e)) if (t > 0) s[k] = t
  return s
}

export function sameEntries(a: Record<string, Entry>, b: Record<string, Entry>): boolean {
  const ka = Object.keys(a), kb = Object.keys(b)
  return ka.length === kb.length && ka.every((k) => b[k] && b[k].t === a[k]!.t && same(a[k]!.v, b[k].v))
}
