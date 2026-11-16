<script setup lang="ts">
import { computed, ref } from 'vue'
import { DECK, SECTIONS, numerologyNote, type Card, type Suit } from '@/data/deck'
import { openCard, shuffle, store } from '@/store'
import TarotCard from '@/components/TarotCard.vue'

const mode = ref<'flash' | 'quiz'>('flash')
const scope = ref<Suit | 'all' | 'learned'>('all')
const pool = computed<Card[]>(() => {
  if (scope.value === 'all') return DECK
  if (scope.value === 'learned') return DECK.filter((c) => store.learned.includes(c.id))
  return DECK.filter((c) => c.suit === scope.value)
})
const BOXES = ['New', 'Learning', 'Familiar', 'Strong', 'Mastered']
const boxOf = (id: string) => store.boxes[id] ?? 0
const boxCounts = computed(() => BOXES.map((_, i) => pool.value.filter((c) => boxOf(c.id) === i).length))

// ───── Flashcards (Leitner-style: weaker cards come up more often) ─────
const current = ref<Card | null>(null)
const flipReversed = ref(false)
const includeReversed = ref(false)
const impression = ref('')
const revealed = ref(false)

function pickWeighted(cards: Card[], avoid?: string): Card {
  const weights = cards.map((c) => (c.id === avoid && cards.length > 1 ? 0 : 2 ** (4 - boxOf(c.id))))
  let r = Math.random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < cards.length; i++) { r -= weights[i]!; if (r <= 0) return cards[i]! }
  return cards[cards.length - 1]!
}
function nextFlash() {
  if (!pool.value.length) { current.value = null; return }
  current.value = pickWeighted(pool.value, current.value?.id)
  flipReversed.value = includeReversed.value && Math.random() < 0.5
  impression.value = ''
  revealed.value = false
}
function grade(delta: number) {
  const id = current.value!.id
  store.boxes[id] = delta < 0 ? 0 : Math.min(4, boxOf(id) + delta)
  nextFlash()
}

// ───── Quiz ─────
interface Q { kind: 'which-card' | 'which-keywords'; card: Card; reversed: boolean; options: Card[] }
const question = ref<Q | null>(null)
const answer = ref<string | null>(null)
const streak = ref(0)

function makeQuestion() {
  const cards = pool.value.length >= 4 ? pool.value : DECK
  const card = cards[Math.floor(Math.random() * cards.length)]!
  // Distractors: prefer same suit to make it a real test
  const same = shuffle(cards.filter((c) => c.id !== card.id && c.suit === card.suit))
  const other = shuffle(DECK.filter((c) => c.id !== card.id && c.suit !== card.suit))
  const options = shuffle([card, ...[...same, ...other].slice(0, 3)])
  question.value = {
    kind: Math.random() < 0.5 ? 'which-card' : 'which-keywords',
    card, reversed: Math.random() < 0.3, options,
  }
  answer.value = null
}
function choose(id: string) {
  if (answer.value) return
  answer.value = id
  store.quiz.answered++
  if (id === question.value!.card.id) { store.quiz.correct++; streak.value++ }
  else streak.value = 0
}
const kws = (c: Card, rev: boolean) => (rev ? c.keywordsRev : c.keywordsUp).join(', ')

function start() { if (mode.value === 'flash') nextFlash(); else makeQuestion() }
function setMode(m: 'flash' | 'quiz') { mode.value = m; start() }
function setScope(s: typeof scope.value) { scope.value = s; start() }
start()
</script>

