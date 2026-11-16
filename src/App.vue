<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ui } from './store'
import LearnView from './views/LearnView.vue'
import CardsView from './views/CardsView.vue'
import PracticeView from './views/PracticeView.vue'
import ReadingView from './views/ReadingView.vue'
import JournalView from './views/JournalView.vue'
import CardDetail from './components/CardDetail.vue'
import GuideViewer from './components/GuideViewer.vue'

const TABS = [
  { id: 'learn', label: 'Learn', icon: '☾' },
  { id: 'cards', label: 'Cards', icon: '✦' },
  { id: 'practice', label: 'Practice', icon: '◎' },
  { id: 'read', label: 'Reading', icon: '✧' },
  { id: 'journal', label: 'Journal', icon: '✎' },
] as const
type Tab = (typeof TABS)[number]['id']

function fromHash(): Tab {
  const h = location.hash.replace('#/', '').split('?')[0] as Tab
  return TABS.some((t) => t.id === h) ? h : 'learn'
}
const tab = ref<Tab>(fromHash())
const onHash = () => { tab.value = fromHash(); window.scrollTo(0, 0) }
onMounted(() => window.addEventListener('hashchange', onHash))
onUnmounted(() => window.removeEventListener('hashchange', onHash))

const view = computed(() => ({ learn: LearnView, cards: CardsView, practice: PracticeView, read: ReadingView, journal: JournalView })[tab.value])
</script>

<template>
  <header class="top">
    <div class="wrap top-inner">
      <a href="#/learn" class="brand"><span class="star">✦</span> Tarot Study</a>
      <nav>
        <a v-for="t in TABS" :key="t.id" :href="`#/${t.id}`" :class="{ on: tab === t.id }">
          <span class="ico" aria-hidden="true">{{ t.icon }}</span><span>{{ t.label }}</span>
        </a>
      </nav>
    </div>
  </header>

  <main class="wrap main">
    <component :is="view" />
  </main>

  <footer class="wrap foot small muted">
    Built for studying alongside <em>The Ultimate Guide to Tarot Card Meanings</em> by Brigit Esselmont.
    Keywords and page numbers come from the guide; other notes are short study summaries. Your progress is saved in this browser only.
  </footer>

  <CardDetail v-if="ui.cardId" :key="ui.cardId" />
  <GuideViewer v-if="ui.guidePage !== null" />
</template>

<style scoped>
.top { position: sticky; top: 0; z-index: 20; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
.top-inner { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 60px; }
.brand { font: 700 1.45rem var(--serif); color: var(--text); text-decoration: none; white-space: nowrap; }
.star { color: var(--gold); }
nav { display: flex; gap: 4px; }
nav a { text-decoration: none; color: var(--muted); padding: .4em .8em; border-radius: 999px; font-weight: 500; font-size: .95rem; display: flex; gap: 6px; align-items: center; }
nav a:hover { color: var(--text); }
nav a.on { background: var(--surface-2); color: var(--accent); }
.ico { font-size: 1rem; }
.main { padding-top: 24px; padding-bottom: 40px; min-height: 70vh; }
.foot { padding-bottom: 100px; border-top: 1px solid var(--border); padding-top: 16px; }

@media (max-width: 720px) {
  /* backdrop-filter would trap the fixed bottom nav inside the header */
  .top { backdrop-filter: none; background: var(--bg); }
  .top-inner { height: 52px; }
  nav { position: fixed; bottom: 0; left: 0; right: 0; justify-content: space-around; background: var(--surface); border-top: 1px solid var(--border); padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); z-index: 30; }
  nav a { flex-direction: column; gap: 0; font-size: .72rem; padding: .3em .5em; border-radius: 10px; }
  .ico { font-size: 1.15rem; }
}
</style>
