import pandas as pd
import numpy as np

def transform_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    General-purpose transformation:
    - standardizes column names
    - trims whitespace
    - converts blank/NA tokens to NaN
    - converts numeric-looking columns to float
    - drops duplicates
    """
    print("[Transform] Starting data cleaning...")

    df = df.copy()

    # Standardize column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Convert string blanks → NaN
    df = df.replace(r'^\s*$', np.nan, regex=True)

    # Try to convert columns that look numeric
    for col in df.columns:
        if df[col].dtype == "object":
            try:
                df[col] = pd.to_numeric(df[col])
            except Exception:
                pass  # keep as text if conversion fails

    # Drop duplicates
    df = df.drop_duplicates()

    print(f"[Transform] Cleaned data: {df.shape[0]} rows, {df.shape[1]} columns")
    return df
