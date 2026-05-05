# Kick 3

The daily football debate game. Draft three. Defend them. Let Pete decide.

This is the Phase 2 deployable web app — a Vite + React project ready to deploy to Vercel (or Netlify) with a serverless function that securely proxies the Anthropic API.

---

## Project structure

```
kick3-app/
├── package.json          Dependencies and scripts
├── vite.config.js        Build configuration
├── index.html            HTML entry point
├── .env.example          Environment variable template
├── .gitignore            Files Git should ignore
├── public/
│   └── favicon.svg       Site icon
├── api/
│   └── verdict.js        Serverless function — secure API proxy
└── src/
    ├── main.jsx          React entry
    ├── App.jsx           The full game (~2,900 lines, all 31 questions)
    └── index.css         Global styles
```

---

## Running it locally (the first thing to do)

You need Node.js 18+ installed. If you don't, get it from https://nodejs.org.

```bash
# Install dependencies
npm install

# Set up your API key for local development
cp .env.example .env.local
# Then edit .env.local and paste your real Anthropic API key

# Start the dev server
npm run dev
```

Open http://localhost:5173 — you should see the Kick 3 home screen with today's question.

**Important note:** the local dev server (`vite`) does NOT run the serverless function in `api/verdict.js`. That function only runs on Vercel/Netlify. So locally, the verdict API call will fail with a 404. This is expected.

To test the full flow locally including verdicts, use Vercel's local CLI:

```bash
npm install -g vercel
vercel dev
```

This emulates the production environment and runs the API function correctly.

---

## Deploying to Vercel (recommended — 30 minutes)

### Step 1: Push to GitHub

If you don't already have a GitHub account, sign up at github.com.

```bash
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub (private is fine), then:
git remote add origin https://github.com/your-username/kick3.git
git branch -M main
git push -u origin main
```

### Step 2: Sign up for Vercel

Go to vercel.com and sign up with your GitHub account. Free tier is plenty for soft launch.

### Step 3: Import the project

Click "Add New Project" → select your kick3 repository → click "Import."

Vercel will auto-detect it's a Vite project. Don't change any settings.

### Step 4: Set the environment variable

Before clicking Deploy, expand the "Environment Variables" section and add:

- **Name:** `ANTHROPIC_API_KEY`
- **Value:** your real API key from console.anthropic.com

This is critical. Without it, Pete won't deliver verdicts.

### Step 5: Deploy

Click "Deploy." Wait 1-2 minutes. You'll get a URL like `kick3-yourname.vercel.app`.

Open it. Play it. If everything works, you're live.

---

## Connecting a custom domain

### Step 1: Buy a domain

Suggested registrars: Namecheap, Porkbun, Cloudflare. Roughly £8-15/year.

Suggested names to check (verify availability before falling in love):
- `kick3.app`
- `kick3.football`
- `kick3.fc`
- `playkick3.com`

### Step 2: Connect it in Vercel

In your Vercel project → Settings → Domains → Add. Paste your domain.

Vercel will show you DNS records to set at your registrar (an A record and a CNAME). Copy them across. DNS propagation takes a few minutes to a few hours.

After it's done, your domain will serve the site with automatic HTTPS.

---

## How the API security works

The Anthropic API key MUST stay server-side. If it's exposed in the browser, anyone can grab it and use your billing account.

The architecture:

1. Browser sends `{ systemPrompt, userMessage }` to `/api/verdict`
2. The serverless function in `api/verdict.js` reads `ANTHROPIC_API_KEY` from server-side env vars
3. It calls Anthropic with the key, gets the response, and returns just the text
4. The browser never sees the key

This is why the local dev server alone won't work for verdicts — `vite dev` only serves the frontend. You need either `vercel dev` locally or the deployed version on Vercel for the API to function.

---

## Costs to expect

- **Vercel:** Free for hobby use. Free tier is roughly 100GB bandwidth and 100k function invocations per month. Plenty for soft launch.
- **Domain:** £8-15/year.
- **Anthropic API:** Each Pete verdict is roughly 1-2p. 1,000 plays/day costs ~£10-20/day. Watch this carefully if usage grows.
- **Total for soft launch (first 3 months, ~30 friends playing daily):** Probably under £30 total.

---

## Troubleshooting

**"Pete is having a moment" / verdict fails on the deployed site**
Check that `ANTHROPIC_API_KEY` is set correctly in Vercel's environment variables. The most common cause is a typo or pasting in extra whitespace.

**Local dev server starts but verdicts fail with 404**
That's expected. `vite dev` doesn't run serverless functions. Use `vercel dev` instead.

**Game looks broken / fonts not loading**
Check the browser console for errors. Most likely the Google Fonts request failed — usually a network issue, will resolve on refresh.

**Dev calendar button still showing in production**
Yes, it's deliberately visible for now. To remove it before public launch, find the `DEV CALENDAR` button block in `src/App.jsx` (search for "DEV CALENDAR") and delete that button JSX. The calendar code itself can stay — it's just unreachable without the button.

---

## Phase 3 onwards

Things deliberately not in this build, but planned in the spec:

- **Accounts and authentication** — Supabase recommended. Free tier covers everything you'll need.
- **Streak tracking** — needs accounts first.
- **Friend groups** — needs accounts first.
- **Pete's memory** — needs accounts plus a small per-user history table.
- **PNG export of share cards** — `satori` library turns HTML into PNGs server-side.
- **Analytics** — Plausible or Simple Analytics. Privacy-respecting, cheap.

Don't build these until soft launch tells you which one users actually want first.

---

## What to do after deploy

1. Play the deployed version on your own phone. Make sure it works.
2. Send the URL to 5 close friends. Don't explain. Watch what they do.
3. Take notes on what they don't understand, what they screenshot, what they ignore.
4. Wait two weeks before adding any new features. Resist the urge to optimise.
5. After two weeks, fix the 5-10 issues your friends surfaced.
6. Send to 20-30 footballing friends. Run the soft launch from there.

The hardest discipline at this stage is not building. Build only what feedback proves you need.
