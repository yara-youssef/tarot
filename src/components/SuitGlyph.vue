<script setup lang="ts">
// Draws a suit symbol centred on (x, y), fitting in a box of the given size.
defineProps<{ suit: 'cups' | 'pentacles' | 'swords' | 'wands'; x: number; y: number; size: number; color: string }>()
</script>

<template>
  <g :transform="`translate(${x} ${y}) scale(${size / 100})`" :stroke="color" :fill="color" stroke-linejoin="round" stroke-linecap="round">
    <template v-if="suit === 'cups'">
      <path d="M-34 -42 H34 C34 -5 20 12 0 14 C-20 12 -34 -5 -34 -42 Z" fill-opacity="0.85" stroke-width="4" />
      <path d="M0 14 V32" stroke-width="9" fill="none" />
      <path d="M-24 42 C-24 32 24 32 24 42 Z" stroke-width="4" />
      <path d="M-26 -30 H26" stroke="#fff" stroke-opacity=".5" stroke-width="4" />
    </template>
    <template v-else-if="suit === 'pentacles'">
      <circle r="44" fill-opacity="0.9" stroke-width="3" />
      <circle r="36" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" />
      <path d="M0 -32 L18.8 25.9 L-30.4 -9.9 H30.4 L-18.8 25.9 Z" fill="none" stroke="#fff" stroke-width="4" />
    </template>
    <template v-else-if="suit === 'swords'">
      <path d="M0 -48 L7 -34 V18 H-7 V-34 Z" fill-opacity="0.85" stroke-width="3" />
      <path d="M-24 18 H24" stroke-width="9" />
      <path d="M0 22 V40" stroke-width="8" />
      <circle cy="45" r="6" />
    </template>
    <template v-else>
      <path d="M-5 46 L-2 -44 H5 L5 46 Z" fill-opacity="0.9" stroke-width="5" />
      <path d="M2 -26 C14 -36 22 -30 20 -22 C12 -22 6 -24 2 -26 Z M1 4 C-12 -6 -21 0 -19 8 C-10 8 -4 6 1 4 Z M3 26 C15 18 22 24 19 31 C11 31 6 29 3 26 Z" stroke-width="2" fill-opacity=".7" />
    </template>
  </g>
</template>
