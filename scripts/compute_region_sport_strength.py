"""Derive REGION_SPORT_STRENGTH from team_usa_athletes_unified.csv.

For each in-game sport, pick the top N regions ranked by Team USA athlete
count, weighted by total_medals + 1 so medal-winners count more than
non-medalists. Output JSON consumed by src/App.jsx.

Run:  python3 scripts/compute_region_sport_strength.py
"""

from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "data" / "team_usa_athletes_unified.csv"
OUT_PATH = ROOT / "src" / "datasets" / "region_sport_strength.json"

# State -> region id, mirroring REGIONS in src/App.jsx (la28 is excluded;
# it acts as a universal-affinity flag, not a geography).
STATE_TO_REGION: dict[str, str] = {
    # Pacific
    "CA": "pacific", "OR": "pacific", "WA": "pacific", "NV": "pacific",
    "HI": "pacific", "AK": "pacific",
    # Mountain
    "CO": "mountain", "UT": "mountain", "WY": "mountain",
    "MT": "mountain", "ID": "mountain",
    # Southwest
    "TX": "southwest", "AZ": "southwest", "NM": "southwest", "OK": "southwest",
    # Heartland
    "OH": "heartland", "IN": "heartland", "IL": "heartland", "MI": "heartland",
    "MN": "heartland", "WI": "heartland", "IA": "heartland", "MO": "heartland",
    "KS": "heartland", "NE": "heartland", "ND": "heartland", "SD": "heartland",
    # South
    "FL": "south", "GA": "south", "AL": "south", "TN": "south", "NC": "south",
    "SC": "south", "MS": "south", "LA": "south", "AR": "south", "KY": "south",
    # Northeast
    "NY": "northeast", "NJ": "northeast", "MA": "northeast", "PA": "northeast",
    "ME": "northeast", "CT": "northeast", "RI": "northeast", "NH": "northeast",
    "VT": "northeast",
    # Capital
    "DC": "capital", "MD": "capital", "VA": "capital",
    "WV": "capital", "DE": "capital",
}

# CSV `primary_sport` -> in-game spirit sport name. Sports not in this map
# are dropped (they aren't represented in SPIRITS, e.g. Soccer, Curling,
# Bobsleigh).
SPORT_NORMALIZE: dict[str, str] = {
    # Olympic
    "Athletics": "Track & Field",
    "Track and Field": "Track & Field",
    "ATH": "Track & Field",
    "Swimming": "Swimming",
    "Diving": "Diving",
    "Artistic Swimming": "Swimming",  # diving/artistic swim live in pool culture
    "Water Polo": "Water Polo",
    "Rowing": "Rowing",
    "Sailing": "Sailing",
    "Canoe Sprint": "Canoe / Kayak",
    "Canoe Slalom": "Canoe / Kayak",
    "Canoe/Kayak": "Canoe / Kayak",
    "Surfing": "Surfing",
    "Skateboarding": "Skateboarding",
    "Artistic Gymnastics": "Gymnastics",
    "Rhythmic Gymnastics": "Gymnastics",
    "Basketball": "Basketball",
    "Volleyball": "Volleyball",
    "Beach Volleyball": "Volleyball",
    "Baseball": "Baseball",
    "Softball": "Softball",
    "Tennis": "Tennis",
    "Table Tennis": "Table Tennis",
    "Golf": "Golf",
    "Archery": "Archery",
    "Shooting": "Shooting",
    "Fencing": "Fencing",
    "Boxing": "Boxing",
    "Wrestling": "Wrestling",
    "Judo": "Judo",
    "Taekwondo": "Taekwondo",
    "Weightlifting": "Weightlifting",
    "Cycling": "Cycling",
    "Cycling Track": "Cycling",
    "Cycling Road": "Cycling",
    "Cycling Mountain Bike": "Cycling",
    "Cycling BMX Racing": "Cycling",
    "Triathlon": "Triathlon",
    "Modern Pentathlon": "Modern Pentathlon",
    "Equestrian": "Equestrian",
    "Equestrian Eventing": "Equestrian",
    "Equestrian Jumping": "Equestrian",
    "Equestrian Dressage": "Equestrian",
    "Rugby Sevens": "Rugby Sevens",
    "Sport Climbing": "Sport Climbing",
    "Alpine Skiing": "Alpine Skiing",
    "Freestyle Skiing": "Freestyle Skiing",
    "Snowboarding": "Snowboarding",
    "Ice Hockey": "Ice Hockey",
    "Figure Skating": "Figure Skating",
    "Speed Skating": "Speed Skating",
    "Short Track Speed Skating": "Speed Skating",
    # Paralympic
    "Para Swimming": "Para Swimming",
    "Para Track and Field": "Para Track & Field",
    "Wheelchair Basketball": "Wheelchair Basketball",
    "Wheelchair Rugby": "Wheelchair Rugby",
    "Wheelchair Tennis": "Wheelchair Tennis",
    "Sitting Volleyball": "Sitting Volleyball",
    "Sled Hockey": "Sled Hockey",
    "Goalball": "Goalball",
    "Para Archery": "Para Archery",
    "Para Powerlifting": "Para Powerlifting",
    "Para Alpine Skiing": "Para Alpine",
    "Para Nordic Skiing": "Para Nordic",
    "Para-Cycling": "Para Cycling",
    "Paratriathlon": "Para Triathlon",
}

TOP_N = 3  # number of regions kept per sport


def main() -> None:
    # tally[game_sport][region_id] = weighted count
    tally: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    rows_total = 0
    rows_used = 0

    with CSV_PATH.open() as f:
        for row in csv.DictReader(f):
            rows_total += 1
            csv_sport = row.get("primary_sport", "").strip()
            state = row.get("hometown_state", "").strip().upper()
            if not csv_sport or not state:
                continue
            game_sport = SPORT_NORMALIZE.get(csv_sport)
            region = STATE_TO_REGION.get(state)
            if not game_sport or not region:
                continue
            try:
                medals = int(float(row.get("total_medals", "") or 0))
            except ValueError:
                medals = 0
            # Each athlete contributes 1 + total_medals so medal winners
            # weight more heavily without ignoring non-medalists.
            tally[game_sport][region] += 1 + medals
            rows_used += 1

    # Pick top-N regions per sport, breaking ties by region id alphabetic.
    out: dict[str, list[str]] = {}
    for sport in sorted(tally):
        ranked = sorted(
            tally[sport].items(),
            key=lambda kv: (-kv[1], kv[0]),
        )
        out[sport] = [r for r, _ in ranked[:TOP_N]]

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUT_PATH.open("w") as f:
        json.dump(out, f, indent=2, sort_keys=True)
        f.write("\n")

    print(
        f"Read {rows_total:,} athlete rows; used {rows_used:,} "
        f"({100 * rows_used / rows_total:.1f}%) with hometown_state + sport mapping."
    )
    print(f"Wrote {len(out)} sports to {OUT_PATH.relative_to(ROOT)}.\n")
    print("Top regions per sport (with weighted athlete-count):")
    for sport, regions in sorted(out.items()):
        readable = ", ".join(
            f"{r} ({tally[sport][r]:.0f})" for r in regions
        )
        print(f"  {sport:<28} {readable}")


if __name__ == "__main__":
    main()
