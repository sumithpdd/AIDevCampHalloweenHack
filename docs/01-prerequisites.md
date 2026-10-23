# Step 2 · Prerequisites

> 🧭 **Workshop step 2** · ⏱️ 10 min · You still need accounts. The app comes later, in [Step 7](15-workshop.md#step-7--build-the-light-app).

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
| **Claude**, **Gemini**, or **Antigravity** | current | One of these writes the light app in [Step 7](15-workshop.md#step-7--build-the-light-app). Gemini CLI is optional ([03](03-gemini-cli.md)). |
| Firebase CLI | latest | `npm install -g firebase-tools` |
| Vercel CLI | latest | `npm install -g vercel` — only if you deploy |
| A webcam | — | or use photo upload |

Check:

```bash
node -v        # v20+
gemini --version
firebase --version
vercel --version
```

## This repo is the reference

Clone it when you want to read the finished pipeline or the event-booth extras. The workshop builds a **new** folder in [Step 7](15-workshop.md#step-7--build-the-light-app).

```bash
git clone https://github.com/sumithpdd/AIDevCampHalloweenHack.git
cd AIDevCampHalloweenHack
npm install
```

The four challenge files contain TODOs. `npm run solve -- all` gives you the finished kiosk, `npm run reset-challenges` brings the TODOs back.

> 💡 Windows users: every command in this lab works in PowerShell. Where bash and PowerShell differ, both are shown.

---
[⬅️ Overview](00-overview.md) · [📋 Workshop](../README.md#workshop) · [Firebase setup ➡️](02-firebase-setup.md)
