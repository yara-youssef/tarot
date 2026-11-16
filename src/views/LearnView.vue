<script setup lang="ts">
import { computed } from 'vue'
import { COURTS, DECK, MAJOR_INFO, NUMEROLOGY, REVERSAL_METHODS, SECTIONS, SUITS } from '@/data/deck'
import { openCard, openGuide, store } from '@/store'
import TarotCard from '@/components/TarotCard.vue'

const learnedCount = computed(() => store.learned.length)
const sectionProgress = computed(() =>
  SECTIONS.map((s) => ({ ...s, done: s.cards.filter((c) => store.learned.includes(c.id)).length })),
)
// Next card to study: first card not yet learned, in deck order
const next = computed(() => DECK.find((c) => !store.learned.includes(c.id)))
// A "card of the day" that stays the same all day
const today = new Date()
const dayCard = DECK[(today.getFullYear() * 372 + today.getMonth() * 31 + today.getDate()) % DECK.length]!
</script>

<template>
  <div class="stack learn">
    <section class="hero panel">
      <div class="hero-text">
        <div class="eyebrow">Your tarot learning path</div>
        <h1>Learn the 78 cards, one card at a time.</h1>
        <p class="muted">
          This app follows the way the guide recommends learning: understand the <b>core energy</b> of each card,
          always <b>ask your intuition first</b> before looking up a meaning, and know that it's okay to read a card
          <b>in your own way</b>.
        </p>
        <div class="progress"><span :style="{ width: (learnedCount / 78) * 100 + '%' }" /></div>
        <p class="small muted" style="margin-top: 6px">{{ learnedCount }} of 78 cards learned</p>
        <div class="row">
          <button v-if="next" class="btn primary" @click="openCard(next.id)">Study next: {{ next.name }}</button>
          <a class="btn" href="#/practice">Practise with flashcards</a>
        </div>
      </div>
      <button class="day" @click="openCard(dayCard.id)" title="Open today's card">
        <TarotCard :id="dayCard.id" />
        <span class="small muted">Today's card to study</span>
      </button>
    </section>

    <section class="panel">
      <h2>How to use this app</h2>
      <ol class="steps">
        <li><b>Learn the meanings.</b> Work through the path below: the Major Arcana first, then each suit. Open a card, read the keywords and short notes, then read the full chapter in your guide.</li>
        <li><b>Intuition first, book second.</b> In <a href="#/practice">Practice</a> and <a href="#/read">Readings</a> you'll always be asked what <em>you</em> see and feel before the meaning is revealed.</li>
        <li><b>Make it personal.</b> Every card has a "My own meaning" box. Scribble in it like the margins of your book.</li>
        <li><b>Read for yourself.</b> Start with a daily card or a three-card spread, and keep a <a href="#/journal">journal</a>. Come back later to see how it played out.</li>
      </ol>
      <p class="small muted">
        Tip: tap <b>📖 Read in my guide</b> on any card and choose your PDF of the guide once; the app will then jump straight to the right page.
        <button class="linkish" @click="openGuide(6)">Open the guide now</button>
      </p>
    </section>

    <section>
      <h2>Learning path</h2>
      <div class="path">
        <a v-for="(s, i) in sectionProgress" :key="s.key" :href="`#/cards?s=${s.key}`" class="panel step" :style="{ '--c': s.color }">
          <div class="num">{{ i + 1 }}</div>
          <div class="step-body">
            <h3>{{ s.title }}</h3>
            <p class="small muted">{{ s.key === 'major' ? 'Life lessons and archetypes: the Fool\'s journey.' : SUITS[s.key as 'cups'].domain }}</p>
            <div class="progress"><span :style="{ width: (s.done / s.cards.length) * 100 + '%', background: s.color }" /></div>
            <span class="small muted">{{ s.done }}/{{ s.cards.length }} learned</span>
          </div>
        </a>
      </div>
    </section>

    <section class="panel">
      <h2>The Major Arcana</h2>
      <p>{{ MAJOR_INFO.summary }}</p>
    </section>

    <section class="panel">
      <h2>The four suits</h2>
      <div class="suits">
        <div v-for="(s, k) in SUITS" :key="k" class="suit" :style="{ '--c': s.color }">
          <h3>{{ s.name }} <span class="small muted">· {{ s.element }}</span></h3>
          <p class="small">{{ s.summary }}</p>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="eyebrow">Bonus chapter 1</div>
      <h2>Numerology: the shortcut to the Minor Arcana</h2>
      <p>Learn what the numbers 1 to 10 mean and you already know the heart of 40 cards. Combine the number with the suit's element: a <b>Five</b> (conflict) of <b>Swords</b> (thoughts) is a battle of words.</p>
      <div class="nums">
        <div v-for="(m, n) in NUMEROLOGY" :key="n" class="numcell"><span class="n">{{ Number(n) === 1 ? 'Ace' : n }}</span><span class="small">{{ m }}</span></div>
      </div>
      <h3 style="margin-top: 1em">Court cards</h3>
      <ul class="small">
        <li v-for="(c, n) in COURTS" :key="n"><b>{{ c.rank }}</b> (≈ {{ c.numbers }}): {{ c.role }}</li>
      </ul>
      <p class="small muted">For the Major Arcana, add the digits together: The Tower is 16 → 1 + 6 = 7 (reflection, assessment).</p>
    </section>

    <section class="panel">
      <div class="eyebrow">Bonus chapter 2</div>
      <h2>Reading reversed cards</h2>
      <p>You don't need to memorise 78 more meanings. Start from the upright energy and apply one of these four methods. Before a reading, decide which one you'll use.</p>
      <div class="methods">
        <div v-for="(m, i) in REVERSAL_METHODS" :key="m.id" class="method">
          <b>{{ i + 1 }}. {{ m.name }}</b>
          <p class="small">{{ m.short }}</p>
        </div>
      </div>
      <p class="small muted">To get reversals into a physical deck, cut it into three piles, turn one pile around, then shuffle. You can turn reversals on in the Reading tab.</p>
    </section>

    <section class="panel">
      <div class="eyebrow">Bonus chapter 3</div>
      <h2>Reading tarot for yourself</h2>
      <ol class="steps">
        <li><b>Clear your mind.</b> Three deep breaths: relax, be present, open up to receive.</li>
        <li><b>Ask an open question.</b> "What do I need to know about…" rather than "Will I…?" You keep your free will.</li>
        <li><b>Shuffle and lay out the cards</b> left to right, face up, while focusing on your question.</li>
        <li><b>Read each card intuitively first</b>, then look up the meaning. Then read the whole spread as a story and answer your question.</li>
        <li><b>Write it down</b> and come back to it in a week or a month.</li>
      </ol>
      <a class="btn primary" href="#/read">Start a guided reading</a>
    </section>
  </div>
