#!/usr/bin/env python3
"""Scrape all USA Olympic event results from Olympedia.org."""

import csv
import json
import re
import ssl
import time
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

BASE_URL = "https://www.olympedia.org/countries/USA/editions"
DELAY_SECONDS = 3.0
MAX_RETRIES = 5
OUTPUT_CSV = "data/olympic_results.csv"
OUTPUT_JSON = "data/olympic_results.json"

# Edition ID -> (year, city, season)
EDITIONS = {
    # Summer
    1: (1896, "Athens", "Summer"),
    2: (1900, "Paris", "Summer"),
    3: (1904, "St. Louis", "Summer"),
    5: (1908, "London", "Summer"),
    6: (1912, "Stockholm", "Summer"),
    7: (1920, "Antwerp", "Summer"),
    8: (1924, "Paris", "Summer"),
    9: (1928, "Amsterdam", "Summer"),
    10: (1932, "Los Angeles", "Summer"),
    11: (1936, "Berlin", "Summer"),
    12: (1948, "London", "Summer"),
    13: (1952, "Helsinki", "Summer"),
    14: (1956, "Melbourne", "Summer"),
    15: (1960, "Rome", "Summer"),
    16: (1964, "Tokyo", "Summer"),
    17: (1968, "Mexico City", "Summer"),
    18: (1972, "Munich", "Summer"),
    19: (1976, "Montreal", "Summer"),
    20: (1980, "Moscow", "Summer"),
    21: (1984, "Los Angeles", "Summer"),
    22: (1988, "Seoul", "Summer"),
    23: (1992, "Barcelona", "Summer"),
    24: (1996, "Atlanta", "Summer"),
    25: (2000, "Sydney", "Summer"),
    26: (2004, "Athens", "Summer"),
    53: (2008, "Beijing", "Summer"),
    54: (2012, "London", "Summer"),
    59: (2016, "Rio de Janeiro", "Summer"),
    61: (2020, "Tokyo", "Summer"),
    63: (2024, "Paris", "Summer"),
    # Winter
    29: (1924, "Chamonix", "Winter"),
    30: (1928, "St. Moritz", "Winter"),
    31: (1932, "Lake Placid", "Winter"),
    32: (1936, "Garmisch-Partenkirchen", "Winter"),
    33: (1948, "St. Moritz", "Winter"),
    34: (1952, "Oslo", "Winter"),
    35: (1956, "Cortina d'Ampezzo", "Winter"),
    36: (1960, "Squaw Valley", "Winter"),
    37: (1964, "Innsbruck", "Winter"),
    38: (1968, "Grenoble", "Winter"),
    39: (1972, "Sapporo", "Winter"),
    40: (1976, "Innsbruck", "Winter"),
    41: (1980, "Lake Placid", "Winter"),
    42: (1984, "Sarajevo", "Winter"),
    43: (1988, "Calgary", "Winter"),
    44: (1992, "Albertville", "Winter"),
    45: (1994, "Lillehammer", "Winter"),
    46: (1998, "Nagano", "Winter"),
    47: (2002, "Salt Lake City", "Winter"),
    49: (2006, "Turin", "Winter"),
    57: (2010, "Vancouver", "Winter"),
    58: (2014, "Sochi", "Winter"),
    60: (2018, "PyeongChang", "Winter"),
    62: (2022, "Beijing", "Winter"),
    72: (2026, "Milano-Cortina", "Winter"),
}

CSV_COLUMNS = [
    "games_year", "games_city", "games_season", "games_label",
    "sport", "event", "athlete_name", "athlete_url", "placement", "medal",
    "team_name", "team_members",
]


