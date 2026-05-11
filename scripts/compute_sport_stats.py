#!/usr/bin/env python3
"""
Compute aggregate sport statistics for the Explorer mode.
All data is team-level — no individual athlete names (NIL compliance).

Input:  datasets/usa_results.csv, datasets/usa_athletes.csv,
        datasets/la28_sport_program.csv, datasets/medal_rates.json
Output: datasets/sport_stats.json

Run once. The game app loads the JSON at build time.
"""

import csv
import json
from collections import defaultdict, Counter
from pathlib import Path

RESULTS_FILE = Path("data/usa_results.csv")
ATHLETES_FILE = Path("data/usa_athletes.csv")
LA28_FILE = Path("data/la28_sport_program.csv")
MEDAL_RATES_FILE = Path("src/datasets/medal_rates.json")
OUTPUT_FILE = Path("src/datasets/sport_stats.json")

# Olympic sport mapping (applied when games_type != Paralympic)
SPORT_MAP = {
    "Athletics": "Track & Field",
    "Artistic Gymnastics": "Gymnastics",
    "Canoe Sprint": "Canoe / Kayak",
    "Canoe Slalom": "Canoe / Kayak",
    "Cycling Track": "Cycling",
    "Cycling Road": "Cycling",
    "Cycling Mountain Bike": "Cycling",
    "Cycling BMX Racing": "Cycling",
    "Cycling BMX Freestyle": "Cycling",
    "Short Track Speed Skating": "Speed Skating",
    "Beach Volleyball": "Volleyball",
    "American Football": "Flag Football",
    "Rugby": "Rugby Sevens",
    "Rugby Sevens": "Rugby Sevens",
    "Equestrian Eventing": "Equestrian",
    "Equestrian Jumping": "Equestrian",
    "Equestrian Dressage": "Equestrian",
}

# Paralympic sport mapping (applied only when games_type == Paralympic)
# Sources: both results CSV (uses Olympic-style names like "Athletics") and
# athletes CSV (uses mix of "Para Track and Field", "Para-Cycling", etc.)
PARA_SPORT_MAP = {
    # Track & Field / Athletics variants
    "Athletics": "Para Track & Field",
    "Track and Field": "Para Track & Field",
    "Para Track and Field": "Para Track & Field",
    # Swimming
    "Swimming": "Para Swimming",
    "Para Swimming": "Para Swimming",
    # Alpine
    "Alpine Skiing": "Para Alpine",
    "Para Alpine Skiing": "Para Alpine",
    # Nordic (includes biathlon + cross country skiing for para purposes)
    "Cross Country": "Para Nordic",
    "Cross Country Skiing": "Para Nordic",
    "Biathlon": "Para Nordic",
    "Para Nordic Skiing": "Para Nordic",
    # Cycling
    "Cycling": "Para Cycling",
    "Para-Cycling": "Para Cycling",
    # Triathlon
    "Triathlon": "Para Triathlon",
    "Paratriathlon": "Para Triathlon",
    # Archery
    "Archery": "Para Archery",
    "Para Archery": "Para Archery",
    # Powerlifting
    "Powerlifting": "Para Powerlifting",
    "Para Powerlifting": "Para Powerlifting",
    # Direct-name Para spirits (already match the game name)
    "Wheelchair Basketball": "Wheelchair Basketball",
    "Wheelchair Rugby": "Wheelchair Rugby",
    "Wheelchair Tennis": "Wheelchair Tennis",
    "Sitting Volleyball": "Sitting Volleyball",
    "Sled Hockey": "Sled Hockey",
    "Goalball": "Goalball",
}


def map_sport(raw_sport, games_type):
    """Map a raw CSV sport name to the game spirit name, respecting games_type.
    Returns the mapped name, or the raw name if no mapping exists.
    """
    s = (raw_sport or "").strip()
    if not s:
        return s
    # Multi-sport entries like "Para Alpine Skiing; Para Biathlon" — take first
    if ";" in s:
        s = s.split(";")[0].strip()
    if games_type == "Paralympic":
        return PARA_SPORT_MAP.get(s, s)
    return SPORT_MAP.get(s, s)

