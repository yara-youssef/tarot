<script setup lang="ts">
import { computed } from 'vue'
import { connect, disconnect, sync, syncNow } from '@/sync'
import { FILE_NAME } from '@/sync/drive'

const when = computed(() => {
  if (!sync.lastSync) return 'never'
  const mins = Math.round((Date.now() - new Date(sync.lastSync).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  return new Date(sync.lastSync).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
})
const origin = location.origin
function off() {
  if (confirm('Stop syncing this device? Your data stays on this device and in your Google Drive.')) disconnect()
}
</script>

<template>
  <section class="panel stack">
    <div>
      <h3>☁ Sync with Google Drive</h3>
      <p class="small muted">
        Keep your progress, notes, highlights and journal the same on your phone, laptop and any other device.
        The app saves one file, <b>{{ FILE_NAME }}</b>, in your Google Drive, and can't see any of your other files.
      </p>
    </div>

    <template v-if="!sync.configured">
      <p class="small warn">Google Drive sync needs a one-time setup by the site owner (a Google “client ID”). Until then, use the backup buttons below.</p>
      <details class="small">
        <summary>How to set it up</summary>
        <ol>
          <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">console.cloud.google.com</a> and create a project (e.g. “Tarot Study”).</li>
          <li>APIs &amp; Services → Library → enable the <b>Google Drive API</b>.</li>
          <li>APIs &amp; Services → OAuth consent screen: choose <b>External</b>, fill in the app name and your email, and add your Google account as a <b>test user</b>.</li>
          <li>APIs &amp; Services → Credentials → Create credentials → <b>OAuth client ID</b> → Web application. Under “Authorised JavaScript origins” add <code>{{ origin }}</code>.</li>
          <li>Copy the client ID (ends in <code>.apps.googleusercontent.com</code>) into <code>src/config.ts</code>.</li>
        </ol>
      </details>
    </template>

    <template v-else-if="!sync.enabled">
      <div class="row">
        <button class="btn primary" :disabled="sync.status === 'syncing'" @click="connect">
          {{ sync.status === 'syncing' ? 'Connecting…' : 'Connect Google Drive' }}
        </button>
      </div>
      <p class="small muted">Do this once on each device, with the same Google account. Data already on the device is merged in; nothing is overwritten.</p>
    </template>

    <template v-else>
      <p class="small status">
        <span v-if="sync.status === 'syncing'">⟳ Syncing…</span>
        <span v-else-if="sync.status === 'needs-signin'">● Tap “Sync now” to sign in again (Google asks about once an hour).</span>
        <span v-else-if="sync.status === 'error'" class="bad">⚠ {{ sync.error }}</span>
        <span v-else-if="sync.pending">● Changes waiting to sync</span>
        <span v-else class="good">✓ Synced {{ when }}</span>
        <br /><span class="muted">Connected as {{ sync.email || 'your Google account' }}</span>
      </p>
      <div class="row">
        <button class="btn primary" :disabled="sync.status === 'syncing'" @click="syncNow(true)">Sync now</button>
        <button class="btn ghost small" @click="off">Stop syncing on this device</button>
      </div>
    </template>
    <p v-if="sync.status === 'error' && !sync.enabled" class="small bad">⚠ {{ sync.error }}</p>
  </section>
</template>

<style scoped>
h3 { margin-bottom: .3em; }
.warn { background: color-mix(in srgb, var(--gold) 15%, var(--surface)); border-radius: 10px; padding: 10px 12px; margin: 0; }
details ol { padding-left: 1.2em; margin: .5em 0 0; }
details li { margin-bottom: .35em; }
summary { cursor: pointer; color: var(--accent); }
code { background: var(--surface-2); padding: 0 .3em; border-radius: 4px; word-break: break-all; }
.status { margin: 0; }
.good { color: var(--good); }
.bad { color: var(--bad); }
</style>
