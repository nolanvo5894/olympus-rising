#!/usr/bin/env python3
"""
Compute Team USA Olympic/Paralympic medal rates per event using Option A:
  - Deduplicate team events to 1 entry per (games_year, event)
  - Rate = medals won / Games entered for that event
  - Combines men's + women's events where applicable

Input:  datasets/team_usa_results_unified.csv
Output: datasets/medal_rates.json

Run once. The game app loads the JSON at build time.
"""

import csv
import json
from collections import defaultdict
from pathlib import Path

RESULTS_FILE = Path("data/team_usa_results_unified.csv")
OUTPUT_FILE = Path("src/datasets/medal_rates.json")

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
PARA_SPORT_MAP = {
    "Athletics": "Para Track & Field",
    "Track and Field": "Para Track & Field",
    "Para Track and Field": "Para Track & Field",
    "Swimming": "Para Swimming",
    "Para Swimming": "Para Swimming",
    "Alpine Skiing": "Para Alpine",
    "Para Alpine Skiing": "Para Alpine",
    "Cross Country": "Para Nordic",
    "Cross Country Skiing": "Para Nordic",
    "Biathlon": "Para Nordic",
    "Para Nordic Skiing": "Para Nordic",
    "Cycling": "Para Cycling",
    "Para-Cycling": "Para Cycling",
    "Triathlon": "Para Triathlon",
    "Paratriathlon": "Para Triathlon",
    "Archery": "Para Archery",
    "Para Archery": "Para Archery",
    "Powerlifting": "Para Powerlifting",
    "Para Powerlifting": "Para Powerlifting",
    "Wheelchair Basketball": "Wheelchair Basketball",
    "Wheelchair Rugby": "Wheelchair Rugby",
    "Wheelchair Tennis": "Wheelchair Tennis",
    "Sitting Volleyball": "Sitting Volleyball",
    "Sled Hockey": "Sled Hockey",
    "Goalball": "Goalball",
}


def map_sport(raw_sport, games_type):
    s = (raw_sport or "").strip()
    if not s:
        return s
    if ";" in s:
        s = s.split(";")[0].strip()
    if games_type == "Paralympic":
        return PARA_SPORT_MAP.get(s, s)
    return SPORT_MAP.get(s, s)