class OlympediaParser(HTMLParser):
    """Parse the results table from an Olympedia country/edition page."""

    def __init__(self):
        super().__init__()
        self.results = []
        self.in_table = False
        self.in_tr = False
        self.in_td = False
        self.in_h2 = False
        self.in_a = False
        self.in_span = False
        self.td_index = 0
        self.current_sport = ""
        self.current_event = ""
        self.current_row = {}
        self.td_content = ""
        self.a_href = ""
        self.a_text = ""
        self.span_class = ""
        self.span_text = ""
        self.td_colspan = 0
        self.collecting_team_members = False
        self.team_member_names = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "table" and "table" in attrs_dict.get("class", ""):
            self.in_table = True
        elif self.in_table:
            if tag == "tr":
                self.in_tr = True
                self.td_index = 0
                self.current_row = {}
                self.collecting_team_members = False
                self.team_member_names = []
            elif tag == "td" and self.in_tr:
                self.in_td = True
                self.td_content = ""
                self.td_colspan = int(attrs_dict.get("colspan", "0"))
                self.a_href = ""
                self.a_text = ""
                self.span_class = ""
                self.span_text = ""
            elif tag == "h2" and self.in_td:
                self.in_h2 = True
            elif tag == "a" and self.in_td:
                self.in_a = True
                self.a_href = attrs_dict.get("href", "")
                self.a_text = ""
            elif tag == "span" and self.in_td:
                self.in_span = True
                self.span_class = attrs_dict.get("class", "")
                self.span_text = ""

    def handle_endtag(self, tag):
        if tag == "table" and self.in_table:
            self.in_table = False
        elif self.in_table:
            if tag == "tr" and self.in_tr:
                self._process_row()
                self.in_tr = False
            elif tag == "td" and self.in_td:
                self._process_td()
                self.td_index += 1
                self.in_td = False
            elif tag == "h2":
                self.in_h2 = False
            elif tag == "a" and self.in_a:
                self.in_a = False
            elif tag == "span" and self.in_span:
                self.in_span = False

    def handle_data(self, data):
        if self.in_h2:
            self.current_sport = data.strip()
        elif self.in_a:
            self.a_text += data
        elif self.in_span:
            self.span_text += data
        elif self.in_td:
            self.td_content += data

    def handle_entityref(self, name):
        char = {"amp": "&", "lt": "<", "gt": ">", "quot": '"', "apos": "'", "#39": "'"}.get(name, f"&{name};")
        if self.in_a:
            self.a_text += char
        elif self.in_td:
            self.td_content += char

    def handle_charref(self, name):
        try:
            char = chr(int(name))
        except ValueError:
            char = f"&#{name};"
        if self.in_a:
            self.a_text += char
        elif self.in_td:
            self.td_content += char

    def _process_td(self):
        if self.td_colspan >= 3:
            # Team members row: contains athlete links separated by bullets
            self.collecting_team_members = True
            self.team_member_names.append(self.a_text.strip())
            return

        if self.td_index == 0:
            # First column: event link or empty (continuation)
            if self.a_href and "/results/" in self.a_href:
                self.current_event = self.a_text.strip()
        elif self.td_index == 1:
            # Second column: athlete name/link or team name
            if self.a_href and "/athletes/" in self.a_href:
                self.current_row["athlete_name"] = self.a_text.strip()
                self.current_row["athlete_url"] = "https://www.olympedia.org" + self.a_href
                self.current_row["team_name"] = ""
            else:
                text = (self.a_text or self.td_content).strip()
                if text:
                    self.current_row["team_name"] = text
                    self.current_row["athlete_name"] = ""
                    self.current_row["athlete_url"] = ""
        elif self.td_index == 2:
            # Third column: placement
            self.current_row["placement"] = (self.td_content or self.a_text).strip()
        elif self.td_index == 3:
            # Fourth column: medal
            if self.span_class in ("Gold", "Silver", "Bronze"):
                self.current_row["medal"] = self.span_class
            else:
                self.current_row["medal"] = ""

    def _process_row(self):
        if self.collecting_team_members:
            # This row had colspan=3, it's a team members sub-row
            # Attach to the last result entry
            if self.results:
                members = self.team_member_names
                # Also grab any remaining a_text
                all_members = []
                for m in members:
                    all_members.extend(n.strip() for n in m.split("•") if n.strip())
                if all_members:
                    self.results[-1]["team_members"] = " | ".join(all_members)
            return

        if not self.current_row.get("athlete_name") and not self.current_row.get("team_name"):
            return
        if "placement" not in self.current_row:
            return

        self.current_row["sport"] = self.current_sport
        self.current_row["event"] = self.current_event
        self.current_row.setdefault("medal", "")
        self.current_row.setdefault("team_members", "")
        self.current_row.setdefault("athlete_url", "")
        self.results.append(dict(self.current_row))


def fetch_page(edition_id):
    url = f"{BASE_URL}/{edition_id}"
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; TeamUSA-Scraper/1.0)"})

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with urlopen(req, timeout=30, context=ctx) as resp:
                return resp.read().decode("utf-8")
        except (URLError, HTTPError, TimeoutError) as e:
            wait = 5 * (2 ** (attempt - 1))  # 5, 10, 20, 40, 80 seconds
            print(f"  Attempt {attempt}/{MAX_RETRIES} failed: {e} — waiting {wait}s")
            if attempt < MAX_RETRIES:
                time.sleep(wait)
    raise RuntimeError(f"Failed to fetch edition {edition_id} after {MAX_RETRIES} retries")


def parse_edition(html, year, city, season):
    parser = OlympediaParser()
    parser.feed(html)
    games_label = f"{year} {season} Olympics ({city})"
    rows = []
    for r in parser.results:
        rows.append({
            "games_year": year,
            "games_city": city,
            "games_season": season,
            "games_label": games_label,
            "sport": r["sport"],
            "event": r["event"],
            "athlete_name": r["athlete_name"],
            "athlete_url": r["athlete_url"],
            "placement": r["placement"],
            "medal": r["medal"],
            "team_name": r["team_name"],
            "team_members": r["team_members"],
        })
    return rows


def main():
    import os
    PROGRESS_FILE = "olympic_results_progress.json"

    # Load progress if resuming
    all_rows = []
    done_editions = set()
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r") as f:
            progress = json.load(f)
        all_rows = progress["rows"]
        done_editions = set(progress["done_editions"])
        print(f"Resuming: {len(done_editions)} editions already done, {len(all_rows)} rows so far")

    sorted_editions = sorted(EDITIONS.items(), key=lambda x: (x[1][0], x[1][2]))

    for i, (edition_id, (year, city, season)) in enumerate(sorted_editions, 1):
        if edition_id in done_editions:
            print(f"[{i}/{len(sorted_editions)}] Skipping {year} {season} Olympics ({city}) — already done")
            continue
        print(f"[{i}/{len(sorted_editions)}] Fetching {year} {season} Olympics ({city}) — edition {edition_id}")
        html = fetch_page(edition_id)
        rows = parse_edition(html, year, city, season)
        all_rows.extend(rows)
        done_editions.add(edition_id)
        print(f"  → {len(rows)} result entries")

        # Save progress after each edition
        with open(PROGRESS_FILE, "w") as f:
            json.dump({"rows": all_rows, "done_editions": list(done_editions)}, f)

        if i < len(sorted_editions):
            time.sleep(DELAY_SECONDS)

    print(f"\nTotal: {len(all_rows)} result entries across {len(sorted_editions)} Games")

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

    # Clean up progress file
    if os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)
        print("Removed progress file")


if __name__ == "__main__":
    main()
