# Step 2 · Prerequisites

> 🧭 **Codelab step 2 of 11** · ⏱️ 10 min · Formula E codelab: *2 · Environment setup*

## Accounts
- **Google account** with access to [Firebase console](https://console.firebase.google.com) and
  [Google AI Studio](https://aistudio.google.com).
- **Billing**: Firebase Storage default buckets need the **Blaze (pay-as-you-go)** plan, and Gemini Omni video
  generation needs a Gemini API key on a **paid tier**. Hack winners: use the credits provided by the organisers. 🎃
- **Vercel account** (free Hobby tier is enough) — sign in with GitHub.
- **GitHub account** (to push your fork and import it into Vercel).

## Local tools

| Tool | Version | Install |
|---|---|---|
| Node.js | 20 LTS or newer | https://nodejs.org |
| Git | any | https://git-scm.com |
| Gemini CLI | latest | `npm install -g @google/gemini-cli` (see [03](03-gemini-cli.md)) |
| Firebase CLI | latest | `npm install -g firebase-tools` |
| Vercel CLI | latest | `npm install -g vercel` |
| A webcam | — | or use photo upload |

Check:

```bash
node -v        # v20+
gemini --version
firebase --version
vercel --version
```

## Get the code

```bash
cd C:\code\react            # Windows (PowerShell)   |   cd ~/code   (macOS/Linux)
git clone https://github.com/sumithpdd/AIDevCampHalloweenHack.git   # or your fork
cd AIDevCampHalloweenHack
npm install
```

> 💡 Windows users: every command in this lab works in PowerShell. Where bash and PowerShell differ, both are shown.

The repo is the **codelab version**: the four challenge files contain TODOs. `npm run solve -- all` gives you the
finished kiosk, `npm run reset-challenges` brings the TODOs back.

Already know the tools and want the ideas first? [Step 1 · Overview](00-overview.md) and
[Make your own](13-make-your-own.md).

---
[⬅️ Introduction](00-overview.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Firebase setup ➡️](02-firebase-setup.md)
