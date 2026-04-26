#!/usr/bin/env python3
"""Build unified Team USA athletes + results datasets.

Merges:
- Kaggle/GitHub Olympedia data (per-athlete, 1896-2022)
- Our Olympedia scrape (2024 Paris + 2026 Milano-Cortina)
- Our Paralympic scrape (1960-2026 medals)
- Team USA website profiles (current athletes)

Output matches (or exceeds) the reference dataset schema:
- team_usa_athletes_unified.csv (~12K+ athletes)
- team_usa_results_unified.csv (~24K+ results)
"""

import csv
import re
import uuid
from collections import defaultdict
from pathlib import Path

BASE = Path(__file__).parent.parent  # repo root; scripts/ sits one level down
DATA = BASE / "data"
KAGGLE_RESULTS = DATA / "kaggle" / "results.csv"  # optional; only for full rebuild
KAGGLE_BIOS = DATA / "kaggle" / "bios.csv"        # optional; only for full rebuild
OLYMPIC_RESULTS = DATA / "olympic_results.csv"
PARALYMPIC_RESULTS = DATA / "paralympic_results.csv"
TEAMUSA_ATHLETES = DATA / "team_usa_athletes.csv"

OUT_ATHLETES = DATA / "team_usa_athletes_unified.csv"
OUT_RESULTS = DATA / "team_usa_results_unified.csv"

RESULTS_COLS = [
    "athlete_id", "athlete_name", "games_year", "games_season",
    "games_type", "sport", "discipline", "event",
    "medal", "classification_code",
]

ATHLETES_COLS = [
    "athlete_id", "name", "gender", "birth_date",
    "height_cm", "weight_kg",
    "games_type", "games_season", "primary_sport", "classification_code",
    "first_games_year", "last_games_year", "games_count",
    "gold_count", "silver_count", "bronze_count", "total_medals",
]


def generate_athlete_id(name, first_games_year, primary_sport):
    ns = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
    key = f"{str(name).lower().strip()}|{first_games_year}|{str(primary_sport).lower().strip()}"
    return str(uuid.uuid5(ns, key))


def parse_year_from_games(games_str):
    m = re.search(r"(\d{4})", games_str or "")
    return int(m.group(1)) if m else None


def parse_season_from_games(games_str):
    if "Winter" in (games_str or ""):
        return "Winter"
    return "Summer"


def parse_measurements(meas_str):
    height, weight = None, None
    if not meas_str:
        return height, weight
    h = re.search(r"(\d{2,3})\s*cm", meas_str)
    w = re.search(r"(\d{2,3})\s*kg", meas_str)
    if h:
        height = float(h.group(1))
    if w:
        weight = float(w.group(1))
    return height, weight


def clean_name(name):
    if not name:
        return ""
    return name.replace("•", " ").replace("\u2022", " ").strip()


# ─── STEP 1: Load Kaggle Olympic results (USA, per-athlete, 1896-2022) ───

