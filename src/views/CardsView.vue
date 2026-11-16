<script setup lang="ts">
import { computed, ref } from 'vue'
import { DECK, SECTIONS, type Suit } from '@/data/deck'
import { openCard, store } from '@/store'
import TarotCard from '@/components/TarotCard.vue'

const initial = new URLSearchParams(location.hash.split('?')[1] ?? '').get('s') as Suit | null
const filter = ref<Suit | 'all'>(initial ?? 'all')
const status = ref<'all' | 'todo' | 'done'>('all')
const q = ref('')

const sections = computed(() => {
  const term = q.value.trim().toLowerCase()
  return SECTIONS.filter((s) => filter.value === 'all' || s.key === filter.value)
    .map((s) => ({
      ...s,
      cards: s.cards.filter((c) => {
        if (status.value === 'todo' && store.learned.includes(c.id)) return false
        if (status.value === 'done' && !store.learned.includes(c.id)) return false
        if (!term) return true
        return [c.name, c.essence, ...c.keywordsUp, ...c.keywordsRev].join(' ').toLowerCase().includes(term)
      }),
    }))
    .filter((s) => s.cards.length)
})
const total = computed(() => sections.value.reduce((a, s) => a + s.cards.length, 0))
</script>

<template>
  <div class="stack">
    <div>
      <h1>The cards</h1>
      <p class="muted">Tap a card to study it. Search works on names and keywords, e.g. "new beginnings" or "conflict".</p>
    </div>
    <div class="filters stack">
      <input v-model="q" type="search" placeholder="Search cards or keywords…" aria-label="Search cards" />
      <div class="chips-toggle">
        <button :class="{ on: filter === 'all' }" @click="filter = 'all'">All 78</button>
        <button v-for="s in SECTIONS" :key="s.key" :class="{ on: filter === s.key }" @click="filter = s.key">{{ s.title.replace('Suit of ', '') }}</button>
      </div>
      <div class="chips-toggle">
        <button :class="{ on: status === 'all' }" @click="status = 'all'">Any</button>
        <button :class="{ on: status === 'todo' }" @click="status = 'todo'">Still to learn</button>
        <button :class="{ on: status === 'done' }" @click="status = 'done'">Learned</button>
      </div>
    </div>

    <p v-if="!total" class="muted">No cards match. Try another word.</p>
    <section v-for="s in sections" :key="s.key">
      <h2 :style="{ color: s.color }">{{ s.title }}</h2>
      <div class="grid">
        <button v-for="c in s.cards" :key="c.id" class="cell" @click="openCard(c.id)">
          <TarotCard :id="c.id" />
          <span v-if="store.learned.includes(c.id)" class="tick" title="Learned">✓</span>
          <span class="kw small muted">{{ c.keywordsUp.slice(0, 2).join(' · ') }}</span>
        </button>
      </div>
    </section>
    <p class="small muted">{{ store.learned.length }} / {{ DECK.length }} learned</p>
  </div>
</template>

<style scoped>
.filters { position: sticky; top: 60px; z-index: 5; background: var(--bg); padding: 8px 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 16px; }
.cell { position: relative; background: none; border: 0; padding: 0; color: inherit; text-align: center; display: flex; flex-direction: column; gap: 6px; }
.cell:hover :deep(svg) { transform: translateY(-4px); }
.tick { position: absolute; top: -6px; right: -6px; width: 26px; height: 26px; border-radius: 50%; background: var(--good); color: #fff; display: grid; place-items: center; font-size: .85rem; font-weight: 700; }
.kw { line-height: 1.3; }
@media (max-width: 720px) { .filters { top: 52px; } .grid { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 12px; } }
</style>
