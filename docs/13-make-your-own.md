# Bonus · Make your own — reskin the booth

> 🎁 **Bonus** — after the core codelab ([11 steps](../README.md#codelab-walkthrough))

The pipeline (upload → brief → portrait → video), anonymous auth, the storage rules and the video poll are the
reusable part. A new theme only touches prompts, scenes and copy. Ideas: *Formula E driver* (back where it
started), *Christmas elf*, *1920s jazz club*, *your company's offsite*.

## 13.1 Start from the finished booth
```bash
npm run solve -- all
npm run dev
```

## 13.2 Edit these files

| Change | File | Tip |
|---|---|---|
| Event name, logos, watermark line, hashtags | `src/lib/branding.ts` + files in `public/branding/` | Logos sit on dark stickers. Transparent PNG/WebP works best. |
| Backdrops (where) | `src/data/backgrounds.ts` | `preview` is just CSS for the picker tile. |
| Characters (who + camera move) | `src/data/prompts.ts` | Keep `motion` as **one continuous 8-second shot**. Costume is clothing. Do not ask for a new skin colour or face paint that covers features. |
| Curated scenes (backdrop × character) | `src/data/booth-scenes.ts` | Mark 4 as `featured`. |
| Art-director rules | `src/lib/briefPrompt.ts` | Keep the identity-preservation and family-friendly rules. Change tone, era and word counts. |
| Brief fields | `src/lib/briefPrompt.ts` (`GhoulBrief`) + `ghoulBriefSchema` in `promptExpansion.ts` | Rename fields in both places. The schema is the contract. |
| Portrait wrapper sentence | `src/lib/avatar.ts` (`promptText`) | Keep the identity lock: same people, same faces. "No text, no watermark" stays useful in any theme. |
| Video wrapper sentence | `server/omni.ts` (`buildVideoInstruction`) | Replace "Halloween" with your theme. |
| Title, buttons, stage labels | `src/App.tsx`, `src/components/Progress.tsx`, `index.html` | |
| Colours, fonts, bats & fog | `src/index.css` | All colours are CSS variables in `:root`. |
| Favicon | `public/favicon.svg` | |
| Models | `.env.local` → `VITE_PROMPT_MODEL`, `VITE_IMAGE_MODEL`, `OMNI_MODEL` | |

Gemini CLI can do most of this for you:

```text
> Reskin this booth as a "Formula E Gen4 driver" experience. Update src/data/ (backgrounds, prompts,
  booth-scenes) with 4 featured scenes, change branding.ts hashtags,
  rewrite buildBriefInstruction for racing, rename the UI copy, and switch the palette in index.css
  to electric blue. Do not change pipeline.ts, storage.rules or anything in api/.
```

## 13.3 Leave these alone
- `src/lib/pipeline.ts` stage order and error handling
- `storage.rules`, `server/firebaseAdmin.ts`, `api/video/*`
- App Check setup in `src/lib/firebase.ts`

## 13.4 If you also want the reskin as the codelab
Copy your finished challenge files into `solutions/`, then copy them into `starter/` and cut the TODO gaps back in,
the way the Halloween starters do. `npm run reset-challenges` and `npm run solve` keep working.

---
[📋 All steps](../README.md#codelab-walkthrough) · [Hack extensions](10-hack-extensions.md) · [Troubleshooting](11-troubleshooting.md)
