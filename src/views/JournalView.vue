<script setup lang="ts">
import { ref } from 'vue'
import { CARD_BY_ID, REVERSAL_METHODS, SPREADS } from '@/data/deck'
import { exportData, importData, openCard, store } from '@/store'
import TarotCard from '@/components/TarotCard.vue'
import SyncPanel from '@/components/SyncPanel.vue'

const open = ref<string | null>(store.readings[0]?.id ?? null)
const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const spreadName = (id: string) => SPREADS.find((s) => s.id === id)?.name ?? id
const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)

function remove(id: string) {
  if (!confirm('Delete this reading from your journal?')) return
  store.readings = store.readings.filter((r) => r.id !== id)
}
function download() {
  const blob = new Blob([exportData()], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `tarot-study-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}
async function upload(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  try {
    importData(await f.text())
    alert('Your progress and journal have been restored.')
  } catch { alert('That file could not be read.') }
}
</script>

<template>
  <div class="stack">
    <div>
      <h1>Journal</h1>
      <p class="muted">Write your readings down and come back to them in a week or a month. A message that made little sense at first often becomes clear as events unfold.</p>
    </div>

    <div v-if="!store.readings.length" class="panel center stack">
      <p>No readings yet.</p>
      <a class="btn primary" href="#/read">Do your first reading</a>
    </div>

    <article v-for="r in store.readings" :key="r.id" class="panel entry">
      <button class="head" @click="open = open === r.id ? null : r.id">
        <div>
          <div class="eyebrow">{{ fmt(r.date) }} · {{ spreadName(r.spreadId) }}{{ r.physical ? ' · my own deck' : '' }}</div>
          <h3>{{ r.question || 'Untitled reading' }}</h3>
        </div>
        <div class="minis">
          <div v-for="(c, i) in r.cards" :key="i" class="mini"><TarotCard :id="c.id" :reversed="c.reversed" :show-name="false" /></div>
        </div>
      </button>

      <div v-if="open === r.id" class="stack body">
        <ul class="cards">
          <li v-for="(c, i) in r.cards" :key="i">
            <b>{{ c.position }}:</b>
            <a href="#" @click.prevent="openCard(c.id)">{{ CARD_BY_ID[c.id]!.name }}</a>{{ c.reversed ? ' (reversed)' : '' }}
            <div v-if="c.intuition" class="small muted">My intuition: {{ c.intuition }}</div>
          </li>
        </ul>
        <p v-if="r.reversalMethod" class="small muted">Reversals read as: {{ REVERSAL_METHODS.find((m) => m.id === r.reversalMethod)?.name }}</p>
        <div v-if="r.story"><span class="label">The story</span><p class="pre">{{ r.story }}</p></div>
        <div>
          <label class="label">Looking back <span v-if="daysAgo(r.date) >= 7" class="chip">{{ daysAgo(r.date) }} days later</span></label>
          <textarea v-model="r.reflection" placeholder="How did this play out? What do these cards mean to you now?" />
        </div>
        <div class="row"><button class="btn ghost small bad" @click="remove(r.id)">Delete reading</button></div>
      </div>
    </article>

    <SyncPanel />

    <section class="panel stack">
      <h3>Backup file</h3>
      <p class="small muted">You can also download everything as a file, to keep a copy or move it by hand.</p>
      <div class="row">
        <button class="btn" @click="download">Download backup</button>
        <label class="btn">Restore from backup<input type="file" accept="application/json" hidden @change="upload" /></label>
      </div>
    </section>
  </div>
</template>

<style scoped>
.center { text-align: center; }
.entry { padding: 0; overflow: hidden; }
.head { width: 100%; display: flex; justify-content: space-between; gap: 12px; align-items: center; background: none; border: 0; color: inherit; text-align: left; padding: 16px 20px; }
.head h3 { margin: 0; }
.minis { display: flex; gap: 4px; flex: none; }
.mini { width: 34px; }
.body { padding: 0 20px 20px; }
.cards { padding-left: 1.1em; margin: 0; }
.cards li { margin-bottom: 6px; }
.pre { white-space: pre-wrap; }
@media (max-width: 560px) { .head { flex-direction: column; align-items: flex-start; } }
</style>
