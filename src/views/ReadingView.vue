<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import {
  CARD_BY_ID, DECK, GOOD_QUESTIONS, REVERSAL_METHODS, SPREADS, SUITS, numerologyNote, questionWarning, reduceNumber,
} from '@/data/deck'
import { openCard, shuffle, store, type DrawnCard } from '@/store'
import TarotCard from '@/components/TarotCard.vue'
import PhysicalDraw, { type Slot } from '@/components/PhysicalDraw.vue'

const step = ref(0)
const STEPS = ['Clear your mind', 'Ask', 'Choose a spread', 'Draw', 'Read each card', 'The story']

// Step 0 – breathing
const breath = ref(0) // 0..3 completed
const phase = ref<'idle' | 'in' | 'out'>('idle')
let timer: number | undefined
const PROMPTS = ['Relax', 'Be present', 'Open your mind to receive']
function breathe() {
  if (phase.value !== 'idle') return
  phase.value = 'in'
  timer = window.setTimeout(() => {
    phase.value = 'out'
    timer = window.setTimeout(() => { phase.value = 'idle'; breath.value++ }, 4500)
  }, 4000)
}
onUnmounted(() => clearTimeout(timer))

// Step 1 – question
const question = ref('')
const warning = computed(() => questionWarning(question.value))

// Step 2 – spread
const spreadId = ref('ppf')
const spread = computed(() => SPREADS.find((s) => s.id === spreadId.value)!)

// Step 3 – draw
const deck = ref<{ id: string; reversed: boolean }[]>([])
const fan = ref<number[]>([]) // indices into deck shown face-down to pick from
const drawn = ref<DrawnCard[]>([])
const shuffling = ref(false)
function doShuffle() {
  shuffling.value = true
  deck.value = shuffle(DECK).map((c) => ({ id: c.id, reversed: store.useReversals && Math.random() < 0.35 }))
  fan.value = Array.from({ length: 13 }, (_, i) => i)
  drawn.value = []
  setTimeout(() => (shuffling.value = false), 900)
}
// Cards entered from your own deck, one slot per position
const slots = ref<(Slot | null)[]>([])
const physical = computed(() => store.drawMode === 'deck')
function physicalToDrawn() {
  drawn.value = slots.value.map((s, i) => ({ id: s!.id, reversed: store.useReversals && s!.reversed, position: spread.value.positions[i]!, intuition: '' }))
}
function pick(i: number) {
  if (drawn.value.length >= spread.value.positions.length) return
  const c = deck.value[i]!
  drawn.value.push({ ...c, position: spread.value.positions[drawn.value.length]!, intuition: '' })
  fan.value = fan.value.filter((x) => x !== i)
}

// Step 4 – interpret
const cur = ref(0)
const flipped = ref<boolean[]>([])
const revealed = ref<boolean[]>([])
const method = computed(() => REVERSAL_METHODS.find((m) => m.id === store.reversalMethod) ?? REVERSAL_METHODS[0]!)

// Step 5 – story
const story = ref('')
const saved = ref(false)
const analysis = computed(() => {
  const cards = drawn.value.map((d) => ({ ...d, card: CARD_BY_ID[d.id]! }))
  const n = cards.length
  const notes: string[] = []
  if (n < 2) return notes
  const majors = cards.filter((c) => c.card.suit === 'major')
  const revs = cards.filter((c) => c.reversed)
  if (majors.length / n > 0.5) notes.push(`${majors.length} of ${n} cards are Major Arcana: significant life lessons and long-term themes are at play.`)
  else if (majors.length === 0) notes.push('No Major Arcana: this is about everyday matters that are within your control.')
  else notes.push(`The Major Arcana card${majors.length > 1 ? 's' : ''} (${majors.map((m) => m.card.name).join(', ')}) set the main theme; read the other cards in relation to ${majors.length > 1 ? 'them' : 'it'}.`)
  if (revs.length && revs.length / n > 0.5) notes.push('Most cards are reversed: the energy is mostly internal. Changes may need to start within you.')
  const suits: Record<string, number> = {}
  cards.forEach((c) => { if (c.card.suit !== 'major') suits[c.card.suit] = (suits[c.card.suit] ?? 0) + 1 })
  for (const [s, k] of Object.entries(suits)) if (k >= 2 && k / n >= 0.4) {
    const info = SUITS[s as keyof typeof SUITS]
    notes.push(`${k} ${info.name} (${info.element}): a strong focus on ${info.domain.toLowerCase()}.`)
  }
  const missing = (Object.keys(SUITS) as (keyof typeof SUITS)[]).filter((s) => !suits[s])
  if (n >= 5 && missing.length === 1) notes.push(`No ${SUITS[missing[0]!].name}: little ${SUITS[missing[0]!].element.toLowerCase()} energy here.`)
  const nums: Record<number, number> = {}
  cards.forEach((c) => {
    const num = c.card.suit === 'major' ? (c.card.number ? reduceNumber(c.card.number) : 0) : c.card.number <= 10 ? c.card.number : 0
    if (num) nums[num] = (nums[num] ?? 0) + 1
  })
  for (const [num, k] of Object.entries(nums)) if (k >= 2)
    notes.push(`The number ${num} appears ${k} times: ${numerologyNote({ ...cards[0]!.card, suit: 'cups', number: Number(num) }).replace(/^\d+: /, '').toLowerCase()}`)
  const courts = cards.filter((c) => c.card.suit !== 'major' && c.card.number > 10)
  if (courts.length >= 2) notes.push(`${courts.length} court cards: other people, or different sides of your personality, play a big role.`)
  return notes
})

