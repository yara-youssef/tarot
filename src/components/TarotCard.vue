<script setup lang="ts">
import { computed } from 'vue'
import { CARD_BY_ID, suitColor } from '@/data/deck'
import SuitGlyph from './SuitGlyph.vue'

const props = withDefaults(defineProps<{ id: string; reversed?: boolean; faceDown?: boolean; showName?: boolean }>(), {
  reversed: false, faceDown: false, showName: true,
})
const card = computed(() => CARD_BY_ID[props.id]!)
const color = computed(() => suitColor(card.value.suit))
const uid = computed(() => `g-${props.id}-${Math.random().toString(36).slice(2, 7)}`)

// Pip layouts for numbered cards (x, y) inside a 200×340 card.
const L = 62, C = 100, R = 138
const PIPS: Record<number, [number, number][]> = {
  1: [[C, 165]],
  2: [[C, 95], [C, 235]],
  3: [[C, 85], [C, 165], [C, 245]],
  4: [[L, 100], [R, 100], [L, 230], [R, 230]],
  5: [[L, 95], [R, 95], [C, 165], [L, 235], [R, 235]],
  6: [[L, 90], [R, 90], [L, 165], [R, 165], [L, 240], [R, 240]],
  7: [[L, 85], [R, 85], [C, 125], [L, 165], [R, 165], [L, 245], [R, 245]],
  8: [[L, 80], [R, 80], [C, 120], [L, 160], [R, 160], [C, 205], [L, 248], [R, 248]],
  9: [[L, 78], [R, 78], [L, 135], [R, 135], [C, 165], [L, 195], [R, 195], [L, 252], [R, 252]],
  10: [[L, 75], [R, 75], [C, 108], [L, 140], [R, 140], [L, 190], [R, 190], [C, 222], [L, 255], [R, 255]],
}
const pips = computed(() => (card.value.suit !== 'major' && card.value.number <= 10 ? PIPS[card.value.number]! : []))
const pipSize = computed(() => (card.value.number === 1 ? 110 : card.value.number <= 3 ? 52 : card.value.number <= 6 ? 46 : 38))
const courtIcon: Record<number, string> = { 11: '✎', 12: '♞', 13: '♛', 14: '♚' }
const shortName = computed(() => card.value.name.replace(/^The /, '').toUpperCase())
</script>

<template>
  <svg class="tarot-card" :class="{ reversed: reversed && !faceDown }" viewBox="0 0 200 340" role="img"
    :aria-label="faceDown ? 'Face-down card' : card.name + (reversed ? ' (reversed)' : '')">
    <defs>
      <linearGradient :id="uid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="color" stop-opacity=".16" />
        <stop offset="1" :stop-color="color" stop-opacity=".38" />
      </linearGradient>
      <pattern :id="uid + 'b'" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="#d9b45a" stroke-width="1" opacity=".55" />
      </pattern>
    </defs>

    <template v-if="faceDown">
      <rect x="2" y="2" width="196" height="336" rx="12" fill="#2a1f45" stroke="#d9b45a" stroke-width="3" />
      <rect x="12" y="12" width="176" height="316" rx="8" :fill="`url(#${uid}b)`" />
      <circle cx="100" cy="170" r="34" fill="#2a1f45" stroke="#d9b45a" stroke-width="2" />
      <text x="100" y="182" text-anchor="middle" font-size="34" fill="#d9b45a">✦</text>
    </template>

    <template v-else>
      <rect x="2" y="2" width="196" height="336" rx="12" fill="#fffaf0" :stroke="color" stroke-width="3" />
      <rect x="10" y="10" width="180" height="320" rx="8" :fill="`url(#${uid})`" :stroke="color" stroke-opacity=".5" />
      <text x="100" y="34" text-anchor="middle" class="label" :fill="color">{{ card.label }}</text>

      <!-- Major Arcana: astrological symbol -->
      <template v-if="card.suit === 'major'">
        <circle cx="100" cy="160" r="56" fill="#fffaf0" :stroke="color" stroke-width="3" />
        <circle cx="100" cy="160" r="64" fill="none" stroke="#d9b45a" stroke-width="1.5" stroke-dasharray="3 5" />
        <text x="100" y="182" text-anchor="middle" font-size="62" :fill="color" class="astro">{{ card.symbol }}&#xFE0E;</text>
      </template>

      <!-- Numbered cards: pips -->
      <template v-else-if="card.number <= 10">
        <SuitGlyph v-for="([x, y], i) in pips" :key="i" :suit="card.suit" :x="x" :y="y" :size="pipSize" :color="color" />
      </template>

      <!-- Court cards -->
      <template v-else>
        <text x="100" y="128" text-anchor="middle" font-size="64" :fill="color">{{ courtIcon[card.number] }}</text>
        <SuitGlyph :suit="card.suit" :x="100" :y="210" :size="80" :color="color" />
      </template>

      <text v-if="showName" x="100" y="314" text-anchor="middle" class="name" fill="#3a2d55"
        :textLength="shortName.length > 14 ? 172 : undefined" lengthAdjust="spacingAndGlyphs">{{ shortName }}</text>
    </template>
  </svg>
</template>

<style scoped>
.tarot-card { width: 100%; height: auto; display: block; transition: transform .5s; filter: drop-shadow(0 3px 6px rgb(0 0 0 / .18)); }
.tarot-card.reversed { transform: rotate(180deg); }
.label { font: 600 20px var(--serif); }
.name { font: 600 15px var(--serif); letter-spacing: .06em; }
.astro { font-family: 'Segoe UI Symbol', 'Noto Sans Symbols', 'DejaVu Sans', sans-serif; }
</style>
