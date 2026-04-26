#!/usr/bin/env python3
"""Scrape all USA Paralympic event results from paralympic.org."""

import csv
import json
import os
import re
import ssl
import time
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

BASE_URL = "https://www.paralympic.org"
DELAY_SECONDS = 2.0
MAX_RETRIES = 5
OUTPUT_CSV = "data/paralympic_results.csv"
OUTPUT_JSON = "data/paralympic_results.json"
PROGRESS_FILE = "data/paralympic_results_progress.json"
USA_COUNTRY = "United States of America"

# (slug, year, city, season)
GAMES = [
    # Summer Paralympics
    ("rome-1960", 1960, "Rome", "Summer"),
    ("tokyo-1964", 1964, "Tokyo", "Summer"),
    ("tel-aviv-1968", 1968, "Tel Aviv", "Summer"),
    ("heidelberg-1972", 1972, "Heidelberg", "Summer"),
    ("toronto-1976", 1976, "Toronto", "Summer"),
    ("arnhem-1980", 1980, "Arnhem", "Summer"),
    ("stoke-mandeville-new-york-1984", 1984, "New York/Stoke Mandeville", "Summer"),
    ("seoul-1988", 1988, "Seoul", "Summer"),
    ("barcelona-1992", 1992, "Barcelona", "Summer"),
    ("atlanta-1996", 1996, "Atlanta", "Summer"),
    ("sydney-2000", 2000, "Sydney", "Summer"),
    ("athens-2004", 2004, "Athens", "Summer"),
    ("beijing-2008", 2008, "Beijing", "Summer"),
    ("london-2012", 2012, "London", "Summer"),
    ("rio-2016", 2016, "Rio de Janeiro", "Summer"),
    ("tokyo-2020", 2020, "Tokyo", "Summer"),
    ("paris-2024", 2024, "Paris", "Summer"),
    # Winter Paralympics
    ("ornskoldsvik-1976", 1976, "Ornskoldsvik", "Winter"),
    ("geilo-1980", 1980, "Geilo", "Winter"),
    ("innsbruck-1984", 1984, "Innsbruck", "Winter"),
    ("innsbruck-1988", 1988, "Innsbruck", "Winter"),
    ("tignes-albertville-1992", 1992, "Albertville", "Winter"),
    ("lillehammer-1994", 1994, "Lillehammer", "Winter"),
    ("nagano-1998", 1998, "Nagano", "Winter"),
    ("salt-lake-city-2002", 2002, "Salt Lake City", "Winter"),
    ("torino-2006", 2006, "Turin", "Winter"),
    ("vancouver-2010", 2010, "Vancouver", "Winter"),
    ("sochi-2014", 2014, "Sochi", "Winter"),
    ("pyeongchang-2018", 2018, "PyeongChang", "Winter"),
    ("beijing-2022", 2022, "Beijing", "Winter"),
    ("milano-cortina-2026", 2026, "Milano-Cortina", "Winter"),
]

CSV_COLUMNS = [
    "games_year", "games_city", "games_season", "games_label",
    "sport", "event", "medal", "country", "athlete_name", "athlete_url",
]


def make_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def fetch_url(url):
    ctx = make_ssl_context()
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; TeamUSA-Scraper/1.0)"})
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with urlopen(req, timeout=30, context=ctx) as resp:
                return resp.read().decode("utf-8")
        except (URLError, HTTPError, TimeoutError, ConnectionError, OSError) as e:
            wait = 3 * (2 ** (attempt - 1))
            print(f"    Attempt {attempt}/{MAX_RETRIES} failed: {e} — waiting {wait}s")
            if attempt < MAX_RETRIES:
                time.sleep(wait)
    return None


def discover_sports(slug):
    """Fetch the results index page and extract sport URLs."""
    url = f"{BASE_URL}/{slug}/results"
    html = fetch_url(url)
    if not html:
        return []
    # Find sport links: /{slug}/results/{sport-name}
    # Exclude meta pages like participants, multimedallists, medalstandings
    meta_pages = {"participants", "multimedallists", "medalstandings"}
    pattern = rf'href="/{re.escape(slug)}/results/([a-z0-9-]+)"'
    matches = re.findall(pattern, html)
    sports = []
    seen = set()
    for m in matches:
        if m not in meta_pages and m not in seen:
            seen.add(m)
            sports.append(m)
    return sports


