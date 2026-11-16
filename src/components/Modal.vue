<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
const emit = defineEmits<{ close: [] }>()
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') emit('close') }
onMounted(() => { window.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden' })
onUnmounted(() => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' })
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="sheet" role="dialog" aria-modal="true">
      <button class="close" aria-label="Close" @click="emit('close')">✕</button>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; background: rgb(20 10 35 / .55); z-index: 50; display: flex; align-items: flex-start; justify-content: center; padding: 24px 12px; overflow-y: auto; }
.sheet { position: relative; background: var(--bg); border-radius: 18px; width: 100%; max-width: 860px; padding: 24px; box-shadow: 0 20px 60px rgb(0 0 0 / .35); }
.close { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface); color: var(--text); z-index: 2; }
@media (max-width: 600px) { .sheet { padding: 18px 14px; } .backdrop { padding: 10px 8px; } }
</style>
