# Tarot Study

A web app for learning to read tarot alongside *The Ultimate Guide to Tarot Card Meanings* (Brigit Esselmont), the PDF in `guide/`.

**Live site:** https://yara-youssef.github.io/tarot/

## What's inside

- **Learn**: a learning path (Major Arcana, then each suit) with progress tracking, plus summaries of the guide's bonus chapters: numerology, reading reversed cards, and reading tarot for yourself.
- **Cards**: all 78 cards with the guide's upright and reversed keywords, short study notes, imagery to look for, numerology, a reflection question and a "My own meaning" notebook for each card.
- **Read in my guide**: open your copy of the guide PDF once and every card links straight to its chapter. The PDF stays in your browser and is never uploaded or published.
- **Practice**: intuition-first flashcards (you write your impression before the meaning is revealed; harder cards come back more often) and a keyword quiz.
- **Reading**: a guided self-reading based on the guide's steps: breathe, ask an open question (with tips when you ask yes/no or "should I" questions), pick a spread, draw, interpret each card intuitively first, then read the whole story with pattern hints (Majors, suits, repeated numbers, reversals).
- **Journal**: saved readings with a "looking back" reflection, plus backup/restore.

Progress, notes and journal are stored in your browser (localStorage).

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
