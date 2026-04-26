# Olympus Rising

A data-driven React/Vite game where spirits battle using real Team USA
Olympic/Paralympic medal rates. Attacks are probabilistic rolls against
event-level gold/silver/bronze rates; combat mechanics come from
`datasets/medal_rates.json` and `datasets/sport_stats.json`.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev`   | Vite dev server on port 5173 |
| `npm run build` | Production build into `dist/` |

## Data pipeline

Runtime data lives in `src/datasets/` (imported by `src/App.jsx`). To
regenerate after upstream scrapes:

```bash
# Optional: rescrape raw sources
python3 scripts/scrape_athletes.py       # -> data/team_usa_athletes.{csv,json}
python3 scripts/scrape_olympedia.py      # -> data/olympic_results.{csv,json}
python3 scripts/scrape_paralympics.py    # -> data/paralympic_results.{csv,json}

# Optional: full rebuild of unified CSVs (needs data/kaggle/{results,bios}.csv
# from the Kaggle `olympic-athletes` dataset — not included)
python3 scripts/build_unified_dataset.py # -> data/team_usa_*_unified.csv

# Rebuild runtime JSON (order matters — sport_stats depends on medal_rates):
python3 scripts/compute_medal_rates.py   # -> src/datasets/medal_rates.json
python3 scripts/compute_sport_stats.py   # -> src/datasets/sport_stats.json
```

Unified CSVs (`team_usa_athletes_unified.csv`,
`team_usa_results_unified.csv`) are committed under `data/` so the two
`compute_*` scripts work out of the box without a full rebuild.

## Known issues

`App.jsx` contains a function named `gemini()` that POSTs to
`https://api.anthropic.com/v1/messages` with no auth header; it silently
returns `""` on failure. Safe but dead code — remove or wire up a real
API as follow-up.
