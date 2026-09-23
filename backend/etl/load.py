# backend/etl/load.py
import pandas as pd
from sqlalchemy import create_engine

def load_data(df: pd.DataFrame, table_name="processed_data"):
    """
    Loads transformed data into an SQLite database.
    """
    engine = create_engine("sqlite:///data/dataguardian.db", echo=False)
    df.to_sql(table_name, con=engine, if_exists="replace", index=False)
    print(f"[Load] Loaded {len(df)} records into '{table_name}' table.")
