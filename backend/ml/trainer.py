import pandas as pd
import numpy as np
import mlflow

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

from sklearn.linear_model import (
    LogisticRegression,
    LinearRegression,
)
def detect_problem_type(y: pd.Series) -> str:
    """
    Infer whether the target is classification or regression.

    Rules:
    - text/category/bool -> classification
    - continuous floating-point values -> regression
    - low-cardinality integer-like numeric values -> classification
    - otherwise numeric -> regression
    """

    clean_y = y.dropna()

    if clean_y.empty:
        raise ValueError(
            "Target column contains no usable values."
        )

    # Text / categorical / boolean target
    if (
        pd.api.types.is_object_dtype(clean_y)
        or pd.api.types.is_categorical_dtype(clean_y)
        or pd.api.types.is_bool_dtype(clean_y)
    ):
        return "classification"

    # Numeric target
    if pd.api.types.is_numeric_dtype(clean_y):

        unique_values = clean_y.nunique()

        # Check whether values are effectively integers
        integer_like = np.all(
            np.isclose(
                clean_y.astype(float),
                np.round(
                    clean_y.astype(float)
                )
            )
        )

        # Integer-coded categories such as:
        # 0/1, 1/2/3, etc.
        if (
            integer_like
            and unique_values <= 10
            and (
                unique_values / len(clean_y)
            ) <= 0.5
        ):
            return "classification"

        # Continuous numeric target
        return "regression"

    return "classification"

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

def train_model(
    df: pd.DataFrame,
    target_column: str,
    model_name: str
) -> dict:

    if target_column not in df.columns:
        raise ValueError(
            f"Target column '{target_column}' does not exist."
        )

    data = df.dropna(
        subset=[target_column]
    ).copy()

    if len(data) < 10:
        raise ValueError(
            "Dataset is too small to train a model."
        )

    X = data.drop(
        columns=[target_column]
    )

    y = data[target_column]

    if X.shape[1] == 0:
        raise ValueError(
            "No feature columns are available for training."
        )

    problem_type = detect_problem_type(y)

    preprocessor = build_preprocessor(X)

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
        )
    )

    # ---------------------------------
    # MODEL SELECTION
    # ---------------------------------

    if problem_type == "classification":

        available_models = {
            "logistic_regression":
                LogisticRegression(
                    max_iter=1000,
                    random_state=42,
                ),

            "random_forest_classifier":
                RandomForestClassifier(
                    n_estimators=100,
                    random_state=42,
                ),
        }

    else:

        available_models = {
            "linear_regression":
                LinearRegression(),

            "random_forest_regressor":
                RandomForestRegressor(
                    n_estimators=100,
                    random_state=42,
                ),
        }


    if model_name not in available_models:
        raise ValueError(
            f"Model '{model_name}' is not valid "
            f"for a {problem_type} problem."
        )


    model = available_models[
        model_name
    ]


    pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                preprocessor
            ),
            (
                "model",
                model
            ),
        ]
    )


    pipeline.fit(
        X_train,
        y_train
    )


    predictions = pipeline.predict(
        X_test
    )


    # ---------------------------------
    # METRICS
    # ---------------------------------

    if problem_type == "classification":

        metrics = {
            "accuracy": round(
                accuracy_score(
                    y_test,
                    predictions
                ),
                4,
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
            mean_squared_error(
                y_test,
                predictions
            )
        )

        metrics = {
            "mae": round(
                mean_absolute_error(
                    y_test,
                    predictions
                ),
                4,
            ),

            "rmse": round(
                rmse,
                4
            ),

            "r2": round(
                r2_score(
                    y_test,
                    predictions
                ),
                4,
            ),
        }


    # ---------------------------------
    # MLFLOW
    # ---------------------------------

    mlflow.set_experiment(
        "DataGuardian"
    )

    with mlflow.start_run(
        run_name=
        f"{model.__class__.__name__}_{target_column}"
    ):

        mlflow.log_param(
            "target_column",
            target_column
        )

        mlflow.log_param(
            "problem_type",
            problem_type
        )

        mlflow.log_param(
            "model_name",
            model_name
        )

        mlflow.log_param(
            "model_class",
            model.__class__.__name__
        )

        mlflow.log_param(
            "training_rows",
            len(X_train)
        )

        mlflow.log_param(
            "testing_rows",
            len(X_test)
        )

        mlflow.log_param(
            "feature_count",
            X.shape[1]
        )

        for (
            metric_name,
            metric_value
        ) in metrics.items():

            mlflow.log_metric(
                metric_name,
                metric_value
            )


    return {
        "problem_type":
            problem_type,

        "target_column":
            target_column,

        "model_name":
            model_name,

        "model":
            type(model).__name__,

        "training_rows":
            len(X_train),

        "testing_rows":
            len(X_test),

        "feature_count":
            X.shape[1],

        "metrics":
            metrics,
    }