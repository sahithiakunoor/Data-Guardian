import os, sqlite3, json, time
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "data", "validation_logs.db")

def init_log_table():
    os.makedirs(os.path.join(BASE_DIR, "..", "data"), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS validation_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            filename TEXT,
            rows INTEGER,
            validation_report TEXT,
            runtime_seconds REAL,
            missing_fixed INTEGER,
            data_quality_score REAL
        )
    """)
    conn.commit()
    conn.close()

def compute_quality_score(report: dict, rows: int) -> float:
    """
    Very simple scoring formula:
        100 - ( (missing + anomalies) / (rows * cols) * 100 )
    bounded between 0 and 100.
    """
    cols = len(report.get("datatypes", {})) or 1
    missing_total = sum(report.get("missing_values", {}).values())
    anomalies_total = sum(report.get("anomalies", {}).values())
    penalty = (missing_total + anomalies_total) / max(1, rows * cols)
    score = round(max(0, 100 * (1 - penalty)), 2)
    return score

def log_validation(
    filename: str,
    rows: int,
    report: dict,
    runtime: float,
    missing_fixed: int = 0
):
    quality_score = compute_quality_score(
        report,
        rows
    )

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO validation_logs
        (
            timestamp,
            filename,
            rows,
            validation_report,
            runtime_seconds,
            missing_fixed,
            data_quality_score
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.now().isoformat(),
        filename,
        rows,
        json.dumps(report, indent=2),
        runtime,
        missing_fixed,
        quality_score
    ))

    conn.commit()
    conn.close()

    print(
        f"[Logger] Logged run for {filename} "
        f"| Quality Score: {quality_score}% ✅"
    )

    return quality_score