function next() {
  if (step.value === 2) {
    doShuffle()
    slots.value = spread.value.positions.map(() => null)
  }
  if (step.value === 3) {
    if (physical.value) physicalToDrawn()
    cur.value = 0
    // Physical cards are already face up on your table
    flipped.value = drawn.value.map(() => physical.value)
    revealed.value = drawn.value.map(() => false)
  }
  step.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function save() {
  store.readings.unshift({
    id: Date.now().toString(36), date: new Date().toISOString(), spreadId: spreadId.value,
    question: question.value.trim(), reversalMethod: store.useReversals ? store.reversalMethod : null,
    cards: drawn.value.map((d) => ({ ...d })), physical: physical.value, story: story.value, reflection: '',
  })
  saved.value = true
}
function restart() {
  step.value = 0; breath.value = 0; question.value = ''; drawn.value = []; slots.value = []; story.value = ''; saved.value = false
}
const canNext = computed(() => [
  true, question.value.trim().length > 0, true,
  physical.value ? slots.value.length === spread.value.positions.length && slots.value.every(Boolean) : drawn.value.length === spread.value.positions.length,
  revealed.value.every(Boolean), true,
][step.value])
</script>

<template>
  <div class="stack">
    <div>
      <h1>Guided reading</h1>
      <ol class="stepper small">
        <li v-for="(s, i) in STEPS" :key="s" :class="{ on: i === step, done: i < step }">{{ s }}</li>
      </ol>
    </div>

    <!-- 0 Breathe -->
    <section v-if="step === 0" class="panel center stack">
      <p>A reading begins the moment you decide to consult the cards. Take three deep breaths.</p>
      <button class="orb" :class="phase" :disabled="phase !== 'idle' || breath >= 3" @click="breathe">
        <span v-if="phase === 'in'">Breathe in…</span>
        <span v-else-if="phase === 'out'">Breathe out… {{ PROMPTS[breath] }}</span>
        <span v-else-if="breath < 3">Tap to breathe<br /><small>{{ breath + 1 }} of 3</small></span>
        <span v-else>Ready ✦</span>
      </button>
      <div class="row center">
        <button class="btn primary" @click="next">{{ breath >= 3 ? 'Continue' : 'Skip' }}</button>
      </div>
    </section>

    <!-- 1 Question -->
    <section v-if="step === 1" class="panel stack">
      <label class="label" for="q">What do you want to explore?</label>
      <textarea id="q" v-model="question" placeholder="e.g. What do I need to know about my career right now?" />
      <p v-if="warning" class="warn small">💡 {{ warning }}</p>
      <div>
        <span class="label small">Open questions that work well</span>
        <button v-for="g in GOOD_QUESTIONS" :key="g" class="chip qbtn" @click="question = g">{{ g }}</button>
      </div>
      <div class="row"><button class="btn" @click="step--">Back</button><button class="btn primary" :disabled="!canNext" @click="next">Continue</button></div>
    </section>

    <!-- 2 Spread -->
    <section v-if="step === 2" class="stack">
      <div class="spreads">
        <button v-for="s in SPREADS" :key="s.id" class="panel spread" :class="{ on: s.id === spreadId }" @click="spreadId = s.id">
          <b>{{ s.name }}</b>
          <span class="small muted">{{ s.description }}</span>
          <span class="small">{{ s.positions.join(' · ') }}</span>
        </button>
      </div>
      <div class="panel stack">
        <label class="row"><input v-model="store.useReversals" type="checkbox" style="width: auto" /> <b>Read with reversed cards</b></label>
        <div v-if="store.useReversals">
          <p class="small muted">Decide before you draw how you'll read reversals in this reading:</p>
          <div class="chips-toggle">
            <button v-for="m in REVERSAL_METHODS" :key="m.id" :class="{ on: store.reversalMethod === m.id }" @click="store.reversalMethod = m.id">{{ m.name }}</button>
          </div>
          <p class="small" style="margin-top: 6px">{{ method.short }}</p>
        </div>
      </div>
      <div class="row"><button class="btn" @click="step--">Back</button><button class="btn primary" @click="next">Shuffle the deck</button></div>
    </section>

    <!-- 3 Draw -->
    <section v-if="step === 3" class="stack">
      <div class="chips-toggle center" role="radiogroup" aria-label="How are you drawing?">
        <button :class="{ on: !physical }" role="radio" :aria-checked="!physical" @click="store.drawMode = 'app'">✦ Draw in the app</button>
        <button :class="{ on: physical }" role="radio" :aria-checked="physical" @click="store.drawMode = 'deck'">🂠 I'm using my own deck</button>
      </div>

      <template v-if="physical">
        <div class="panel">
          <p class="center"><em>“{{ question }}”</em></p>
          <p class="center muted small">
            Shuffle your deck while focusing on your question, then lay out {{ spread.positions.length }} card{{ spread.positions.length > 1 ? 's' : '' }}
            left to right: {{ spread.positions.join(' · ') }}. Then enter each card below.
          </p>
        </div>
        <PhysicalDraw v-model="slots" :positions="spread.positions" :use-reversals="store.useReversals" />
        <div class="row"><button class="btn" @click="step--">Back</button><button class="btn primary" :disabled="!canNext" @click="next">Read the cards</button></div>
      </template>

      <template v-else>
        <div class="panel">
          <p class="center"><em>“{{ question }}”</em></p>
          <p class="center muted small">Focus on your question and pick {{ spread.positions.length }} card{{ spread.positions.length > 1 ? 's' : '' }}. ({{ drawn.length }}/{{ spread.positions.length }})</p>
          <div class="fan" :class="{ shuffling }">
            <button v-for="(i, k) in fan" :key="i" class="fan-card" :style="{ '--k': k, '--n': fan.length }" :aria-label="`Pick card ${k + 1}`" @click="pick(i)">
              <TarotCard :id="deck[i]!.id" face-down />
            </button>
          </div>
        </div>
        <div class="layout">
          <div v-for="(p, i) in spread.positions" :key="p" class="slot">
            <div class="slot-card"><TarotCard v-if="drawn[i]" :id="drawn[i]!.id" face-down /></div>
            <span class="small muted">{{ p }}</span>
          </div>
        </div>
        <div class="row"><button class="btn" @click="doShuffle">Reshuffle</button><button class="btn primary" :disabled="!canNext" @click="next">Turn the cards over</button></div>
      </template>
    </section>

    <!-- 4 Interpret -->
    <section v-if="step === 4" class="stack">
      <div class="layout">
        <button v-for="(d, i) in drawn" :key="i" class="slot" :class="{ cur: i === cur }" @click="cur = i">
          <div class="slot-card"><TarotCard :id="d.id" :reversed="d.reversed" :face-down="!flipped[i]" :show-name="true" /></div>
          <span class="small" :class="{ muted: i !== cur }">{{ d.position }} {{ revealed[i] ? '✓' : '' }}</span>
        </button>
      </div>

      <div class="panel stack" v-for="(d, i) in drawn" v-show="i === cur" :key="'p' + i">
        <div class="eyebrow">{{ d.position }}</div>
        <template v-if="!flipped[i]">
          <button class="btn primary" @click="flipped[i] = true">Turn over the card</button>
        </template>
        <template v-else>
          <h2>{{ CARD_BY_ID[d.id]!.name }}<span v-if="d.reversed" class="muted"> (reversed)</span></h2>
          <p class="small muted">
            Intuition first: look at the card on your table (or picture it). What stands out? What do you feel? What story does it tell in the position of <b>{{ d.position }}</b>?
          </p>
          <textarea v-model="d.intuition" placeholder="What I see and feel…" />
          <button v-if="!revealed[i]" class="btn primary" @click="revealed[i] = true">Now show me the meaning</button>
          <div v-else class="stack">
            <div>
              <span v-for="k in d.reversed ? CARD_BY_ID[d.id]!.keywordsRev : CARD_BY_ID[d.id]!.keywordsUp" :key="k" class="chip">{{ k }}</span>
            </div>
            <p><b>{{ CARD_BY_ID[d.id]!.essence }}</b> {{ d.reversed ? CARD_BY_ID[d.id]!.reversed : CARD_BY_ID[d.id]!.upright }}</p>
            <p v-if="d.reversed" class="small method"><b>{{ method.name }}:</b> {{ method.prompt(CARD_BY_ID[d.id]!) }}</p>
            <p class="small"><b>Reflect:</b> <em>{{ CARD_BY_ID[d.id]!.ask }}</em></p>
            <div class="row">
              <button class="btn ghost small" @click="openCard(d.id)">More about this card</button>
              <button v-if="i < drawn.length - 1" class="btn primary" @click="cur = i + 1">Next card →</button>
            </div>
          </div>
        </template>
      </div>
      <div class="row"><button class="btn primary" :disabled="!canNext" @click="next">See the whole story</button></div>
    </section>

    <!-- 5 Story -->
    <section v-if="step === 5" class="stack">
      <div class="panel stack">
        <p class="center"><em>“{{ question }}”</em></p>
        <div class="layout">
          <div v-for="(d, i) in drawn" :key="i" class="slot">
            <div class="slot-card"><TarotCard :id="d.id" :reversed="d.reversed" /></div>
            <span class="small muted">{{ d.position }}</span>
          </div>
        </div>
        <div v-if="analysis.length">
          <h3>Patterns in this reading</h3>
          <ul class="small"><li v-for="a in analysis" :key="a">{{ a }}</li></ul>
        </div>
        <div>
          <h3>Tell the story</h3>
          <p class="small muted">Read the cards left to right like the pages of a storybook. Look for combinations and themes, then answer your question in your own words.</p>
          <ul class="small muted">
            <li v-for="(d, i) in drawn" :key="i"><b>{{ d.position }}: {{ CARD_BY_ID[d.id]!.name }}{{ d.reversed ? ' (rev.)' : '' }}</b>: {{ d.intuition || CARD_BY_ID[d.id]!.essence }}</li>
          </ul>
          <textarea v-model="story" placeholder="The story the cards tell, and my answer…" style="min-height: 140px" />
        </div>
        <div class="row">
          <button v-if="!saved" class="btn primary" @click="save">Save to my journal</button>
          <a v-else class="btn good" href="#/journal">✓ Saved: view journal</a>
          <button class="btn" @click="restart">New reading</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.center { text-align: center; justify-content: center; }
.stepper { display: flex; gap: 6px; list-style: none; padding: 0; margin: 0; flex-wrap: wrap; counter-reset: s; }
.stepper li { counter-increment: s; padding: .25em .7em; border-radius: 99px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); }
.stepper li::before { content: counter(s) '. '; }
.stepper li.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.stepper li.done { color: var(--text); }
@media (max-width: 640px) { .stepper li:not(.on) { font-size: 0; padding: 0; width: 10px; height: 10px; } .stepper li:not(.on)::before { content: ''; } .stepper { align-items: center; } }