class MedallistParser(HTMLParser):
    """Parse event medal results from a Paralympic sport results page."""

    def __init__(self):
        super().__init__()
        self.results = []
        self.in_td = False
        self.td_class = ""
        self.td_data_label = ""
        self.current_event = ""
        self.current_medal = ""
        self.current_country = ""
        self.current_athlete = ""
        self.current_athlete_url = ""
        self.in_event_link = False
        self.in_flag_link = False
        self.in_medallist_link = False
        self.in_medallist_span = False
        self.event_text = ""
        self.a_href = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get("class", "")

        if tag == "td":
            self.in_td = True
            self.td_class = cls
            self.td_data_label = attrs_dict.get("data-label", "")
            if self.td_data_label in ("Gold", "Silver", "Bronze"):
                self.current_medal = self.td_data_label
                self.current_country = ""
                self.current_athlete = ""
                self.current_athlete_url = ""
        elif tag == "a" and self.in_td:
            href = attrs_dict.get("href", "")
            self.a_href = href
            if "event-link" in cls:
                self.in_event_link = True
                self.event_text = ""
            elif "medallist-flag-link" in cls:
                self.in_flag_link = True
                self.current_country = attrs_dict.get("title", "")
            elif "medallist-link" in cls:
                self.in_medallist_link = True
                self.current_athlete = ""
                self.current_athlete_url = BASE_URL + href if href else ""
        elif tag == "span" and self.in_medallist_link:
            self.in_medallist_span = True

    def handle_endtag(self, tag):
        if tag == "td" and self.in_td:
            if self.td_data_label in ("Gold", "Silver", "Bronze") and self.current_country:
                self.results.append({
                    "event": self.current_event,
                    "medal": self.current_medal,
                    "country": self.current_country,
                    "athlete_name": self.current_athlete.strip(),
                    "athlete_url": self.current_athlete_url,
                })
            self.in_td = False
        elif tag == "a":
            if self.in_event_link:
                self.current_event = self.event_text.strip()
                self.in_event_link = False
            elif self.in_flag_link:
                self.in_flag_link = False
            elif self.in_medallist_link:
                self.in_medallist_link = False
        elif tag == "span" and self.in_medallist_span:
            self.in_medallist_span = False

    def handle_data(self, data):
        if self.in_event_link:
            self.event_text += data
        elif self.in_medallist_span or self.in_medallist_link:
            self.current_athlete += data

    def handle_entityref(self, name):
        char = {"amp": "&", "lt": "<", "gt": ">", "quot": '"', "apos": "'", "#39": "'"}.get(name, "")
        if self.in_event_link:
            self.event_text += char
        elif self.in_medallist_span or self.in_medallist_link:
            self.current_athlete += char

    def handle_charref(self, name):
        try:
            char = chr(int(name))
        except ValueError:
            char = ""
        if self.in_event_link:
            self.event_text += char
        elif self.in_medallist_span or self.in_medallist_link:
            self.current_athlete += char


def scrape_sport(slug, sport_slug):
    """Scrape medal results for one sport at one Games. Return USA results only."""
    url = f"{BASE_URL}/{slug}/results/{sport_slug}"
    html = fetch_url(url)
    if not html:
        return []

    parser = MedallistParser()
    parser.feed(html)

    # Filter for USA
    usa_results = [r for r in parser.results if r["country"] == USA_COUNTRY]
    return usa_results


def main():
    # Load progress
    all_rows = []
    done_keys = set()
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r") as f:
            progress = json.load(f)
        all_rows = progress["rows"]
        done_keys = set(progress["done_keys"])
        print(f"Resuming: {len(done_keys)} Games already done, {len(all_rows)} rows so far")

    sorted_games = sorted(GAMES, key=lambda g: (g[1], g[3]))

    for i, (slug, year, city, season) in enumerate(sorted_games, 1):
        if slug in done_keys:
            print(f"[{i}/{len(sorted_games)}] Skipping {year} {season} Paralympics ({city}) — already done")
            continue

        print(f"[{i}/{len(sorted_games)}] {year} {season} Paralympics ({city})")

        # Discover sports
        sports = discover_sports(slug)
        print(f"  Found {len(sports)} sports: {', '.join(sports)}")
        time.sleep(DELAY_SECONDS)

        games_label = f"{year} {season} Paralympics ({city})"
        games_rows = []

        for j, sport_slug in enumerate(sports, 1):
            sport_name = sport_slug.replace("-", " ").title()
            print(f"  [{j}/{len(sports)}] {sport_name}...", end=" ", flush=True)
            results = scrape_sport(slug, sport_slug)
            for r in results:
                games_rows.append({
                    "games_year": year,
                    "games_city": city,
                    "games_season": season,
                    "games_label": games_label,
                    "sport": sport_name,
                    "event": r["event"],
                    "medal": r["medal"],
                    "country": r["country"],
                    "athlete_name": r["athlete_name"],
                    "athlete_url": r["athlete_url"],
                })
            print(f"{len(results)} USA medals")
            time.sleep(DELAY_SECONDS)

        all_rows.extend(games_rows)
        done_keys.add(slug)
        print(f"  → {len(games_rows)} USA medal entries for this Games")

        # Save progress
        with open(PROGRESS_FILE, "w") as f:
            json.dump({"rows": all_rows, "done_keys": list(done_keys)}, f)

    print(f"\nTotal: {len(all_rows)} USA Paralympic medal entries across {len(sorted_games)} Games")

    # Save JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_rows, f, ensure_ascii=False, indent=2)
    print(f"Saved {OUTPUT_JSON}")

    # Save CSV
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(all_rows)
    print(f"Saved {OUTPUT_CSV} ({len(all_rows)} rows)")

    if os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)
        print("Removed progress file")


if __name__ == "__main__":
    main()