# Map each spirit move name → (sport, search_keywords, exclude_keywords)
# Keywords are matched case-insensitively against event names
MOVE_EVENT_MAP = {
    # Swimming
    ("Swimming", "100m Freestyle"): (["100", "freestyle"], ["relay", "4"]),
    ("Swimming", "200m Butterfly"): (["200", "butterfly"], []),
    ("Swimming", "4×100m Medley Relay"): (["4", "100", "medley", "relay"], []),
    ("Swimming", "10km Open Water"): (["10", "open"], []),
    ("Swimming", "200m Backstroke"): (["200", "backstroke"], []),
    # Track & Field
    ("Track & Field", "100m Sprint"): (["100 metres"], ["relay", "hurdle", "4"]),
    ("Track & Field", "400m Hurdles"): (["400", "hurdles"], []),
    ("Track & Field", "4×400m Relay"): (["4", "400", "relay"], []),
    ("Track & Field", "Marathon"): (["marathon"], []),
    ("Track & Field", "Shot Put"): (["shot put"], []),
    # Gymnastics
    ("Gymnastics", "All-Around"): (["individual all-around"], []),
    ("Gymnastics", "Floor Exercise"): (["floor"], []),
    ("Gymnastics", "Vault"): (["vault"], []),
    ("Gymnastics", "Balance Beam"): (["balance beam"], []),
    # Basketball
    ("Basketball", "Men's Tournament"): (["basketball", "men"], []),
    ("Basketball", "Women's Tournament"): (["basketball", "women"], []),
    # Wrestling
    ("Wrestling", "Freestyle 74kg"): (["freestyle"], ["greco", "women"]),
    ("Wrestling", "Greco-Roman 67kg"): (["greco"], []),
    ("Wrestling", "Women's Freestyle 57kg"): (["women"], []),
    # Rowing
    ("Rowing", "Men's Eight"): (["eight"], []),
    ("Rowing", "Women's Single Sculls"): (["single sculls", "women"], []),
    ("Rowing", "Men's Coxless Pair"): (["coxless pair"], []),
    # Shooting
    ("Shooting", "Air Rifle 10m"): (["air rifle", "10"], []),
    ("Shooting", "Skeet"): (["skeet"], []),
    ("Shooting", "Rapid Fire Pistol"): (["rapid", "pistol"], []),
    # Diving
    ("Diving", "10m Platform"): (["platform"], ["synch"]),
    ("Diving", "3m Springboard"): (["springboard"], ["synch"]),
    ("Diving", "Synchro 10m"): (["synch", "platform"], []),
    # Fencing
    ("Fencing", "Foil Individual"): (["foil", "individual"], []),
    ("Fencing", "Épée Team"): (["pée", "team"], []),
    ("Fencing", "Sabre Individual"): (["sabre", "individual"], []),
    # Boxing
    ("Boxing", "Welterweight"): (["welterweight"], []),
    ("Boxing", "Lightweight"): (["lightweight"], ["heavy", "flyweight", "bantam", "feather"]),
    ("Boxing", "Heavyweight"): (["heavyweight"], ["light"]),
    # Volleyball
    ("Volleyball", "Indoor Men's"): (["volleyball", "men"], ["beach"]),
    ("Volleyball", "Indoor Women's"): (["volleyball", "women"], ["beach"]),
    ("Volleyball", "Beach Volleyball"): (["beach"], []),
    # Water Polo
    ("Water Polo", "Men's Tournament"): (["men"], []),
    ("Water Polo", "Women's Tournament"): (["women"], []),
    # Surfing
    ("Surfing", "Shortboard Men's"): (["men"], []),
    ("Surfing", "Shortboard Women's"): (["women"], []),
    # Skateboarding
    ("Skateboarding", "Street"): (["street"], []),
    ("Skateboarding", "Park"): (["park"], []),
    # Alpine Skiing
    ("Alpine Skiing", "Slalom"): (["slalom"], ["giant", "combined"]),
    ("Alpine Skiing", "Giant Slalom"): (["giant slalom"], []),
    ("Alpine Skiing", "Downhill"): (["downhill"], []),
    # Ice Hockey
    ("Ice Hockey", "Men's Tournament"): (["men"], ["exhibition"]),
    ("Ice Hockey", "Women's Tournament"): (["women"], []),
    # Snowboarding
    ("Snowboarding", "Halfpipe"): (["halfpipe"], []),
    ("Snowboarding", "Slopestyle"): (["slopestyle"], []),
    ("Snowboarding", "Snowboard Cross"): (["cross"], []),
    # Golf
    ("Golf", "Men's Individual"): (["individual", "men"], []),
    ("Golf", "Women's Individual"): (["individual", "women"], []),
    # Tennis
    ("Tennis", "Men's Singles"): (["singles", "men"], []),
    ("Tennis", "Women's Singles"): (["singles", "women"], []),
    ("Tennis", "Mixed Doubles"): (["doubles", "mixed"], []),
    # Archery
    ("Archery", "Individual Recurve"): (["individual"], []),
    ("Archery", "Team Recurve"): (["team"], []),
    # Cycling
    ("Cycling", "Track Sprint"): (["sprint"], ["team", "tandem"]),
    ("Cycling", "Team Pursuit"): (["team pursuit"], []),
    ("Cycling", "Road Race"): (["road race", "individual"], []),
    ("Cycling", "BMX Racing"): (["bmx"], []),
    ("Cycling", "Mountain Bike XC"): (["mountain"], []),
    # Sailing
    ("Sailing", "49er"): (["dinghy"], []),
    ("Sailing", "Laser/ILCA"): (["one person"], []),
    ("Sailing", "Nacra 17 Mixed"): (["keelboat"], []),
    # Figure Skating
    ("Figure Skating", "Men's Singles"): (["singles", "men"], []),
    ("Figure Skating", "Women's Singles"): (["singles", "women"], []),
    ("Figure Skating", "Ice Dance"): (["ice dance"], []),
    ("Figure Skating", "Pairs"): (["pairs"], []),
    # Speed Skating
    ("Speed Skating", "500m"): (["500"], []),
    ("Speed Skating", "1500m"): (["1,500"], []),
    ("Speed Skating", "5000m"): (["5,000"], []),
    ("Speed Skating", "Short Track 1000m"): (["1,000"], []),
    ("Speed Skating", "Short Track Relay"): (["relay"], []),
    # Judo
    ("Judo", "73kg"): (["men"], ["women", "extra"]),
    ("Judo", "57kg Women's"): (["women"], []),
    ("Judo", "100kg+"): (["heavyweight"], []),
    # Triathlon
    ("Triathlon", "Individual"): (["olympic"], []),
    ("Triathlon", "Mixed Relay"): (["relay"], []),
    # Weightlifting
    ("Weightlifting", "61kg"): (["lightweight"], []),
    ("Weightlifting", "81kg"): (["middleweight"], ["heavy"]),
    ("Weightlifting", "109kg+"): (["heavyweight"], []),
    # Baseball & Softball (separate sports)
    ("Baseball", "Tournament"): (["baseball"], []),
    ("Softball", "Tournament"): (["softball"], []),
    # Rugby Sevens
    ("Rugby Sevens", "Men's Tournament"): (["men"], []),
    ("Rugby Sevens", "Women's Tournament"): (["women"], []),
    # Sport Climbing
    ("Sport Climbing", "Lead"): (["boulder and lead"], []),
    ("Sport Climbing", "Bouldering"): (["combined"], []),
    ("Sport Climbing", "Speed"): (["speed"], []),
    # Table Tennis
    ("Table Tennis", "Men's Singles"): (["singles", "men"], []),
    ("Table Tennis", "Women's Singles"): (["singles", "women"], []),
    ("Table Tennis", "Team Event"): (["team"], []),
    # Equestrian
    ("Equestrian", "Eventing Individual"): (["individual"], []),
    ("Equestrian", "Jumping Team"): (["team"], []),
    ("Equestrian", "Dressage Individual"): (["dressage"], []),
    # Freestyle Skiing
    ("Freestyle Skiing", "Moguls"): (["moguls"], []),
    ("Freestyle Skiing", "Aerials"): (["aerials"], []),
    ("Freestyle Skiing", "Ski Cross"): (["cross"], []),
    ("Freestyle Skiing", "Halfpipe"): (["halfpipe"], []),
    # Canoe / Kayak
    ("Canoe / Kayak", "Sprint K-1 1000m"): (["kayak singles", "1,000"], []),
    ("Canoe / Kayak", "Sprint C-2 500m"): (["doubles"], []),
    ("Canoe / Kayak", "Slalom K-1"): (["slalom"], []),
    # Taekwondo
    ("Taekwondo", "68kg"): (["men"], ["women"]),
    ("Taekwondo", "57kg Women's"): (["women"], []),
    # Modern Pentathlon
    ("Modern Pentathlon", "Individual"): (["individual"], []),
    # Flag Football
    ("Flag Football", "Tournament"): ([], []),

    # ── Paralympic Sports ──
    # Event names aggregate across classifications (S7, T54, LW2, etc.)
    # since per-classification samples are tiny. The Explorer shows these
    # as "top events" in the Sport Detail view.

    # Para Swimming (671 entries, 366 unique events)
    ("Para Swimming", "50m Freestyle"): (["50 m freestyle"], ["medley", "relay"]),
    ("Para Swimming", "100m Freestyle"): (["100 m freestyle"], ["medley", "relay"]),
    ("Para Swimming", "400m Freestyle"): (["400 m freestyle"], ["medley", "relay"]),
    ("Para Swimming", "100m Backstroke"): (["100 m backstroke"], []),
    ("Para Swimming", "100m Breaststroke"): (["100 m breaststroke"], []),
    ("Para Swimming", "100m Butterfly"): (["100 m butterfly"], []),
    ("Para Swimming", "Individual Medley"): (["medley"], ["relay"]),

    # Para Track & Field (1090 entries, 635 unique events)
    ("Para Track & Field", "100m T54 Wheelchair"): (["100 m t54"], []),
    ("Para Track & Field", "400m T54 Wheelchair"): (["400 m t54"], []),
    ("Para Track & Field", "5000m T54 Wheelchair"): (["5000 m t54"], []),
    ("Para Track & Field", "Marathon T54 Wheelchair"): (["marathon t54"], []),
    ("Para Track & Field", "Shot Put"): (["shot put"], []),
    ("Para Track & Field", "Discus Throw"): (["discus"], []),
    ("Para Track & Field", "Long Jump"): (["long jump"], []),
    ("Para Track & Field", "Pentathlon"): (["pentathlon"], []),

    # Para Alpine (258 entries, 126 unique events)
    ("Para Alpine", "Downhill"): (["downhill"], []),
    ("Para Alpine", "Slalom"): (["slalom"], ["giant", "super"]),
    ("Para Alpine", "Giant Slalom"): (["giant slalom"], []),
    ("Para Alpine", "Super-G"): (["super"], []),

    # Para Nordic (46 entries, 39 unique events — thin data, each event ~1/year)
    ("Para Nordic", "Sitting Events"): (["sitting"], []),
    ("Para Nordic", "Visually Impaired"): (["vi"], ["sitting"]),
    ("Para Nordic", "Standing Events"): (["standing"], ["sitting"]),

    # Para Cycling (75 entries, 62 unique events — thin data)
    ("Para Cycling", "Time Trial"): (["time trial"], []),
    ("Para Cycling", "Road Race"): (["road race"], []),
    ("Para Cycling", "Individual Pursuit"): (["pursuit"], []),

    # Para Archery (34 entries, 25 unique events)
    ("Para Archery", "Individual"): (["individual"], ["team"]),
    ("Para Archery", "Individual Compound"): (["individual compound"], []),
    ("Para Archery", "Columbia Round"): (["columbia"], []),

    # Para Powerlifting (14 entries, 8 unique events)
    ("Para Powerlifting", "+100 kg"): (["+100"], []),
    ("Para Powerlifting", "-75 kg"): (["-75"], []),
    ("Para Powerlifting", "-82.5 kg"): (["-82"], []),
    ("Para Powerlifting", "-52 kg"): (["-52"], []),

    # Para Triathlon (9 entries, 6 unique events — very thin)
    ("Para Triathlon", "PTS5 / PT2"): (["pt2"], []),
    ("Para Triathlon", "PTVI"): (["ptvi"], []),

    # Wheelchair Tennis (8 entries, 3 unique events)
    ("Wheelchair Tennis", "Men's Singles"): (["men's singles"], ["quad"]),
    ("Wheelchair Tennis", "Quad Singles"): (["quad"], []),
}


