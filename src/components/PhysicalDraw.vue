<script setup lang="ts">
// Enter the cards you drew from your own physical deck, one per spread position.
import { computed, ref, watch } from 'vue'
import { CARD_BY_ID, SECTIONS, type Suit } from '@/data/deck'
import TarotCard from './TarotCard.vue'

export interface Slot { id: string; reversed: boolean }

const props = defineProps<{ positions: string[]; useReversals: boolean }>()
const slots = defineModel<(Slot | null)[]>({ required: true })

const active = ref(Math.max(0, slots.value.findIndex((s) => !s)))
const suit = ref<Suit>('major')
const q = ref('')

const used = computed(() => new Set(slots.value.filter(Boolean).map((s) => s!.id)))
const NUMBER_WORDS: Record<string, string> = {
  '1': 'ace', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten',
}
const results = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return SECTIONS.find((s) => s.key === suit.value)!.cards
  // Let "3 cups", "3 of cups" or "three of cups" all work
  const words = term.split(/\s+/).filter((w) => w !== 'of' && w !== 'the').map((w) => NUMBER_WORDS[w] ?? w)
  return SECTIONS.flatMap((s) => s.cards).filter((c) => {
    const hay = `${c.name} ${c.suit === 'major' ? c.label : ''}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  }).slice(0, 24)
})

function short(id: string) {
  const c = CARD_BY_ID[id]!
  if (c.suit === 'major') return c.name.replace(/^The /, '')
  return c.name.split(' of ')[0]!
}

function choose(id: string) {
  if (used.value.has(id)) return
  const next = slots.value.slice()
  next[active.value] = { id, reversed: next[active.value]?.reversed ?? false }
  slots.value = next
  q.value = ''
  const empty = next.findIndex((s) => !s)
  if (empty >= 0) active.value = empty
}
function clear(i: number) {
  const next = slots.value.slice()
  next[i] = null
  slots.value = next
  active.value = i
}
function toggleReversed(i: number) {
  const next = slots.value.slice()
  next[i] = { ...next[i]!, reversed: !next[i]!.reversed }
  slots.value = next
}
watch(() => props.positions.length, (n) => { slots.value = Array.from({ length: n }, () => null); active.value = 0 })
</script>

<template>
  <div class="stack">
    <div class="layout">
      <div v-for="(p, i) in positions" :key="p" class="slot" :class="{ cur: i === active }">
        <button class="slot-card" :aria-label="`Choose the card for ${p}`" @click="active = i">
          <TarotCard v-if="slots[i]" :id="slots[i]!.id" :reversed="slots[i]!.reversed" />
          <span v-else class="plus">+</span>
        </button>
        <span class="small" :class="{ muted: i !== active }">{{ p }}</span>
        <template v-if="slots[i]">
          <span class="small name">{{ CARD_BY_ID[slots[i]!.id]!.name }}</span>
          <div class="mini-actions">
            <button v-if="useReversals" class="tiny" :class="{ on: slots[i]!.reversed }" @click="toggleReversed(i)">
              {{ slots[i]!.reversed ? '↓ Reversed' : '↑ Upright' }}
            </button>
            <button class="tiny" @click="clear(i)">Change</button>
          </div>
        </template>
      </div>
    </div>

    <div v-if="slots.some((s) => !s)" class="panel picker stack">
      <div class="eyebrow">Which card did you draw for “{{ positions[active] }}”?</div>
      <input v-model="q" type="search" placeholder="Type a name, e.g. “3 cups”, “queen wands”, “tower”…" aria-label="Search for a card" />
      <div v-if="!q" class="chips-toggle">
        <button v-for="s in SECTIONS" :key="s.key" :class="{ on: suit === s.key }" @click="suit = s.key">{{ s.title.replace('Suit of ', '') }}</button>
      </div>
      <div class="grid">
        <button v-for="c in results" :key="c.id" class="pick" :disabled="used.has(c.id)"
          :style="{ '--c': SECTIONS.find((s) => s.key === c.suit)!.color }" @click="choose(c.id)">
          <span v-if="c.suit === 'major'" class="num">{{ c.label }}</span>
          {{ q ? c.name : short(c.id) }}
        </button>
      </div>
      <p v-if="!results.length" class="small muted">No card matches “{{ q }}”.</p>
      <p v-if="useReversals" class="small muted">Was the card upside-down? After choosing it, tap <b>↑ Upright</b> under the card to switch it to reversed.</p>
    </div>
  </div>
</template>

<style scoped>
.layout { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.slot { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 120px; text-align: center; }
.slot-card { width: 100%; aspect-ratio: 200 / 340; border: 2px dashed var(--border); border-radius: 12px; background: none; padding: 0; color: var(--muted); }
.slot-card:has(svg) { border: 0; }
.slot.cur .slot-card { outline: 3px solid var(--accent); outline-offset: 4px; }
.plus { font-size: 2rem; }
.name { font-weight: 600; line-height: 1.2; }
.mini-actions { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }
.tiny { font-size: .75rem; border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 99px; padding: .15em .6em; }
.tiny.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 6px; }
.pick { border: 1px solid var(--border); border-left: 4px solid var(--c); background: var(--surface); color: var(--text); border-radius: 8px; padding: .5em .6em; text-align: left; font-size: .9rem; }
.pick:hover:not(:disabled) { border-color: var(--c); background: var(--surface-2); }
.pick:disabled { opacity: .35; cursor: not-allowed; }
.num { color: var(--c); font-weight: 600; margin-right: 4px; font-size: .8rem; }
@media (max-width: 640px) { .slot { width: 92px; } .grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); } }
</style>
