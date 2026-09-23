import pandas as pd
import numpy as np

def impute_missing(df: pd.DataFrame) -> pd.DataFrame:
    """
    Automatically fill missing values in a general, data-agnostic way.
    - numeric columns → median
    - categorical/object columns → 'Unknown'
    """
    df = df.copy()

    # Identify numeric and categorical columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    cat_cols = df.select_dtypes(exclude=[np.number]).columns

    # Impute numeric columns
    for col in numeric_cols:
        if df[col].isna().any():
            median_value = df[col].median()
            df[col] = df[col].fillna(median_value)

    # Impute categorical columns
    for col in cat_cols:
        if df[col].isna().any():
            df[col] = df[col].fillna("Unknown")

    print("[Impute] Missing values handled automatically.")
    return df