def main():
    # ── Step 1: Load results ──
    results = []
    with open(RESULTS_FILE, "r") as f:
        for row in csv.DictReader(f):
            results.append(row)
    print(f"Loaded {len(results):,} result rows")

    # ── Step 2: Deduplicate team events ──
    # For each (games_year, games_type, sport, event), keep the best medal.
    # games_type is in the key to prevent Paralympic events from polluting
    # Olympic sport aggregations (e.g. Para Athletics vs Olympic Athletics).
    RANK = {"Gold": 3, "Silver": 2, "Bronze": 1, "": 0}
    games_events = {}
    for r in results:
        gt = r.get("games_type", "").strip()
        key = (r["games_year"], gt, r["sport"], r["event"])
        medal = r.get("medal", "").strip()
        if key not in games_events or RANK.get(medal, 0) > RANK.get(games_events[key], 0):
            games_events[key] = medal

    print(f"Deduplicated to {len(games_events):,} unique (year, type, sport, event) entries")

    # ── Step 3: Aggregate by (mapped_sport, event_name) ──
    event_data = defaultdict(lambda: defaultdict(lambda: {"n": 0, "g": 0, "s": 0, "b": 0}))
    for (year, gt, sport, event), medal in games_events.items():
        mapped = map_sport(sport, gt)
        if not mapped:
            continue
        d = event_data[mapped][event]
        d["n"] += 1
        if medal == "Gold":
            d["g"] += 1
        elif medal == "Silver":
            d["s"] += 1
        elif medal == "Bronze":
            d["b"] += 1

    # ── Step 4: Compute rates for each move ──
    output = {}
    no_data = []

    # Paralympic events rarely repeat across Games (classifications change),
    # so per-event singletons are the norm. Skip the n>=2 threshold for them.
    def is_para(s):
        return s.startswith("Para ") or s.startswith("Wheelchair") or s in ("Sled Hockey", "Sitting Volleyball", "Goalball")

    for (sport, move_name), (keywords, exclude) in MOVE_EVENT_MAP.items():
        # Find matching events
        matched = []
        min_n = 1 if is_para(sport) else 2
        for ev, d in event_data.get(sport, {}).items():
            ev_lower = ev.lower()
            if all(k.lower() in ev_lower for k in keywords):
                if exclude and any(x.lower() in ev_lower for x in exclude):
                    continue
                if d["n"] >= min_n:
                    matched.append(d)

        if matched:
            total_n = sum(m["n"] for m in matched)
            total_g = sum(m["g"] for m in matched)
            total_s = sum(m["s"] for m in matched)
            total_b = sum(m["b"] for m in matched)
            rates = {
                "gold": round(total_g / total_n, 2),
                "silver": round(total_s / total_n, 2),
                "bronze": round(total_b / total_n, 2),
                "sample_size": total_n,
                "events_matched": len(matched),
            }
        else:
            rates = None
            no_data.append((sport, move_name))

        key = f"{sport}|{move_name}"
        output[key] = rates

    # ── Step 5: Save ──
    artifact = {
        "_meta": {
            "description": "Team USA Olympic/Paralympic medal rates per event",
            "method": "Option A: deduplicated team events, rate = medals / Games entered",
            "source": str(RESULTS_FILE),
            "total_results": len(results),
            "total_deduped_entries": len(games_events),
            "moves_computed": sum(1 for v in output.values() if v is not None),
            "moves_no_data": len(no_data),
        },
        "rates": output,
    }

    with open(OUTPUT_FILE, "w") as f:
        json.dump(artifact, f, indent=2)

    print(f"\nSaved to {OUTPUT_FILE}")
    print(f"  Moves with data: {sum(1 for v in output.values() if v is not None)}")
    print(f"  Moves without data: {len(no_data)}")
    if no_data:
        print(f"  No data for:")
        for sport, move in no_data:
            print(f"    {sport} / {move}")


if __name__ == "__main__":
    main()
