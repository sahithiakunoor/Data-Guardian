import pandas as pd
import numpy as np


def prepare_eda_dataframe(df: pd.DataFrame):
    """
    Prepare data for EDA without removing duplicates.

    Returns:
        cleaned_df
        datetime_columns
    """

    df = df.copy()

    # Standardize column names
    df.columns = [
        str(col).strip().lower().replace(" ", "_")
        for col in df.columns
    ]

    # Blank strings -> NaN
    df = df.replace(r"^\s*$", np.nan, regex=True)

    # Convert numeric-looking object columns
    for col in df.columns:
        if df[col].dtype == "object":
            try:
                numeric_version = pd.to_numeric(
                    df[col],
                    errors="raise"
                )

                df[col] = numeric_version

            except (ValueError, TypeError):
                pass

    # --------------------------------
    # Detect datetime-like columns
    # --------------------------------

    datetime_columns = []

    for col in df.columns:

        # Don't try to interpret numeric columns as dates
        if pd.api.types.is_numeric_dtype(df[col]):
            continue

        non_null = df[col].dropna()

        if non_null.empty:
            continue

        column_name = col.lower()

        name_suggests_date = any(
            keyword in column_name
            for keyword in [
                "date",
                "time",
                "timestamp",
                "created",
                "updated"
            ]
        )

        try:
            parsed = pd.to_datetime(
                non_null,
                errors="coerce",
                format="mixed"
            )

            valid_ratio = parsed.notna().mean()

            # Stronger threshold for arbitrary text columns
            threshold = 0.70 if name_suggests_date else 0.90

            if (
                valid_ratio >= threshold
                and parsed.nunique() >= 2
            ):
                df[col] = pd.to_datetime(
                    df[col],
                    errors="coerce",
                    format="mixed"
                )

                datetime_columns.append(col)

        except Exception:
            pass

    return df, datetime_columns


def safe_value(value):
    """
    Converts pandas / numpy values into JSON-safe values.
    """

    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        return float(value)

    if isinstance(value, np.bool_):
        return bool(value)

    return value


def analyze_dataframe(df: pd.DataFrame) -> dict:

    df, datetime_columns = prepare_eda_dataframe(df)

    rows, columns = df.shape

    # ---------------------------
    # Basic dataset information
    # ---------------------------

    total_missing = int(
        df.isna().sum().sum()
    )

    total_cells = rows * columns

    missing_percentage = (
        round(
            (total_missing / total_cells) * 100,
            2
        )
        if total_cells > 0
        else 0
    )

    duplicate_rows = int(
        df.duplicated().sum()
    )

    numeric_columns = (
        df.select_dtypes(include=np.number)
        .columns
        .tolist()
    )

    categorical_columns = [
        col
        for col in df.columns
        if (
            col not in numeric_columns
            and col not in datetime_columns
        )
    ]

    # ---------------------------
    # Missing values
    # ---------------------------

    missing_values = {}

    for col in df.columns:

        count = int(
            df[col].isna().sum()
        )

        if count > 0:
            missing_values[col] = count

    # ---------------------------
    # Numeric statistics
    # ---------------------------

    numeric_statistics = {}

    for col in numeric_columns:

        series = df[col].dropna()

        if series.empty:
            continue

        numeric_statistics[col] = {
            "count": int(series.count()),

            "mean": round(
                float(series.mean()),
                3
            ),

            "median": round(
                float(series.median()),
                3
            ),

            "std": (
                round(
                    float(series.std()),
                    3
                )
                if len(series) > 1
                else 0
            ),

            "min": round(
                float(series.min()),
                3
            ),

            "max": round(
                float(series.max()),
                3
            ),
        }

    # ---------------------------
    # Histogram data
    # ---------------------------

    histograms = {}

    for col in numeric_columns:

        series = df[col].dropna()

        if series.empty:
            continue

        unique_count = series.nunique()

        bin_count = min(
            10,
            max(
                1,
                int(unique_count)
            )
        )

        counts, bin_edges = np.histogram(
            series,
            bins=bin_count
        )

        histogram_data = []

        for i in range(len(counts)):

            start = float(
                bin_edges[i]
            )

            end = float(
                bin_edges[i + 1]
            )

            histogram_data.append({
                "range":
                    f"{start:.2f} - {end:.2f}",

                "count":
                    int(counts[i]),

                "start":
                    round(start, 3),

                "end":
                    round(end, 3),
            })

        histograms[col] = (
            histogram_data
        )

    # ---------------------------
    # Categorical distributions
    # ---------------------------

    categorical_distributions = {}

    for col in categorical_columns:

        counts = (
            df[col]
            .fillna("Missing")
            .astype(str)
            .value_counts()
            .head(10)
        )

        categorical_distributions[col] = [
            {
                "value": str(value),
                "count": int(count)
            }
            for value, count
            in counts.items()
        ]

    # ---------------------------
    # Date / time information
    # ---------------------------

    datetime_summary = {}

    for col in datetime_columns:

        series = df[col].dropna()

        if series.empty:
            continue

        datetime_summary[col] = {
            "min": series.min().isoformat(),
            "max": series.max().isoformat(),
            "unique": int(series.nunique())
        }

    # ---------------------------
    # Correlation matrix
    # ---------------------------

    correlation = {}

    if len(numeric_columns) >= 2:

        corr_df = (
            df[numeric_columns]
            .corr()
        )

        for row_col in corr_df.columns:

            correlation[row_col] = {}

            for column in corr_df.columns:

                value = corr_df.loc[
                    row_col,
                    column
                ]

                correlation[row_col][column] = (
                    round(
                        float(value),
                        3
                    )
                    if not pd.isna(value)
                    else None
                )

    # ---------------------------
    # Dataset preview
    # ---------------------------

    preview_df = df.head(10)

    preview = []

    for _, row in preview_df.iterrows():

        preview_row = {}

        for col in preview_df.columns:

            preview_row[col] = safe_value(
                row[col]
            )

        preview.append(
            preview_row
        )

    return {

        "rows": int(rows),
        "columns": int(columns),

        "total_missing":
            total_missing,

        "missing_percentage":
            missing_percentage,

        "duplicate_rows":
            duplicate_rows,

        "numeric_column_count":
            len(numeric_columns),

        "categorical_column_count":
            len(categorical_columns),

        "datetime_column_count":
            len(datetime_columns),

        "numeric_columns":
            numeric_columns,

        "categorical_columns":
            categorical_columns,

        "datetime_columns":
            datetime_columns,

        "datetime_summary":
            datetime_summary,

        "missing_values":
            missing_values,

        "numeric_statistics":
            numeric_statistics,

        "histograms":
            histograms,

        "categorical_distributions":
            categorical_distributions,

        "correlation":
            correlation,

        "preview":
            preview,
    }