# Fun facts per sport (team-level, no individual names)
FUN_FACTS = {
    "Swimming": "Team USA has won more Olympic swimming medals than any other country — over 550 and counting.",
    "Track & Field": "The USA has dominated Olympic Track & Field since 1896, winning more medals than the next two countries combined.",
    "Gymnastics": "USA Gymnastics has risen from underdog to powerhouse — the women's team has won team gold at the last 3 Olympics.",
    "Basketball": "Team USA men's basketball has an 82% Olympic gold rate — the most dominant team sport in Games history.",
    "Wrestling": "Wrestling is one of the original Olympic sports from 1896. The USA excels in freestyle but struggles in Greco-Roman.",
    "Rowing": "The Men's Eight is Team USA's signature rowing event — they've won gold in nearly half of all Olympic finals.",
    "Shooting": "Shooting was in the very first modern Olympics. Team USA's skeet shooters have a 33% gold rate — one of the highest in any event.",
    "Diving": "USA divers dominate the springboard with a 53% gold rate — the highest of any individual Olympic event.",
    "Fencing": "The USA was a latecomer to fencing success. Most medals have come since the 2000s after decades of European dominance.",
    "Boxing": "Olympic boxing has produced some of America's greatest sporting moments. The heavyweight division has a 26% gold rate.",
    "Volleyball": "Beach volleyball is a USA invention — and Americans have won gold in nearly half of all Olympic tournaments.",
    "Water Polo": "The US women's water polo team has dominated since the sport added a women's event, with a 43% gold rate.",
    "Surfing": "Surfing debuted at Tokyo 2020. Team USA women won gold in the inaugural competition.",
    "Skateboarding": "Skateboarding joined the Olympics in 2021. Despite inventing the sport, Team USA hasn't won gold yet.",
    "Alpine Skiing": "US Alpine skiing peaks in the downhill — America's most decorated winter event with a 29% gold rate.",
    "Ice Hockey": "USA women's ice hockey is remarkable — they've medaled in every single Olympic tournament since the event began.",
    "Snowboarding": "The USA invented competitive snowboarding and dominates it — 56% gold rate in halfpipe across all Games.",
    "Golf": "Golf returned to the Olympics in 2016 after a 112-year absence. Team USA men have won gold in 3 of 5 appearances historically.",
    "Tennis": "The US women's doubles team has an incredible 58% gold rate — the most dominant doubles program in Olympic tennis.",
    "Archery": "US men's individual archery has a 30% gold rate — one of the highest individual precision sport records.",
    "Cycling": "BMX Racing is the USA's strongest cycling discipline, with a 10% gold and 20% silver rate.",
    "Sailing": "The USA's keelboat sailors have won gold in 29% of their events — strong in multi-crew boats.",
    "Figure Skating": "US women's figure skating has a 31% gold rate — among the highest in any subjectively-judged sport.",
    "Speed Skating": "The 500m sprint is the USA's strongest speed skating event — 18% gold rate since 1924.",
    "Judo": "Judo is one of the USA's toughest Olympic sports — the team has only a 1% gold rate historically.",
    "Triathlon": "Triathlon debuted in 2000. The USA has been building strength, especially in the mixed relay format.",
    "Weightlifting": "US weightlifting peaked mid-century. The heavyweight division remains the strongest class.",
    "Baseball": "Baseball returned to the Olympics in 2020 after 12 years away and will be back at LA28. Team USA has struggled against Japan and Cuba historically but remains a consistent medal contender.",
    "Softball": "Softball is Team USA's strongest ball sport by gold rate — 60% across all Olympic appearances. The USA won gold in 3 of the 4 Olympic softball tournaments before LA28.",
    "Rugby Sevens": "Rugby Sevens joined the Olympics in 2016. The US men surprised with early success including a gold.",
    "Sport Climbing": "Sport Climbing debuted in 2021. The USA earned silver medals in the first two Olympic competitions.",
    "Table Tennis": "The USA has struggled against Asian dominance in Olympic table tennis — but Para table tennis tells a different story.",
    "Equestrian": "Equestrian is the only Olympic sport where men and women compete directly against each other.",
    "Freestyle Skiing": "US freestyle skiers own the halfpipe — a 50% gold rate, the highest of any winter event.",
    "Canoe / Kayak": "Canoe & kayak is one of the USA's most challenging Olympic sports — gold has been rare historically.",
    "Taekwondo": "Taekwondo joined the Olympics in 2000. The US women have shown more medal potential than the men's team.",
    "Modern Pentathlon": "The USA has never won Olympic gold in modern pentathlon — but has collected silvers and bronzes since the 1920s.",
    "Flag Football": "Flag Football debuts at LA 2028 — it's one of the newest Olympic sports and an American invention.",
    "Para Swimming": "US Para swimmers are among the world's best, competing across multiple classification categories.",
    "Para Track & Field": "Para Track & Field is one of the largest Paralympic sports, with dozens of events across classifications.",
    "Wheelchair Rugby": "Wheelchair Rugby (aka 'Murderball') is one of the most intense Paralympic team sports.",
    "Sitting Volleyball": "The US women's sitting volleyball team has been a consistent medal contender at the Paralympics.",
    "Wheelchair Basketball": "Wheelchair basketball was one of the founding Paralympic sports in 1960.",
    "Sled Hockey": "US Sled Hockey has been dominant — one of the strongest Paralympic team programs.",
    "Para Alpine": "Para Alpine skiing covers standing, sitting, and visually impaired categories — a showcase of adaptive athletics.",
    "Para Nordic": "Para Nordic skiing includes both cross-country and biathlon — combining endurance with precision.",
    "Para Cycling": "Para Cycling includes track, road, and tandem events for athletes with various impairments.",
    "Para Archery": "Para Archery athletes compete in compound and recurve divisions with various adaptive equipment.",
    "Goalball": "Goalball was invented specifically for visually impaired athletes — all players wear blackout shades.",
    "Para Powerlifting": "Para Powerlifting is pure bench press — athletes are classified by body weight, not impairment type.",
    "Para Triathlon": "Para Triathlon debuted at Rio 2016, covering swim-bike-run with adaptive equipment.",
    "Wheelchair Tennis": "Wheelchair Tennis uses the same courts and rules as able-bodied tennis — with a two-bounce allowance.",
}