<template>
  <div class="stack">
    <div>
      <h1>Practice</h1>
      <p class="muted">Short, regular sessions work best. Cards you find hard come back more often.</p>
    </div>

    <div class="chips-toggle">
      <button :class="{ on: mode === 'flash' }" @click="setMode('flash')">Intuition flashcards</button>
      <button :class="{ on: mode === 'quiz' }" @click="setMode('quiz')">Keyword quiz</button>
    </div>
    <div class="chips-toggle small">
      <button :class="{ on: scope === 'all' }" @click="setScope('all')">All cards</button>
      <button v-for="s in SECTIONS" :key="s.key" :class="{ on: scope === s.key }" @click="setScope(s.key)">{{ s.title.replace('Suit of ', '') }}</button>
      <button :class="{ on: scope === 'learned' }" @click="setScope('learned')">My learned cards ({{ store.learned.length }})</button>
    </div>

    <!-- FLASHCARDS -->
    <template v-if="mode === 'flash'">
      <div class="boxes small">
        <div v-for="(b, i) in BOXES" :key="b" class="box"><b>{{ boxCounts[i] }}</b><span class="muted">{{ b }}</span></div>
      </div>
      <label class="row small"><input v-model="includeReversed" type="checkbox" style="width: auto" @change="nextFlash" /> Include reversed cards</label>

      <p v-if="!current" class="panel muted">No cards in this group yet. Mark some cards as learned first, or choose another group.</p>
      <div v-else class="panel flash">
        <div class="flash-card"><TarotCard :id="current.id" :reversed="flipReversed" /></div>
        <div class="stack">
          <div>
            <h2>{{ current.name }}<span v-if="flipReversed" class="muted"> (reversed)</span></h2>
            <p class="muted small">Before you look anything up: what do you see, feel or remember? What energy does this card have? Think of the suit, the number, and the picture in your deck.</p>
          </div>
          <textarea v-model="impression" placeholder="My first impression…" :disabled="revealed" />
          <button v-if="!revealed" class="btn primary" @click="revealed = true">Reveal the meaning</button>

          <div v-else class="stack reveal">
            <div>
              <span class="label">{{ flipReversed ? 'Reversed' : 'Upright' }} keywords</span>
              <span v-for="k in flipReversed ? current.keywordsRev : current.keywordsUp" :key="k" class="chip">{{ k }}</span>
            </div>
            <p><b>{{ current.essence }}</b> {{ flipReversed ? current.reversed : current.upright }}</p>
            <p class="small muted">{{ numerologyNote(current) }}</p>
            <p v-if="store.notes[current.id]" class="small"><b>Your own meaning:</b> {{ store.notes[current.id] }}</p>
            <div>
              <span class="label">How well did you know it?</span>
              <div class="row">
                <button class="btn bad" @click="grade(-1)">Not yet</button>
                <button class="btn" @click="grade(0)">Partly</button>
                <button class="btn good" @click="grade(1)">Knew it</button>
                <button class="btn ghost small" @click="openCard(current.id)">Open card</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- QUIZ -->
    <template v-else-if="question">
      <div class="row small muted">
        <span>Score: {{ store.quiz.correct }} / {{ store.quiz.answered }}</span>
        <span v-if="streak > 1">· 🔥 {{ streak }} in a row</span>
      </div>
      <div class="panel stack">
        <template v-if="question.kind === 'which-card'">
          <div class="eyebrow">Which card is this?</div>
          <h2 class="q">“{{ kws(question.card, question.reversed) }}”</h2>
          <p class="muted small">{{ question.reversed ? 'Reversed' : 'Upright' }} keywords</p>
          <div class="opts cards">
            <button v-for="o in question.options" :key="o.id" class="opt"
              :class="{ right: answer && o.id === question.card.id, wrong: answer === o.id && o.id !== question.card.id }"
              @click="choose(o.id)">
              <TarotCard :id="o.id" :reversed="question.reversed" />
            </button>
          </div>
        </template>
        <template v-else>
          <div class="eyebrow">Which keywords match?</div>
          <div class="qcard">
            <div class="mini"><TarotCard :id="question.card.id" :reversed="question.reversed" /></div>
            <h2 class="q">{{ question.card.name }}<span class="muted">{{ question.reversed ? ' reversed' : ' upright' }}</span></h2>
          </div>
          <div class="opts">
            <button v-for="o in question.options" :key="o.id" class="opt text"
              :class="{ right: answer && o.id === question.card.id, wrong: answer === o.id && o.id !== question.card.id }"
              @click="choose(o.id)">
              {{ kws(o, question.reversed) }}
            </button>
          </div>
        </template>

        <div v-if="answer" class="stack">
          <p :style="{ color: answer === question.card.id ? 'var(--good)' : 'var(--bad)' }">
            <b>{{ answer === question.card.id ? 'Correct!' : `Not quite: it's ${question.card.name}.` }}</b>
            {{ question.card.essence }}
          </p>
          <div class="row">
            <button class="btn primary" @click="makeQuestion">Next question →</button>
            <button class="btn ghost" @click="openCard(question.card.id)">Study this card</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.boxes { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.box { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 6px; display: flex; flex-direction: column; align-items: center; }
.box b { font: 700 1.3rem var(--serif); }
.flash { display: grid; grid-template-columns: 200px 1fr; gap: 24px; }
.flash-card { max-width: 200px; }
.reveal { animation: fade .3s; }
@keyframes fade { from { opacity: 0; transform: translateY(6px); } }
.q { font-size: 1.5rem; }
.qcard { display: flex; gap: 14px; align-items: center; }
.mini { width: 70px; flex: none; }
.opts { display: grid; gap: 10px; }
.opts.cards { grid-template-columns: repeat(4, 1fr); }
.opt { background: var(--surface); border: 2px solid var(--border); border-radius: 12px; padding: 8px; color: inherit; text-align: left; }
.opt:hover { border-color: var(--accent); }
.opt.text { padding: 12px 14px; }
.opt.right { border-color: var(--good); background: color-mix(in srgb, var(--good) 12%, var(--surface)); }
.opt.wrong { border-color: var(--bad); background: color-mix(in srgb, var(--bad) 12%, var(--surface)); }
@media (max-width: 640px) {
  .flash { grid-template-columns: 1fr; }
  .flash-card { margin: 0 auto; max-width: 160px; }
  .opts.cards { grid-template-columns: repeat(2, 1fr); }
  .opts.cards .opt { max-width: 150px; justify-self: center; }
}
</style>
