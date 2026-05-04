# ✨ PWAchat Luxe
A luxury-styled, installable, real-time public chatroom PWA with media sharing and an AI bot assistant.

--- 

## 1) What this app does
- Global public chatroom (no registration)
- Username-only entry
- Realtime messaging with Gun peer network
- Photo/video upload and voice notes
- `@faacore` AI bot:
  - Conversational replies
  - Image generation on request
  - Welcome and leave announcements
  - Persona + memory support
- PWA-ready for iOS and modern browsers

---

## 2) Requirements
You only need one of these:
- **Python 3** (recommended for quick start), or
- **Node.js** (if you prefer `serve`)

No backend server build is required.

---

## 3) Installation (step-by-step)
### Step 1 — Clone
```bash
git clone <your-repository-url>
cd PWAchat
```

### Step 2 — Run a local static server
#### Option A (Python)
```bash
python3 -m http.server 4173
```

#### Option B (Node)
```bash
npx serve . -l 4173
```

### Step 3 — Open in browser
Go to:
- `http://localhost:4173`

### Step 4 — Enter chat
1. Type your username.
2. Click **Enter Chatroom**.
3. Start chatting in realtime.

---

## 4) Configuration (important)
All major customization is in `app-config.json`.

```json
{
  "appName": "PWAchat Luxe",
  "roomName": "Global Lounge",
  "botName": "@faacore",
  "themeColor": "#0f1226",
  "welcomeHint": "Pick a username to enter the public live room.",
  "botPersona": "You are luxurious, warm, concise, and witty. Keep replies under 60 words unless asked otherwise.",
  "botMemoryLimit": 12
}
```

### Field reference
- `appName`: Browser/app title branding
- `roomName`: Header room display name
- `botName`: Name users mention to call the bot
- `themeColor`: PWA/theme color
- `welcomeHint`: Text under app title on login modal
- `botPersona`: Personality instruction passed into AI prompt
- `botMemoryLimit`: Number of recent messages bot remembers

---

## 5) Bot behavior
### A) Ask bot for text
Mention the bot in chat:
```text
@faacore what should we build today?
```

### B) Ask bot for image generation
Use “generate image” in your mention:
```text
@faacore generate image of a crystal palace above the clouds
```

### C) Bot announcements
- Bot sends welcome when users join
- Bot sends goodbye when users leave/close tab

### D) Memory
Bot memory is stored in browser localStorage key:
- `pwachat_bot_memory`

---

## 6) Fallback quotes
If AI call fails, bot can fallback to local quotes from `quotes.json`.

Edit:
```json
[
  "Luxury is in each detail.",
  "Great chats build great communities.",
  "Clarity is the ultimate elegance.",
  "Speak with kindness. Lead with courage."
]
```

---

## 7) Deploy (GitHub to custom domain)
### Option 1 — Vercel
1. Import your GitHub repo
2. Framework preset: **Other**
3. Build command: empty
4. Output directory: `.`
5. Add custom domain in project settings

### Option 2 — Netlify
1. New site from Git
2. Build command: empty
3. Publish directory: `.`
4. Add domain in Domain management

### Option 3 — Cloudflare Pages
1. Create project from Git
2. Build command: empty
3. Output directory: `.`
4. Attach custom domain via Cloudflare DNS

---

## 8) Install as PWA (iPhone/iPad)
1. Open site in **Safari**
2. Tap **Share**
3. Tap **Add to Home Screen**
4. Launch from icon like a native app

---

## 9) Troubleshooting
### Bot not replying
- Check internet connection
- Verify mention includes bot name from `app-config.json`
- AI provider may be rate-limited; fallback quote should appear

### Media not recording
- Allow microphone permissions in browser
- Ensure HTTPS in production (required by many browsers for media APIs)

### Realtime appears delayed
- Gun peer relay/network may be temporarily slow

---

## 10) Security notes
- API key in frontend is visible to users. For production-grade security, move AI calls to a backend proxy.
- Public room is open chat by design; add moderation if needed.

---

## 11) Project structure
- `index.html` — app shell
- `styles.css` — visual design
- `app.js` — realtime logic, bot, media, config wiring
- `app-config.json` — branding + persona + memory settings
- `quotes.json` — local fallback messages
- `manifest.json` — PWA metadata
- `sw.js` — service worker cache
- `icons/icon.svg` — app icon

---

## 12) Quick customization checklist
- [ ] Change app name and room name in `app-config.json`
- [ ] Tune bot persona and memory size
- [ ] Replace `quotes.json` with your own voice
- [ ] Set your domain and HTTPS
- [ ] Install on iOS and test media permissions
