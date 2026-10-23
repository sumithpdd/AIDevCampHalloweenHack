/**
 * 🎨 Event branding — logos, watermark text and hashtags in one place.
 * Reskinning for another event? Change this file + the files in public/branding/.
 */
export const EVENT = {
  name: 'AI DevCamp × GDG London',
  edition: 'Halloween Hack 2026',
  watermarkText: 'AI DevCamp 2026 · GDG London · Halloween Hack',
  /** Logos are drawn onto every image and video (left → right). */
  logos: ['/branding/aidevcamp-2026.webp', '/branding/gdg-london.png'],
  /** Always included in AI captions (the model may add a couple more). */
  hashtags: ['#AIDevCamp', '#GDGLondon', '#BuildWithAI', '#BuildWithGemini', '#HalloweenHack'],
  /** Optional extras the caption model can pick from. */
  extraHashtags: ['#GeminiOmni', '#NanoBanana', '#FirebaseAI', '#GoogleDevelopers', '#Halloween'],
  /** Public URL used in share text (falls back to the current origin). */
  siteUrl: typeof window !== 'undefined' ? window.location.origin : '',
} as const;