print("Step 1: Loading Kaggle Olympic results (USA)...")
kaggle_results = []
with open(KAGGLE_RESULTS, "r", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        if (row.get("NOC") or "") != "USA":
            continue
        year = parse_year_from_games(row.get("Games", ""))
        season = parse_season_from_games(row.get("Games", ""))
        medal = row.get("Medal") or ""
        if medal not in ("Gold", "Silver", "Bronze"):
            medal = ""
        kaggle_results.append({
            "athlete_id": row.get("athlete_id", ""),
            "athlete_name": clean_name(row.get("As", "")),
            "games_year": year,
            "games_season": season,
            "games_type": "Olympic",
            "sport": row.get("Discipline", ""),
            "discipline": row.get("Discipline", ""),
            "event": row.get("Event", ""),
            "medal": medal,
            "classification_code": "",
            "_source": "kaggle",
        })

print(f"  Kaggle Olympic USA results: {len(kaggle_results):,}")


# ─── STEP 2: Add 2024+2026 Olympic results from our scrape ───

print("Step 2: Adding 2024+2026 Olympic results from our scrape...")
new_olympic = []
with open(OLYMPIC_RESULTS, "r", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        year = int(row.get("games_year", 0))
        if year < 2024:
            continue  # Already in Kaggle

        athlete_name = row.get("athlete_name", "")
        team_name = row.get("team_name", "")
        team_members = row.get("team_members", "")
        medal = row.get("medal", "")
        sport = row.get("sport", "")
        event = row.get("event", "")
        season = row.get("games_season", "")
        placement = row.get("placement", "")

        if athlete_name:
            # Individual result
            new_olympic.append({
                "athlete_id": "",
                "athlete_name": athlete_name,
                "games_year": year,
                "games_season": season,
                "games_type": "Olympic",
                "sport": sport,
                "discipline": sport,
                "event": event,
                "medal": medal,
                "classification_code": "",
                "_source": "scrape_2024_2026",
            })

        # Expand team members into individual rows
        if team_members:
            for member in team_members.split(" | "):
                member = member.strip()
                if member and member != athlete_name:
                    new_olympic.append({
                        "athlete_id": "",
                        "athlete_name": member,
                        "games_year": year,
                        "games_season": season,
                        "games_type": "Olympic",
                        "sport": sport,
                        "discipline": sport,
                        "event": event,
                        "medal": medal,
                        "classification_code": "",
                        "_source": "scrape_2024_2026",
                    })

        # Team entry without individual athlete
        if team_name and not athlete_name and not team_members:
            new_olympic.append({
                "athlete_id": "",
                "athlete_name": team_name,
                "games_year": year,
                "games_season": season,
                "games_type": "Olympic",
                "sport": sport,
                "discipline": sport,
                "event": event,
                "medal": medal,
                "classification_code": "",
                "_source": "scrape_2024_2026",
            })

print(f"  2024+2026 Olympic results added: {len(new_olympic):,}")


# ─── STEP 3: Load Paralympic results ───

print("Step 3: Loading Paralympic results...")
para_results = []
with open(PARALYMPIC_RESULTS, "r", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        medal = row.get("medal", "")
        if medal not in ("Gold", "Silver", "Bronze"):
            medal = ""
        para_results.append({
            "athlete_id": "",
            "athlete_name": row.get("athlete_name", ""),
            "games_year": int(row.get("games_year", 0)),
            "games_season": row.get("games_season", ""),
            "games_type": "Paralympic",
            "sport": row.get("sport", ""),
            "discipline": row.get("sport", ""),
            "event": row.get("event", ""),
            "medal": medal,
            "classification_code": "",
            "_source": "para_scrape",
        })

print(f"  Paralympic results: {len(para_results):,}")


# ─── STEP 4: Combine all results ───

print("Step 4: Combining all results...")
all_results = kaggle_results + new_olympic + para_results
print(f"  Combined: {len(all_results):,}")

# Deduplicate on (athlete_name, games_year, event)
seen = set()
deduped_results = []
for r in all_results:
    key = (
        r["athlete_name"].lower().strip(),
        r["games_year"],
        r["event"].lower().strip(),
    )
    if key not in seen:
        seen.add(key)
        deduped_results.append(r)

print(f"  After dedup: {len(deduped_results):,}")


# ─── STEP 5: Build athletes table from results ───

print("Step 5: Building athletes table from results...")

# Group results by athlete name to compute career stats
athlete_data = defaultdict(lambda: {
    "results": [],
    "sports": [],
    "seasons": [],
    "years": [],
    "golds": 0,
    "silvers": 0,
    "bronzes": 0,
    "games_type": set(),
})

for r in deduped_results:
    name = r["athlete_name"].strip()
    if not name:
        continue
    ad = athlete_data[name]
    ad["results"].append(r)
    if r["sport"]:
        ad["sports"].append(r["sport"])
    if r["games_season"]:
        ad["seasons"].append(r["games_season"])
    if r["games_year"]:
        ad["years"].append(r["games_year"])
    if r["medal"] == "Gold":
        ad["golds"] += 1
    elif r["medal"] == "Silver":
        ad["silvers"] += 1
    elif r["medal"] == "Bronze":
        ad["bronzes"] += 1
    ad["games_type"].add(r["games_type"])


# Load Kaggle bios for biographical data
print("  Loading Kaggle bios for biographical data...")
kaggle_bios = {}
kaggle_id_to_name = {}
with open(KAGGLE_BIOS, "r", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        noc = (row.get("NOC") or "").strip()
        if "United States" not in noc:
            continue
        aid = row.get("athlete_id", "")
        name = clean_name(row.get("Used name", "")) or clean_name(row.get("Full name", ""))
        height, weight = parse_measurements(row.get("Measurements", ""))
        kaggle_bios[name] = {
            "gender": row.get("Sex", ""),
            "birth_date": row.get("Born", ""),
            "height_cm": height,
            "weight_kg": weight,
        }
        kaggle_id_to_name[aid] = name

print(f"  Loaded {len(kaggle_bios):,} USA bios from Kaggle")

# Also load teamusa.com profiles for extra data
print("  Loading teamusa.com profiles...")
teamusa_profiles = {}
with open(TEAMUSA_ATHLETES, "r", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        name = f"{(row.get('first_name') or '').strip()} {(row.get('last_name') or '').strip()}".strip()
        if name:
            teamusa_profiles[name] = {
                "classification_code": row.get("para_classification", ""),
            }

print(f"  Loaded {len(teamusa_profiles):,} teamusa.com profiles")


# Build athlete rows
athletes = []
name_to_id = {}

for name, ad in athlete_data.items():
    if not name or not ad["years"]:
        continue

    years = sorted(set(ad["years"]))
    sports = ad["sports"]
    primary_sport = max(set(sports), key=sports.count) if sports else ""
    seasons = ad["seasons"]
    primary_season = max(set(seasons), key=seasons.count) if seasons else ""
    games_years = sorted(set(ad["years"]))
    games_count = len(games_years)

    # Determine games_type
    types = ad["games_type"]
    if "Olympic" in types and "Paralympic" in types:
        games_type = "Both"
    elif "Paralympic" in types:
        games_type = "Paralympic"
    else:
        games_type = "Olympic"

    # Generate ID
    aid = generate_athlete_id(name, years[0], primary_sport)
    name_to_id[name] = aid

    # Get bio data from Kaggle
    bio = kaggle_bios.get(name, {})

    # Get classification from teamusa.com
    tusa = teamusa_profiles.get(name, {})
    classification = tusa.get("classification_code", "")

    athletes.append({
        "athlete_id": aid,
        "name": name,
        "gender": bio.get("gender", ""),
        "birth_date": bio.get("birth_date", ""),
        "height_cm": bio.get("height_cm", ""),
        "weight_kg": bio.get("weight_kg", ""),
        "games_type": games_type,
        "games_season": primary_season,
        "primary_sport": primary_sport,
        "classification_code": classification,
        "first_games_year": years[0],
        "last_games_year": years[-1],
        "games_count": games_count,
        "gold_count": ad["golds"],
        "silver_count": ad["silvers"],
        "bronze_count": ad["bronzes"],
        "total_medals": ad["golds"] + ad["silvers"] + ad["bronzes"],
    })

print(f"  Athletes built: {len(athletes):,}")


# ─── STEP 6: Assign athlete_ids to results ───

print("Step 6: Assigning athlete IDs to results...")
for r in deduped_results:
    name = r["athlete_name"].strip()
    r["athlete_id"] = name_to_id.get(name, "")


# ─── STEP 7: Export ───

print("Step 7: Exporting...")

with open(OUT_RESULTS, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=RESULTS_COLS, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(deduped_results)

with open(OUT_ATHLETES, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=ATHLETES_COLS)
    writer.writeheader()
    writer.writerows(athletes)

print(f"\nExported:")
print(f"  {OUT_ATHLETES.name}: {len(athletes):,} athletes")
print(f"  {OUT_RESULTS.name}: {len(deduped_results):,} results")


# ─── STEP 8: Validation ───

print("\n" + "=" * 60)
print("VALIDATION")
print("=" * 60)

# Targets
target_athletes = 11843
target_results = 24198
print(f"\nAthletes: {len(athletes):,} (target: ≥{target_athletes:,}) {'✅' if len(athletes) >= target_athletes else '⚠️  BELOW TARGET'}")
print(f"Results:  {len(deduped_results):,} (target: ≥{target_results:,}) {'✅' if len(deduped_results) >= target_results else '⚠️  BELOW TARGET'}")

# Medal counts
total_medals = sum(1 for r in deduped_results if r["medal"] in ("Gold", "Silver", "Bronze"))
golds = sum(1 for r in deduped_results if r["medal"] == "Gold")
silvers = sum(1 for r in deduped_results if r["medal"] == "Silver")
bronzes = sum(1 for r in deduped_results if r["medal"] == "Bronze")
print(f"\nMedals: {golds} Gold, {silvers} Silver, {bronzes} Bronze = {total_medals} total")

# Games type breakdown
olympic_athletes = sum(1 for a in athletes if a["games_type"] == "Olympic")
para_athletes = sum(1 for a in athletes if a["games_type"] == "Paralympic")
both_athletes = sum(1 for a in athletes if a["games_type"] == "Both")
print(f"\nAthlete breakdown: {olympic_athletes:,} Olympic, {para_athletes:,} Paralympic, {both_athletes} Both")

# Year coverage
years = set(r["games_year"] for r in deduped_results if r["games_year"])
print(f"Year range: {min(years)}-{max(years)}")

# Spot checks
print("\nSpot checks:")
for check_name in ["Michael Phelps", "Simone Biles", "Katie Ledecky", "Oksana Masters"]:
    matches = [a for a in athletes if check_name.lower() in a["name"].lower()]
    if matches:
        a = matches[0]
        print(f"  {a['name']}: {a['primary_sport']}, {a['total_medals']} medals "
              f"({a['gold_count']}G), {a['games_count']} Games "
              f"({a['first_games_year']}-{a['last_games_year']})")
    else:
        print(f"  {check_name}: NOT FOUND")

# FK check
athlete_ids = set(a["athlete_id"] for a in athletes)
orphans = sum(1 for r in deduped_results if r["athlete_id"] and r["athlete_id"] not in athlete_ids)
print(f"\nFK integrity: {orphans} orphan results")
