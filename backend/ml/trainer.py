import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

def detect_problem_type(y: pd.Series) -> str:
    """
    Determine whether the target represents a classification
    or regression problem.
    """

    unique_values = y.nunique(dropna=True)

    if (
        y.dtype == "object"
        or str(y.dtype) == "category"
        or y.dtype == "bool"
        or unique_values <= 20
    ):
        return "classification"

    return "regression"

def build_preprocessor(X: pd.DataFrame):
    numeric_columns = X.select_dtypes(include=np.number).columns.tolist()

    categorical_columns = X.select_dtypes(
        exclude=np.number
    ).columns.tolist()

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median"))
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(
                    strategy="most_frequent"
                ),
            ),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, numeric_columns),
            (
                "categorical",
                categorical_pipeline,
                categorical_columns,
            ),
        ]
    )

    return preprocessor

def train_model(df: pd.DataFrame, target_column: str) -> dict:

    if target_column not in df.columns:
        raise ValueError(
            f"Target column '{target_column}' does not exist."
        )

    data = df.dropna(subset=[target_column]).copy()

    if len(data) < 10:
        raise ValueError(
            "Dataset is too small to train a model."
        )

    X = data.drop(columns=[target_column])
    y = data[target_column]

    if X.shape[1] == 0:
        raise ValueError(
            "No feature columns are available for training."
        )

    problem_type = detect_problem_type(y)

    preprocessor = build_preprocessor(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    if problem_type == "classification":

        model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
        )

    else:

        model = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
        )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

    if problem_type == "classification":

        metrics = {
            "accuracy": round(
                accuracy_score(y_test, predictions), 4
            ),
            "precision": round(
                precision_score(
                    y_test,
                    predictions,
                    average="weighted",
                    zero_division=0,
                ),
                4,
            ),
            "recall": round(
                recall_score(
                    y_test,
                    predictions,
                    average="weighted",
                    zero_division=0,
                ),
                4,
            ),
            "f1_score": round(
                f1_score(
                    y_test,
                    predictions,
                    average="weighted",
                    zero_division=0,
                ),
                4,
            ),
        }

    else:

        rmse = np.sqrt(
            mean_squared_error(y_test, predictions)
        )

        metrics = {
            "mae": round(
                mean_absolute_error(y_test, predictions), 4
            ),
            "rmse": round(rmse, 4),
            "r2": round(
                r2_score(y_test, predictions), 4
            ),
        }
    
    return {
        "problem_type": problem_type,
        "target_column": target_column,
        "training_rows": len(X_train),
        "testing_rows": len(X_test),
        "feature_count": X.shape[1],
        "model": type(model).__name__,
        "metrics": metrics,
    }