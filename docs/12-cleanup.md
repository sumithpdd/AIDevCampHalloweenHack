# Step 11 · Conclusion & clean up

> 🧭 **Codelab step 11 of 11** · ⏱️ 5 min · Formula E codelab: *7 · Conclusion & clean-up*

## Recap
In the Formula E codelab you built a Python/FastAPI kiosk on Cloud Run. Here you built the same four-model idea
as a React app on Vercel, with Firebase doing the AI proxying, storage and identity.

| | Formula E codelab | Haunted Kiosk |
|---|---|---|
| Backend language | Python (FastAPI) | TypeScript (2 Vercel Functions) |
| Containers | 2 | 0 |
| Deploy commands | 2 × `gcloud run deploy` | `git push` |
| Where the Gemini key lives | Cloud Run service account | Firebase AI Logic (brief, portrait) + Vercel env (Omni) |

## Clean up
When the party's over:

```bash
# Delete the Vercel project (or just remove env vars)
vercel remove <project-name>

# Delete generated files (Firebase console → Storage → ghouls/ → delete)
# or with gcloud:
gcloud storage rm -r gs://<your-bucket>/ghouls
```

- **Rotate** the Gemini API key in AI Studio and **delete** the service-account key
  (Project settings → Service accounts → Manage keys).
- **Delete** your App Check debug tokens (App Check → Apps → ⋮ → Manage debug tokens).
- Delete the local service-account JSON file once its base64 is in Vercel.
- To delete everything: Firebase console → Project settings → **Delete project**.

## What you learned ✅
- Calling **Gemini 3.8 Flash** and **Nano Banana 2** from the browser with **Firebase AI Logic** (structured output,
  thinking levels, image-to-image, aspect ratios).
- Running **Gemini Omni 1.1 Flash** through the **Interactions API** with `background: true` from a **Vercel Function**,
  and moving the polling loop to the client.
- Securing a GenAI app with **Anonymous Auth**, **Storage rules**, **ID-token verification** and **App Check**.
- Using **Gemini CLI** with project context (`GEMINI.md`) and custom slash commands.

Happy Halloween from AI DevCamp × GDG London 🦇

---
[⬅️ Deploy](09-deploy-vercel.md) · [📋 All steps](../README.md#codelab-walkthrough) · [Bonus: Hack extensions ➡️](10-hack-extensions.md)