def main():
    # ── Load results ──
    results = []
    with open(RESULTS_FILE, "r") as f:
        for row in csv.DictReader(f):
            results.append(row)
    print(f"Loaded {len(results):,} results")

    # ── Load athletes ──
    athletes = []
    with open(ATHLETES_FILE, "r") as f:
        for row in csv.DictReader(f):
            athletes.append(row)
    print(f"Loaded {len(athletes):,} athletes")

    # ── Load LA28 sports (game spirit names, curated from la28_sport_program.csv) ──
    # The LA28 CSV uses different sport names than our game (e.g., "Athletics"
    # vs "Track & Field"), and some LA28 sports don't have game spirits (e.g.,
    # Cricket, Squash, Handball). Rather than fuzzy substring matching which
    # creates false positives, we maintain an explicit list of which game
    # spirits are at LA28, with optional "new at LA28" flags.
    #
    # Source: datasets/la28_sport_program.csv (2028 Summer Olympics + Paralympics)
    # Winter sports (Alpine, Ice Hockey, etc.) are NOT at LA28.
    LA28_SPIRITS = {
        # Olympic spirits at LA28 (Summer 2028)
        "Archery", "Gymnastics", "Track & Field", "Baseball", "Softball",
        "Basketball", "Volleyball", "Boxing", "Canoe / Kayak", "Cycling",
        "Diving", "Equestrian", "Fencing", "Flag Football", "Golf",
        "Judo", "Swimming", "Modern Pentathlon", "Rowing", "Rugby Sevens",
        "Sailing", "Shooting", "Skateboarding", "Sport Climbing", "Surfing",
        "Table Tennis", "Taekwondo", "Tennis", "Triathlon", "Water Polo",
        "Weightlifting", "Wrestling",
        # Paralympic spirits at LA28 Paralympics (following Olympics)
        "Para Track & Field", "Para Swimming", "Para Archery", "Para Cycling",
        "Para Triathlon", "Wheelchair Basketball", "Wheelchair Tennis",
        "Wheelchair Rugby", "Sitting Volleyball", "Para Powerlifting", "Goalball",
    }
    # Sports debuting or returning at LA28 (game spirits only)
    NEW_AT_LA28 = {"Flag Football", "Baseball", "Softball"}

    # Keep la28_sports set for any downstream code that expects it (unused now)
    la28_sports = LA28_SPIRITS
    la28_new = NEW_AT_LA28

    # ── Load medal rates ──
    medal_rates = {}
    if MEDAL_RATES_FILE.exists():
        with open(MEDAL_RATES_FILE, "r") as f:
            medal_rates = json.load(f).get("rates", {})

    # ── Aggregate results by mapped sport ──
    # Deduplicate team events first
    RANK = {"Gold": 3, "Silver": 2, "Bronze": 1, "": 0}
    games_events = {}
    # Include games_type in dedup key so Olympic and Paralympic events
    # don't collide when they happen to share names
    for r in results:
        gt = r.get("games_type", "").strip()
        key = (r["games_year"], gt, r["sport"], r["event"])
        medal = r.get("medal", "").strip()
        season = r.get("games_season", "").strip()
        if key not in games_events or RANK.get(medal, 0) > RANK.get(games_events[key][0], 0):
            games_events[key] = (medal, season)

    sport_data = defaultdict(lambda: {
        "gold": 0, "silver": 0, "bronze": 0,
        "events": set(), "years": set(), "seasons": set(),
        "decades": defaultdict(lambda: [0, 0, 0]),
    })

    for (year, gt, sport, event), (medal, season) in games_events.items():
        mapped = map_sport(sport, gt)
        if not mapped:
            continue
        d = sport_data[mapped]
        if medal == "Gold": d["gold"] += 1
        elif medal == "Silver": d["silver"] += 1
        elif medal == "Bronze": d["bronze"] += 1
        d["events"].add(event)
        if season: d["seasons"].add(season)
        try:
            y = int(year)
            d["years"].add(y)
            dec = (y // 10) * 10
            if medal == "Gold": d["decades"][dec][0] += 1
            elif medal == "Silver": d["decades"][dec][1] += 1
            elif medal == "Bronze": d["decades"][dec][2] += 1
        except ValueError:
            pass

    # ── Aggregate athletes by mapped sport ──
    athlete_data = defaultdict(lambda: {
        "count": 0, "gender": Counter(),
        "heights": [], "weights": [],
    })

    for a in athletes:
        sport = a.get("primary_sport", "").strip()
        if not sport:
            continue
        gt = a.get("games_type", "").strip()
        # "Both" athletes: treat as Olympic for mapping (they competed in both)
        if gt == "Both":
            gt = "Olympic"
        mapped = map_sport(sport, gt)
        if not mapped:
            continue
        ad = athlete_data[mapped]
        ad["count"] += 1
        g = a.get("gender", "").strip()
        if g:
            ad["gender"][g] += 1
        h = a.get("height_cm", "").strip()
        w = a.get("weight_kg", "").strip()
        try:
            if h: ad["heights"].append(float(h))
            if w: ad["weights"].append(float(w))
        except ValueError:
            pass

    # ── Get top events from medal_rates.json ──
    sport_top_events = defaultdict(list)
    for key, rates in medal_rates.items():
        if rates is None:
            continue
        sport, event = key.split("|", 1)
        sport_top_events[sport].append({
            "name": event,
            "gold": rates["gold"],
            "silver": rates["silver"],
            "bronze": rates["bronze"],
            "n": rates["sample_size"],
        })

    # Sort by gold rate descending
    for sport in sport_top_events:
        sport_top_events[sport].sort(key=lambda x: -x["gold"])

    # ── Build output ──
    output = {}
    all_sports = set(sport_data.keys()) | set(athlete_data.keys())

    for sport in sorted(all_sports):
        sd = sport_data.get(sport, {"gold": 0, "silver": 0, "bronze": 0, "events": set(), "years": set(), "seasons": set(), "decades": {}})
        ad = athlete_data.get(sport, {"count": 0, "gender": Counter(), "heights": [], "weights": []})

        years = sorted(sd["years"]) if sd["years"] else []
        seasons = [s for s in sd.get("seasons", set()) if s]

        # Determine LA28 status (exact match against curated game-spirit list)
        is_la28 = sport in LA28_SPIRITS
        is_new = sport in NEW_AT_LA28

        # Decades as sorted dict
        decades = {}
        for dec in sorted(sd["decades"].keys()):
            decades[str(dec)] = sd["decades"][dec]

        entry = {
            "totalMedals": {
                "gold": sd["gold"],
                "silver": sd["silver"],
                "bronze": sd["bronze"],
            },
            "totalAthletes": ad["count"],
            "eventCount": len(sd["events"]),
            "firstYear": years[0] if years else None,
            "lastYear": years[-1] if years else None,
            "gamesCount": len(years),
            "season": seasons[0] if seasons else "Unknown",
            "gender": dict(ad["gender"]),
            "bodyStats": {
                "avgH": round(sum(ad["heights"]) / len(ad["heights"]), 1) if ad["heights"] else None,
                "avgW": round(sum(ad["weights"]) / len(ad["weights"]), 1) if ad["weights"] else None,
            },
            "medalsByDecade": decades,
            "topEvents": sport_top_events.get(sport, [])[:5],
            "la28": is_la28,
            "isNew": is_new,
            "funFact": FUN_FACTS.get(sport, f"Team USA has competed in {sport} at the Olympic Games."),
        }
        output[sport] = entry

    # ── Save ──
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nSaved {len(output)} sports to {OUTPUT_FILE}")
    # Show a sample
    if "Swimming" in output:
        sw = output["Swimming"]
        print(f"\nSample — Swimming:")
        print(f"  Medals: {sw['totalMedals']}")
        print(f"  Athletes: {sw['totalAthletes']}")
        print(f"  Events: {sw['eventCount']}")
        print(f"  Years: {sw['firstYear']}-{sw['lastYear']} ({sw['gamesCount']} Games)")
        print(f"  Body: {sw['bodyStats']}")
        print(f"  Top events: {[e['name'] for e in sw['topEvents'][:3]]}")


if __name__ == "__main__":
    main()
