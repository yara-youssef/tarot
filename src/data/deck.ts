import { guideKeywords } from './keywords'
import { meanings, type Meaning } from './meanings'

export type Suit = 'major' | 'cups' | 'pentacles' | 'swords' | 'wands'

export interface Card extends Meaning {
  id: string
  name: string
  suit: Suit
  number: number // 0-21 for majors, 1-14 for minors (11 Page, 12 Knight, 13 Queen, 14 King)
  label: string // roman numeral, number, or court rank shown on the card face
  page: number // printed page in the guide
  keywordsUp: string[]
  keywordsRev: string[]
  symbol?: string // astrological correspondence for majors
}

const MAJORS = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
]
// Traditional (Golden Dawn) astrological correspondences, a handy memory hook.
const MAJOR_SYMBOLS = [
  '♅', '☿', '☽', '♀', '♈', '♉', '♊', '♋', '♌', '♍', '♃',
  '♎', '♆', '♏', '♐', '♑', '♂', '♒', '♓', '☉', '♇', '♄',
]
const ROMAN = [
  '0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI',
]
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King']

export const SUITS: Record<Exclude<Suit, 'major'>, { name: string; element: string; domain: string; color: string; summary: string }> = {
  cups: {
    name: 'Cups', element: 'Water', color: '#3b82c4',
    domain: 'Emotions, relationships, love, creativity, intuition',
    summary: 'Cups are about how you feel: love, friendship, creativity and your inner emotional world. Water flows, reflects and runs deep.',
  },
  pentacles: {
    name: 'Pentacles', element: 'Earth', color: '#4f8a3c',
    domain: 'Money, work, career, the body, home, the material world',
    summary: 'Pentacles are about what is tangible: finances, work, health and the things you build. Earth is slow, solid and practical.',
  },
  swords: {
    name: 'Swords', element: 'Air', color: '#8a8fa8',
    domain: 'Thoughts, words, decisions, truth, conflict',
    summary: 'Swords are about the mind: ideas, communication, truth and the conflicts that come from them. Air is quick, sharp and can cut both ways.',
  },
  wands: {
    name: 'Wands', element: 'Fire', color: '#d0612b',
    domain: 'Passion, energy, ambition, inspiration, action',
    summary: 'Wands are about drive: inspiration, ambition, creativity in action and your spiritual spark. Fire is energising, fast and can burn out.',
  },
}

export const MAJOR_INFO = {
  name: 'Major Arcana',
  color: '#6b4fa0',
  summary: 'The 22 Major Arcana cards are the big life lessons and archetypes: the Fool\'s journey from 0 to 21. When one appears it often sets the theme of the whole reading. Many Majors means significant, long-lasting events; many reversed Majors can mean a lesson that has not yet been learned.',
}

// Numerology from the guide's bonus chapter (summarised).
export const NUMEROLOGY: Record<number, string> = {
  1: 'New beginnings, opportunity, potential',
  2: 'Balance, partnership, duality',
  3: 'Creativity, groups, growth',
  4: 'Structure, stability, manifestation',
  5: 'Change, instability, conflict',
  6: 'Communication, cooperation, harmony',
  7: 'Reflection, assessment, knowledge',
  8: 'Mastery, action, accomplishment',
  9: 'Fruition, attainment, fulfilment',
  10: 'Completion, end of a cycle, renewal',
}
export const COURTS: Record<number, { rank: string; numbers: string; role: string }> = {
  11: { rank: 'Page', numbers: '1–3', role: 'The student and messenger: curious, beginning to explore the suit\'s energy.' },
  12: { rank: 'Knight', numbers: '4–5', role: 'The one in motion: actively pursuing the suit\'s energy, sometimes to extremes.' },
  13: { rank: 'Queen', numbers: '6–7', role: 'The nurturer: expresses the suit\'s energy inwardly, with maturity and care.' },
  14: { rank: 'King', numbers: '8–10', role: 'The leader: masters the suit\'s energy and directs it outwardly.' },
}

/** Reduce a Major Arcana number to one digit, as the guide suggests (e.g. 16 → 1+6 = 7). */
export function reduceNumber(n: number): number {
  while (n > 10) n = String(n).split('').reduce((a, d) => a + Number(d), 0)
  return n
}

export function numerologyNote(card: Card): string {
  if (card.suit === 'major') {
    if (card.number === 0) return '0: unlimited potential, the number before everything begins.'
    const r = reduceNumber(card.number)
    const prefix = r === card.number ? `${r}` : `${card.number} → ${String(card.number).split('').join(' + ')} = ${r}`
    return `${prefix}: ${NUMEROLOGY[r]}.`
  }
  if (card.number <= 10) return `${card.number}: ${NUMEROLOGY[card.number]}.`
  const c = COURTS[card.number]!
  return `${c.rank}s loosely relate to numbers ${c.numbers}. ${c.role}`
}

