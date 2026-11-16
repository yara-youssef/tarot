<script setup lang="ts">
import { computed, ref } from 'vue'
import { CARD_BY_ID, DECK, MAJOR_INFO, SUITS, numerologyNote } from '@/data/deck'
import { isLearned, openCard, openGuide, store, toggleLearned, ui } from '@/store'
import Modal from './Modal.vue'
import TarotCard from './TarotCard.vue'

const card = computed(() => CARD_BY_ID[ui.cardId!]!)
const reversed = ref(false)
const idx = computed(() => DECK.findIndex((c) => c.id === card.value.id))
const go = (d: number) => openCard(DECK[(idx.value + d + DECK.length) % DECK.length]!.id)
const suitInfo = computed(() => (card.value.suit === 'major' ? null : SUITS[card.value.suit]))
const note = computed({
  get: () => store.notes[card.value.id] ?? '',
  set: (v: string) => { store.notes[card.value.id] = v },
})
</script>

<template>
  <Modal @close="ui.cardId = null">
    <div class="detail">
      <div class="left">
        <TarotCard :id="card.id" :reversed="reversed" />
        <div class="chips-toggle center">
          <button :class="{ on: !reversed }" @click="reversed = false">Upright</button>
          <button :class="{ on: reversed }" @click="reversed = true">Reversed</button>
        </div>
        <div class="row center">
          <button class="btn ghost small" @click="go(-1)">← Prev</button>
          <button class="btn ghost small" @click="go(1)">Next →</button>
        </div>
      </div>

      <div class="right stack">
        <div>
          <div class="eyebrow">{{ card.suit === 'major' ? MAJOR_INFO.name : `${suitInfo!.name} · ${suitInfo!.element}` }}</div>
          <h2>{{ card.name }}</h2>
          <p class="essence">{{ card.essence }}</p>
        </div>

        <div class="kw" :class="{ dim: reversed }">
          <span class="label">Upright keywords</span>
          <span v-for="k in card.keywordsUp" :key="k" class="chip">{{ k }}</span>
          <p class="small">{{ card.upright }}</p>
        </div>
        <div class="kw" :class="{ dim: !reversed }">
          <span class="label">Reversed keywords</span>
          <span v-for="k in card.keywordsRev" :key="k" class="chip rev">{{ k }}</span>
          <p class="small">{{ card.reversed }}</p>
        </div>

        <div class="facts small">
          <div><b>Look for:</b> {{ card.notice }}</div>
          <div><b>Numerology:</b> {{ numerologyNote(card) }}</div>
          <div v-if="suitInfo"><b>{{ suitInfo.element }}:</b> {{ suitInfo.domain }}</div>
          <div><b>Reflect:</b> <em>{{ card.ask }}</em></div>
        </div>

        <div>
          <label class="label" :for="'note-' + card.id">My own meaning</label>
          <textarea :id="'note-' + card.id" v-model="note" placeholder="What does this card say to you? What do you see, feel or remember when you look at it? (Saved automatically)" />
        </div>

        <div class="row">
          <button class="btn" :class="isLearned(card.id) ? 'good' : 'primary'" @click="toggleLearned(card.id)">
            {{ isLearned(card.id) ? '✓ Learned' : 'Mark as learned' }}
          </button>
          <button class="btn" @click="openGuide(card.page)">📖 Read in my guide (p. {{ card.page }})</button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.detail { display: grid; grid-template-columns: 240px 1fr; gap: 28px; }
.left { display: flex; flex-direction: column; gap: 14px; }
.center { justify-content: center; }
.essence { font: 600 1.25rem var(--serif); color: var(--accent); margin: 0; }
.kw { transition: opacity .3s; }
.kw.dim { opacity: .5; }
.kw p { margin-top: 4px; }
.facts { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; display: grid; gap: 6px; }
@media (max-width: 640px) {
  .detail { grid-template-columns: 1fr; }
  .left { max-width: 200px; margin: 0 auto; }
}
</style>
