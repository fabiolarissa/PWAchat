# PWAchat
PWA compitable & Web App.

## Run locally
```bash
python3 -m http.server 4173
```
Open: `http://localhost:4173`

## Bot AI + manual quotes
- `@faacore` now uses Google Gemini API.
- If API fails, it falls back to `quotes.json`.

### Trigger text reply
Mention `@faacore` in any message.

### Trigger image generation
Ask: `@faacore generate image of a neon luxury city`

Images are generated via free Pollinations image endpoint.

## Manual quotes file
Edit `quotes.json`:
```json
[
  "Your quote 1",
  "Your quote 2"
]
```

## Deploy from GitHub to domain
- Vercel / Netlify / Cloudflare Pages: import repo, output root (`.`), no build step.
- Attach custom domain in provider dashboard.

## App branding/config file
Edit `app-config.json` to rename app and bot without touching code:
```json
{
  "appName": "PWAchat Luxe",
  "roomName": "Global Lounge",
  "botName": "@faacore",
  "themeColor": "#0f1226",
  "welcomeHint": "Pick a username to enter the public live room."
}
```

## Bot presence announcements
- When a user joins, `@faacore` posts a welcome message.
- When a user leaves/closes tab, `@faacore` posts a goodbye message.
- Messages are AI-generated when Gemini is reachable, with local fallback text otherwise.
