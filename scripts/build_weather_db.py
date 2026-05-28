import csv
import json
import math
import re
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "weather.db"
JSON_PATH = DATA_DIR / "forecast_county_data.json"

COUNTIES = [
    (1, "Mombasa", -4.05, 39.67), (2, "Kwale", -4.18, 39.45), (3, "Kilifi", -3.51, 39.85),
    (4, "Tana River", -1.80, 40.10), (5, "Lamu", -2.27, 40.90), (6, "Taita-Taveta", -3.40, 38.35),
    (7, "Garissa", -0.45, 39.65), (8, "Wajir", 1.75, 40.05), (9, "Mandera", 3.94, 41.87),
    (10, "Marsabit", 2.34, 37.99), (11, "Isiolo", 0.35, 38.48), (12, "Meru", 0.05, 37.65),
    (13, "Tharaka-Nithi", -0.30, 37.92), (14, "Embu", -0.54, 37.46), (15, "Kitui", -1.37, 38.01),
    (16, "Machakos", -1.52, 37.26), (17, "Makueni", -1.80, 37.62), (18, "Nyandarua", -0.18, 36.52),
    (19, "Nyeri", -0.42, 37.05), (20, "Kirinyaga", -0.51, 37.27), (21, "Murang'a", -0.72, 37.15),
    (22, "Kiambu", -1.03, 36.83), (23, "Turkana", 3.11, 35.57), (24, "West Pokot", 1.62, 35.10),
    (25, "Samburu", 1.21, 36.98), (26, "Trans-Nzoia", 1.05, 35.00), (27, "Uasin Gishu", 0.55, 35.27),
    (28, "Elgeyo-Marakwet", 0.73, 35.51), (29, "Nandi", 0.18, 35.12), (30, "Baringo", 0.67, 36.10),
    (31, "Laikipia", 0.36, 36.78), (32, "Nakuru", -0.30, 35.93), (33, "Narok", -1.08, 35.87),
    (34, "Kajiado", -1.85, 36.78), (35, "Kericho", -0.37, 35.28), (36, "Bomet", -0.78, 35.35),
    (37, "Kakamega", 0.28, 34.75), (38, "Vihiga", 0.08, 34.73), (39, "Bungoma", 0.57, 34.56),
    (40, "Busia", 0.46, 34.11), (41, "Siaya", -0.06, 34.29), (42, "Kisumu", -0.10, 34.76),
    (43, "Homa Bay", -0.52, 34.46), (44, "Migori", -1.06, 34.47), (45, "Kisii", -0.68, 34.77),
    (46, "Nyamira", -0.57, 34.93), (47, "Nairobi", -1.29, 36.82),
]


def nearest_county(lat, lon):
    return min(COUNTIES, key=lambda c: (c[2] - lat) ** 2 + (c[3] - lon) ** 2)


def parse_forecast_name(path):
    match = re.match(r"^(\d{8})_to_(\d{8})_fcst\.csv$", path.name)
    if not match:
        return None
    return match.group(1), match.group(2)


def create_schema(conn):
    conn.executescript(
        """
        DROP TABLE IF EXISTS county_forecast;
        DROP TABLE IF EXISTS forecast_period;
        DROP TABLE IF EXISTS county;

        CREATE TABLE county (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          lat REAL NOT NULL,
          lon REAL NOT NULL
        );

        CREATE TABLE forecast_period (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file TEXT NOT NULL UNIQUE,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL
        );

        CREATE TABLE county_forecast (
          period_id INTEGER NOT NULL,
          county_id INTEGER NOT NULL,
          point_count INTEGER NOT NULL,
          rain REAL NOT NULL,
          tmin REAL NOT NULL,
          tmax REAL NOT NULL,
          wind REAL,
          wind_dir REAL,
          PRIMARY KEY (period_id, county_id),
          FOREIGN KEY (period_id) REFERENCES forecast_period(id),
          FOREIGN KEY (county_id) REFERENCES county(id)
        );
        """
    )
    conn.executemany("INSERT INTO county(id,name,lat,lon) VALUES(?,?,?,?)", COUNTIES)


def avg(values):
    return sum(values) / len(values) if values else None


def ingest_csv(conn, path):
    dates = parse_forecast_name(path)
    if not dates:
        return None

    start, end = dates
    cur = conn.execute(
        "INSERT INTO forecast_period(file,start_date,end_date) VALUES(?,?,?)",
        (path.name, start, end),
    )
    period_id = cur.lastrowid

    buckets = {county[0]: {"rain": [], "tmin": [], "tmax": [], "wind": [], "wind_dir": []} for county in COUNTIES}
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        field_map = {name.lower().strip(): name for name in (reader.fieldnames or [])}
        for row in reader:
            try:
                lon = float(row[field_map["lon"]])
                lat = float(row[field_map["lat"]])
                rain = float(row[field_map["rain"]])
            except (KeyError, TypeError, ValueError):
                continue

            county_id = nearest_county(lat, lon)[0]
            bucket = buckets[county_id]
            bucket["rain"].append(rain)
            for key in ("tmin", "tmax", "wind", "wind_dir"):
                source = field_map.get(key)
                if not source:
                    continue
                try:
                    value = float(row[source])
                except (TypeError, ValueError):
                    continue
                if math.isfinite(value):
                    bucket[key].append(value)

    rows = []
    for county_id, bucket in buckets.items():
        rows.append(
            (
                period_id,
                county_id,
                len(bucket["rain"]),
                round(avg(bucket["rain"]) or 0, 2),
                round(avg(bucket["tmin"]) or 0, 2),
                round(avg(bucket["tmax"]) or 0, 2),
                round(avg(bucket["wind"]) or 0, 2) if bucket["wind"] else None,
                round(avg(bucket["wind_dir"]) or 0, 2) if bucket["wind_dir"] else None,
            )
        )

    conn.executemany(
        """
        INSERT INTO county_forecast(period_id,county_id,point_count,rain,tmin,tmax,wind,wind_dir)
        VALUES(?,?,?,?,?,?,?,?)
        """,
        rows,
    )
    return period_id


def export_json(conn):
    payload = {"periods": []}
    periods = conn.execute(
        "SELECT id,file,start_date,end_date FROM forecast_period ORDER BY start_date"
    ).fetchall()
    for period_id, file, start, end in periods:
        counties = {}
        rows = conn.execute(
            """
            SELECT county_id,point_count,rain,tmin,tmax,wind,wind_dir
            FROM county_forecast
            WHERE period_id=?
            ORDER BY county_id
            """,
            (period_id,),
        ).fetchall()
        for county_id, point_count, rain, tmin, tmax, wind, wind_dir in rows:
            counties[str(county_id)] = {
                "rain": rain,
                "tmin": tmin,
                "tmax": tmax,
                "wind": wind,
                "wind_dir": wind_dir,
                "point_count": point_count,
            }
        payload["periods"].append(
            {"file": file, "start": start, "end": end, "counties": counties}
        )

    JSON_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main():
    DATA_DIR.mkdir(exist_ok=True)
    if DB_PATH.exists():
        DB_PATH.unlink()
    conn = sqlite3.connect(DB_PATH)
    try:
        create_schema(conn)
        files = sorted(DATA_DIR.glob("*_to_*_fcst.csv"))
        for path in files:
            ingest_csv(conn, path)
        conn.commit()
        export_json(conn)
    finally:
        conn.close()
    print(f"Built {DB_PATH}")
    print(f"Wrote {JSON_PATH}")
    print(f"Forecast CSV files processed: {len(files)}")


if __name__ == "__main__":
    main()
