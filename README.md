# Tarot Study

A web app for learning to read tarot alongside *The Ultimate Guide to Tarot Card Meanings* (Brigit Esselmont). Use your own copy of the PDF with the "Read in my guide" feature.

**Live site:** https://yara-youssef.github.io/tarot/

## What's inside

- **Learn**: a learning path (Major Arcana, then each suit) with progress tracking, plus summaries of the guide's bonus chapters: numerology, reading reversed cards, and reading tarot for yourself.
- **Cards**: all 78 cards with the guide's upright and reversed keywords, short study notes, imagery to look for, numerology, a reflection question and a "My own meaning" notebook for each card.
- **Read in my guide**: open your copy of the guide PDF once and every card links straight to its chapter. Select text to highlight it (4 colours) and/or add it to that card's notes; highlights also show on the card. The PDF stays in your browser (and, with sync on, in your own Google Drive as `Tarot Study guide.pdf`, so your other devices get it automatically); it is never published.
- **Practice**: intuition-first flashcards (you write your impression before the meaning is revealed; harder cards come back more often) and a keyword quiz.
- **Reading**: a guided self-reading based on the guide's steps: breathe, ask an open question (with tips when you ask yes/no or "should I" questions), pick a spread, draw in the app or enter the cards you drew from your own physical deck (with upright/reversed), interpret each card intuitively first, then read the whole story with pattern hints (Majors, suits, repeated numbers, reversals).
- **Journal**: saved readings with a "looking back" reflection, plus backup/restore.
- **Sync with Google Drive** (Journal tab): keeps progress, notes, highlights and journal the same on all your devices, using one file (`Tarot Study sync.json`) in your Drive. Changes are merged per item, so edits on different devices don't overwrite each other.

Data is stored in your browser (localStorage), and in your Google Drive if sync is on.

## Setting up Google Drive sync

Sync needs a Google OAuth client ID (free, not secret):

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project.
2. APIs & Services → Library → enable **Google Drive API**.
3. APIs & Services → OAuth consent screen → **External**; add your Google account as a test user.
4. APIs & Services → Credentials → Create credentials → **OAuth client ID** → *Web application*; add `https://yara-youssef.github.io` (and `http://localhost:5173` for development) as authorised JavaScript origins.
5. Put the client ID in `src/config.ts` (or set `VITE_GOOGLE_CLIENT_ID`).

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