</template>

<style scoped>
.hero { display: grid; grid-template-columns: 1fr 170px; gap: 28px; align-items: center; }
.hero h1 { font-size: 2.4rem; }
.day { background: none; border: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; align-items: center; color: inherit; }
.day:hover :deep(svg) { transform: translateY(-4px) rotate(-1deg); }
.steps { padding-left: 1.2em; margin: 0 0 .8em; }
.steps li { margin-bottom: .5em; }
.linkish { background: none; border: 0; color: var(--accent); text-decoration: underline; padding: 0; }
.path { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
.step { display: flex; gap: 12px; text-decoration: none; color: inherit; border-top: 4px solid var(--c); padding: 16px; }
.step:hover { border-color: var(--c); }
.step h3 { margin-bottom: 2px; }
.step-body { flex: 1; min-width: 0; }
.num { font: 700 1.6rem var(--serif); color: var(--c); }
.suits { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
.suit { border-left: 4px solid var(--c); padding-left: 12px; }
.suit h3 { margin-bottom: .2em; }
.nums { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.numcell { background: var(--surface-2); border-radius: 10px; padding: 8px 10px; display: flex; flex-direction: column; }
.n { font: 700 1.4rem var(--serif); color: var(--accent); }
.methods { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: .8em; }
.method { background: var(--surface-2); border-radius: 10px; padding: 10px 12px; }
.method p { margin: 4px 0 0; }
@media (max-width: 640px) {
  .hero { grid-template-columns: 1fr; }
  .hero h1 { font-size: 1.9rem; }
  .day { max-width: 150px; margin: 0 auto; }
}
</style>
