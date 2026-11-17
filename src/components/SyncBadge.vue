<script setup lang="ts">
// Small cloud button in the header: shows sync state, tap to sync.
import { sync, syncNow } from '@/sync'
</script>

<template>
  <button v-if="sync.enabled" class="badge" :class="sync.status" :disabled="sync.status === 'syncing'"
    :title="sync.status === 'needs-signin' ? 'Tap to sign in to Google and sync' : sync.status === 'error' ? sync.error : 'Sync with Google Drive'"
    @click="syncNow(true)">
    <span class="cloud" aria-hidden="true">☁</span>
    <span class="txt">{{ sync.status === 'syncing' ? 'Syncing…' : sync.status === 'needs-signin' ? 'Tap to sync' : sync.status === 'error' ? 'Sync failed' : sync.pending ? 'Sync' : 'Synced' }}</span>
  </button>
</template>

<style scoped>
.badge { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); border-radius: 999px; padding: .2em .7em; font-size: .8rem; white-space: nowrap; }
.badge.needs-signin { color: var(--accent); border-color: var(--accent); }
.badge.error { color: var(--bad); border-color: var(--bad); }
.badge.syncing .cloud { animation: pulse 1s infinite alternate; }
@keyframes pulse { to { opacity: .3; } }
.cloud { font-size: 1rem; line-height: 1; }
</style>
