# Step 4 · Gemini CLI — your pair programmer

> 🧭 **Codelab step 4 of 11** · ⏱️ 10 min · Formula E codelab: *2 · Environment setup (Cloud Shell Editor → Gemini CLI)*

The Formula E lab had you type code in Cloud Shell Editor. Here you work locally with **Gemini CLI**, an
open-source AI agent that runs in your terminal, reads this repo, runs commands and edits files (with your approval).

## 3.1 Install & sign in

```bash
npm install -g @google/gemini-cli
# or run without installing:  npx @google/gemini-cli
```

From the project root:

```bash
cd AIDevCampHalloweenHack
gemini
```

Choose **Login with Google** (free tier) or set `GEMINI_API_KEY` in your shell to use your AI Studio key.

## 3.2 What's already set up for you

| File | Purpose |
|---|---|
| `GEMINI.md` | Project context loaded automatically: stack, rules (no Python! secrets stay server-side), file map, challenge etiquette |
| `.gemini/commands/hack/*.toml` | Custom slash commands for this lab |

Try `/memory show` to see that `GEMINI.md` was loaded.

## 3.3 The `/hack:*` commands

| Command | What it does |
|---|---|
| `/hack:hint 2` | One small hint for Challenge 2 (never the full answer) |
| `/hack:solve 2` | Shows & explains the reference solution, compares it with your code (won't overwrite unless you say "apply it") |
| `/hack:check` | Runs `npm run typecheck` and explains errors in plain English |
| `/hack:explain` | Walks through the whole pipeline + draws a Mermaid diagram |
| `/hack:scene a werewolf on the Northern line` | Invents and adds a new scene to `src/lib/scenes.ts` |
| `/hack:deploy` | Pre-flight checklist + exact Vercel commands |

## 3.4 Good prompts for this lab

```text
> Explain what getAI() and GoogleAIBackend do in @src/lib/firebase.ts before I write Challenge 1.

> In @src/lib/promptExpansion.ts, what's the difference between responseSchema and responseJsonSchema?

> My avatar comes back without a face that looks like me. Improve the prompt in @src/lib/avatar.ts
  without changing the function signature.

> Why does @server/omni.ts use background: true instead of waiting for the video?
```

> 🧠 Etiquette: try each challenge yourself for 5 minutes, then `/hack:hint`, then `/hack:solve`.
> The fastest hackers today are the ones who *read* what the agent writes.

## 3.5 Safety
- Gemini CLI asks before running shell commands or writing files — read the diff.
- Never paste `.env.local` values into the chat. `/hack:deploy` only prints key **names**.

---
[⬅️ Firebase setup](02-firebase-setup.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Challenge 1 ➡️](04-challenge-1-firebase-ai-logic.md)
