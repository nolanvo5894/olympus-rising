# Olympus Rising

**Play it:** https://olympus-rising-n5x2w3glhq-uc.a.run.app

A Team USA card battler set in the LA28 Olympic & Paralympic universe. Players take the **Delphic Lens** quiz to find their matched sport, then explore a stylized US map and battle region monsters using **sport spirits** — characters whose moves are real Olympic events and whose success rates come from actual Team USA medal history.

## Stack
- **Frontend:** React 19 + Vite
- **Server:** Express (serves the production bundle and proxies Gemini calls)
- **AI:** Google Gemini (generated avatars, region monsters, oracle commentary)
- **Deploy:** Cloud Build → Cloud Run (`olympus-rising` service, `us-central1`), triggered on push to `main`

## Reproducible Testing

### 1. Install
```bash
git clone https://github.com/nolanvo5894/olympus-rising.git
cd olympus-rising
npm install
```

### 2. Add a Gemini API key
Create `.env.local`:
```
GEMINI_API_KEY=<your key>          # used by the Express server (prod build)
VITE_GEMINI_API_KEY=<your key>     # used by the Vite dev server
```

### 3. Run
```bash
npm run dev          # dev server at http://localhost:5173
# or
npm run build && npm start   # production build at http://localhost:8080
```

### 4. Regenerate the game data (optional)
The app ships with pre-built JSON in [`src/datasets/`](src/datasets), so this is only needed if you change the source CSVs in [`data/`](data) or the compute logic. Inputs: `usa_athletes.csv`, `usa_results.csv`, `la28_sport_program.csv` (all tracked).

```bash
python3 scripts/compute_medal_rates.py
python3 scripts/compute_region_sport_strength.py
python3 scripts/compute_sport_stats.py
```

> The raw scrape outputs and `scripts/scrape_*.py` are intentionally local-only — they hit external sites (Olympedia, paralympic.org, teamusa.com) and aren't needed to run or reproduce the game.
