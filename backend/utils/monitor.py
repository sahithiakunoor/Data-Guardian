import pandas as pd
import numpy as np

def validate_data(df: pd.DataFrame) -> dict:
    """
    Generic validation for any dataset:
    - missing values
    - constant columns
    - numeric outliers (Z-score)
    - datatype summary
    """
    report = {"missing_values": {}, "constant_columns": [], "anomalies": {}, "datatypes": {}}

    # ✅ Missing values
    for col in df.columns:
        missing = df[col].isna().sum()
        if missing > 0:
            report["missing_values"][col] = int(missing)

    # ✅ Constant columns
    for col in df.columns:
        if df[col].nunique(dropna=True) <= 1:
            report["constant_columns"].append(col)

    # ✅ Datatype summary
    for col in df.columns:
        report["datatypes"][col] = str(df[col].dtype)

    # ✅ Anomaly detection (Z-score > 3 for numeric columns)
    numeric_cols = df.select_dtypes(include=np.number).columns
    for col in numeric_cols:
        mean, std = df[col].mean(), df[col].std()
        if std == 0 or pd.isna(std):
            continue
        z_scores = np.abs((df[col] - mean) / std)
        anomalies = df[z_scores > 3]
        if not anomalies.empty:
            report["anomalies"][col] = len(anomalies)

    return report


def print_validation_report(report: dict):
    """
    Nicely prints the generic validation report.
    """
    print("\n🧾 Data Validation Report")
    print("-" * 50)

    if not any([report["missing_values"], report["constant_columns"], report["anomalies"]]):
        print("✅ No major issues detected!")
        return

    if report["missing_values"]:
        print("\n⚠️ Missing Values:")
        for k, v in report["missing_values"].items():
            print(f"  - {k}: {v} missing")

    if report["constant_columns"]:
        print("\nℹ️ Constant Columns:")
        for c in report["constant_columns"]:
            print(f"  - {c}")

    if report["anomalies"]:
        print("\n📉 Numeric Anomalies:")
        for k, v in report["anomalies"].items():
            print(f"  - {k}: {v} outliers detected")

    print("\n🧬 Column Types:")
    for k, v in report["datatypes"].items():
        print(f"  - {k}: {v}")
