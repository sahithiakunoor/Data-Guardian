# backend/etl/extract.py
import pandas as pd

def extract_data(source_path: str) -> pd.DataFrame:
    """
    Extracts data from a given source (CSV for now).
    """
    try:
        data = pd.read_csv(source_path)
        print(f"[Extract] Loaded {len(data)} rows from {source_path}")
        return data
    except Exception as e:
        print(f"[Extract] Error reading source: {e}")
        raise