.orb { width: 200px; height: 200px; border-radius: 50%; margin: 10px auto; border: 0; color: #fff; font: 600 1.2rem var(--serif);
  background: radial-gradient(circle at 35% 30%, #b49ae6, #6b4fa0 60%, #3b2a63); box-shadow: 0 0 40px rgb(107 79 160 / .4);
  transform: scale(.75); transition: transform 4s ease-in-out; display: grid; place-items: center; padding: 20px; }
.orb.in { transform: scale(1); }
.orb.out { transform: scale(.75); transition-duration: 4.5s; }
.orb:disabled { cursor: default; }
.orb small { font: 400 .85rem var(--sans); opacity: .8; }

.warn { background: color-mix(in srgb, var(--gold) 15%, var(--surface)); border-radius: 10px; padding: 10px 12px; margin: 0; }
.qbtn { border: 1px solid var(--border); cursor: pointer; color: var(--text); }
.qbtn:hover { border-color: var(--accent); }

.spreads { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.spread { text-align: left; display: flex; flex-direction: column; gap: 4px; color: inherit; padding: 16px; }
.spread.on { border: 2px solid var(--accent); }

.fan { position: relative; height: 230px; margin: 10px auto 0; max-width: 640px; }
.fan-card { position: absolute; left: 50%; bottom: 40px; width: 88px; border: 0; padding: 0; background: none;
  transform-origin: 50% 160%; transform: translateX(-50%) rotate(calc((var(--k) - (var(--n) - 1) / 2) * 7deg)); transition: transform .35s; }
.fan-card:hover { transform: translateX(-50%) rotate(calc((var(--k) - (var(--n) - 1) / 2) * 7deg)) translateY(-16px); z-index: 2; }
.fan.shuffling .fan-card { animation: shuf .9s ease-in-out; }
@keyframes shuf { 50% { transform: translateX(-50%) rotate(0) translateY(-10px); } }

.layout { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.slot { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 120px; background: none; border: 0; padding: 0; color: inherit; }
.slot-card { width: 100%; aspect-ratio: 200 / 340; border: 2px dashed var(--border); border-radius: 12px; }
.slot-card:has(svg) { border: 0; }
.slot.cur .slot-card { outline: 3px solid var(--accent); outline-offset: 4px; border-radius: 12px; }
.method { background: var(--surface-2); border-radius: 10px; padding: 10px 12px; }
@media (max-width: 640px) {
  .slot { width: 92px; }
  .fan { height: 180px; }
  .fan-card { width: 66px; }
}
</style>