function build(): Card[] {
  const cards: Card[] = []
  MAJORS.forEach((name, i) => {
    const id = `major-${String(i).padStart(2, '0')}`
    const kw = guideKeywords[id]!
    cards.push({
      id, name, suit: 'major', number: i, label: ROMAN[i]!, page: kw.page,
      keywordsUp: kw.upright, keywordsRev: kw.reversed, symbol: MAJOR_SYMBOLS[i], ...meanings[id]!,
    })
  })
  for (const suit of ['cups', 'pentacles', 'swords', 'wands'] as const) {
    RANKS.forEach((rank, i) => {
      const n = i + 1
      const id = `${suit}-${String(n).padStart(2, '0')}`
      const kw = guideKeywords[id]!
      cards.push({
        id, name: `${rank} of ${SUITS[suit].name}`, suit, number: n,
        label: n === 1 ? 'A' : n <= 10 ? String(n) : rank,
        page: kw.page, keywordsUp: kw.upright, keywordsRev: kw.reversed, ...meanings[id]!,
      })
    })
  }
  return cards
}

export const DECK: Card[] = build()
export const CARD_BY_ID: Record<string, Card> = Object.fromEntries(DECK.map((c) => [c.id, c]))

export const SECTIONS: { key: Suit; title: string; color: string; cards: Card[] }[] = [
  { key: 'major', title: 'Major Arcana', color: MAJOR_INFO.color, cards: DECK.filter((c) => c.suit === 'major') },
  ...(['cups', 'pentacles', 'swords', 'wands'] as const).map((s) => ({
    key: s as Suit, title: `Suit of ${SUITS[s].name}`, color: SUITS[s].color, cards: DECK.filter((c) => c.suit === s),
  })),
]

export function suitColor(s: Suit): string {
  return s === 'major' ? MAJOR_INFO.color : SUITS[s].color
}

// ───────────── Spreads ─────────────
export interface Spread { id: string; name: string; description: string; positions: string[] }
export const SPREADS: Spread[] = [
  { id: 'daily', name: 'Card of the day', description: 'One card to reflect on today. The best way to build a daily habit.', positions: ['Energy for today'] },
  { id: 'ppf', name: 'Past · Present · Future', description: 'A classic three-card story: where you came from, where you are, where it is heading.', positions: ['Past', 'Present', 'Future'] },
  { id: 'sao', name: 'Situation · Action · Outcome', description: 'What is going on, what you can do about it, and the likely result.', positions: ['Situation', 'Action to take', 'Potential outcome'] },
  { id: 'mbs', name: 'Mind · Body · Spirit', description: 'A check-in on your whole self.', positions: ['Mind', 'Body', 'Spirit'] },
  { id: 'cross', name: 'Five-card cross', description: 'A step up when you feel ready for more cards.', positions: ['Present situation', 'Challenge', 'Root cause', 'Advice', 'Potential outcome'] },
]

// ───────────── Reversal methods (guide bonus chapter 2, summarised) ─────────────
export const REVERSAL_METHODS = [
  { id: 'internal', name: 'Internalised energy', short: 'Upright energy turned inward: add "self" or "private" to the meaning.',
    prompt: (c: Card) => `How is the energy of ${c.essence.toLowerCase().replace(/\.$/, '')} showing up privately, within me, rather than out in the world?` },
  { id: 'balance', name: 'Too much or too little', short: 'The card\'s energy is out of balance: excessive or lacking.',
    prompt: (c: Card) => `Do I have too much or too little of "${c.keywordsUp[0]?.toLowerCase()}" right now? How could I bring it back into balance?` },
  { id: 'blocked', name: 'Blocked energy', short: 'The energy is present but something is stopping it flowing.',
    prompt: (c: Card) => `What is blocking "${c.keywordsUp[0]?.toLowerCase()}" in my life, and how could I release it?` },
  { id: 'imagery', name: 'Upside-down imagery', short: 'Look at the reversed picture itself and see what it suggests.',
    prompt: (c: Card) => `Picture the card upside-down: ${c.notice.charAt(0).toLowerCase() + c.notice.slice(1)} What changes when it is flipped?` },
]

export const GOOD_QUESTIONS = [
  'What do I need to know about this situation?',
  'What is the energy surrounding this situation?',
  'How can I achieve my desired outcome?',
  'What do I need to know about my relationship right now?',
  'What can I do to improve my chances at work?',
  'What do I most need to focus on today?',
]

/** Questions that hand your free will over to the cards; the guide suggests rephrasing them. */
export function questionWarning(q: string): string | null {
  const t = q.trim().toLowerCase()
  if (/^(will|is|are|am|does|do|did|can)\b/.test(t))
    return 'This sounds like a yes/no or fixed-future question. Try an open question like "What can I do to…" or "What do I need to know about…" so the reading empowers you.'
  if (/^should\b/.test(t))
    return '"Should I…" asks the cards to decide for you. Try "What do I need to consider about…" or "What might happen if I…" instead: you keep the choice.'
  return null
}
