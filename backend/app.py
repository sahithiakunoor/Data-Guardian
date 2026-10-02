from flask import Flask, jsonify, request
from etl.extract import extract_data
from etl.transform import transform_data
from etl.load import load_data
from etl.impute import impute_missing
from utils.monitor import validate_data, print_validation_report
from utils.logger import init_log_table, log_validation
import time,os
import pandas as pd
from flask_cors import CORS
from ml.trainer import train_model
from eda.analyzer import analyze_dataframe
from mlflow.tracking import MlflowClient
from datetime import datetime, timezone
import mlflow

from ml.trainer import (
    train_model,
    detect_problem_type,
)

from sklearn.linear_model import (
    LogisticRegression,
    LinearRegression,
)

from datasets.store import (
    save_dataset,
    get_dataset_metadata,
    load_dataset,
    save_result,
    get_result,
)

app = Flask(__name__)
init_log_table()
CORS(app)


@app.route('/')
def home():
    return jsonify({"message": "DataGuardian backend running successfully!"})

@app.route("/run_etl", methods=["POST"])
def run_etl():
    try:
        # Check uploaded file
        if "file" not in request.files:
            return jsonify({
                "error": "No file uploaded."
            }), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({
                "error": "No file selected."
            }), 400

        if not file.filename.lower().endswith(".csv"):
            return jsonify({
                "error": "Only CSV files are supported."
            }), 400

        # Read auto_fix from multipart form
        auto_fix_value = request.form.get("auto_fix", "true")

        auto_fix = auto_fix_value.lower() in (
            "true",
            "1",
            "yes"
        )

        start_time = time.time()

        # Read uploaded CSV directly
        df = pd.read_csv(file)

        # Existing ETL pipeline
        cleaned = transform_data(df)

        validation_report = validate_data(cleaned)

        print_validation_report(validation_report)

        # Missing values before fixing
        total_missing_before = int(
            cleaned.isna().sum().sum()
        )

        # Auto-fix
        if auto_fix:
            cleaned = impute_missing(cleaned)

        total_missing_after = int(
            cleaned.isna().sum().sum()
        )

        fixed_count = (
            total_missing_before -
            total_missing_after
        )

        # Existing load step
        load_data(cleaned)

        runtime = round(
            time.time() - start_time,
            2
        )

        # Log run
        log_validation(
            filename=file.filename,
            rows=len(cleaned),
            report=validation_report,
            runtime=runtime,
            missing_fixed=(
                fixed_count if auto_fix else 0
            )
        )

        return jsonify({
            "message":
                "ETL + Validation + Auto-Fix completed",

            "filename": file.filename,

            "rows": len(cleaned),

            "columns": len(cleaned.columns),

            "auto_fix": auto_fix,

            "runtime_seconds": runtime,

            "missing_fixed": fixed_count,

            "validation_summary":
                validation_report
        })

    except pd.errors.EmptyDataError:
        return jsonify({
            "error": "The uploaded CSV file is empty."
        }), 400

    except pd.errors.ParserError:
        return jsonify({
            "error": "Unable to parse the CSV file."
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
        
@app.route("/logs", methods=["GET"])
def get_logs():
    import sqlite3, pandas as pd
    from utils.logger import DB_PATH

    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT * FROM validation_logs ORDER BY id DESC", conn)
    return jsonify(df.to_dict(orient="records"))

@app.route("/train_model", methods=["POST"])
def train_model_endpoint():
    try:
        if "file" not in request.files:
            return jsonify({
                "error": "No file uploaded."
            }), 400

        file = request.files["file"]
        target_column = request.form.get("target_column")

        if file.filename == "":
            return jsonify({
                "error": "No file selected."
            }), 400

        if not file.filename.lower().endswith(".csv"):
            return jsonify({
                "error": "Only CSV files are supported."
            }), 400

        if not target_column:
            return jsonify({
                "error": "Target column is required."
            }), 400

        if not model_name:
            return jsonify({
                "error":
                    "Model selection is required."
            }), 400
        
        df = pd.read_csv(file)

        result = train_model(
            df=df,
            target_column=target_column,
            model_name=model_name
        )

        return jsonify({
            "message": "Model training completed",
            "filename": file.filename,
            **result
        })

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route("/dataset_columns", methods=["POST"])
def dataset_columns():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded."}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No file selected."}), 400

        if not file.filename.lower().endswith(".csv"):
            return jsonify({"error": "Only CSV files are supported."}), 400

        df = pd.read_csv(file)

        return jsonify({
            "filename": file.filename,
            "rows": len(df),
            "columns": df.columns.tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/eda", methods=["POST"])
def eda_endpoint():
    try:
        if "file" not in request.files:
            return jsonify({
                "error": "No file uploaded."
            }), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({
                "error": "No file selected."
            }), 400

        if not file.filename.lower().endswith(".csv"):
            return jsonify({
                "error": "Only CSV files are supported."
            }), 400

        df = pd.read_csv(file)

        eda_result = analyze_dataframe(df)

        return jsonify({
            "filename": file.filename,
            **eda_result
        })

    except pd.errors.EmptyDataError:
        return jsonify({
            "error": "The uploaded CSV is empty."
        }), 400

    except pd.errors.ParserError:
        return jsonify({
            "error": "Unable to parse the CSV."
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route("/mlflow_runs", methods=["GET"])
def mlflow_runs():
    try:
        client = MlflowClient()

        experiment = mlflow.get_experiment_by_name(
            "DataGuardian"
        )

        if experiment is None:
            return jsonify([])

        runs = client.search_runs(
            experiment_ids=[experiment.experiment_id],
            order_by=["start_time DESC"],
            max_results=50
        )

        results = []

        for run in runs:
            results.append({
                "run_id": run.info.run_id,
                "run_name": run.data.tags.get(
                    "mlflow.runName",
                    run.info.run_id[:8]
                ),
                "status": run.info.status,
                "start_time": run.info.start_time,
                "end_time": run.info.end_time,

                "model": run.data.params.get("model"),
                "target_column": run.data.params.get(
                    "target_column"
                ),
                "problem_type": run.data.params.get(
                    "problem_type"
                ),
                "training_rows": run.data.params.get(
                    "training_rows"
                ),
                "testing_rows": run.data.params.get(
                    "testing_rows"
                ),
                "feature_count": run.data.params.get(
                    "feature_count"
                ),

                "metrics": run.data.metrics
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route(
    "/datasets",
    methods=["POST"]
)
def create_dataset():
    try:
        if "file" not in request.files:
            return jsonify({
                "error": "No file uploaded."
            }), 400

        metadata = save_dataset(
            request.files["file"]
        )

        return jsonify(metadata), 201

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route(
    "/datasets/<dataset_id>",
    methods=["GET"]
)
def get_dataset(dataset_id):
    try:
        return jsonify(
            get_dataset_metadata(
                dataset_id
            )
        )

    except FileNotFoundError:
        return jsonify({
            "error": "Dataset not found."
        }), 404

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route("/datasets/<dataset_id>/eda", methods=["GET"])
def dataset_eda(dataset_id):
    try:
        df = load_dataset(dataset_id)

        result = analyze_dataframe(df)

        return jsonify(result)

    except FileNotFoundError:
        return jsonify({
            "error": "Dataset not found."
        }), 404

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route(
    "/datasets/<dataset_id>/validate",
    methods=["POST"]
)
def validate_dataset(dataset_id):
    try:
        metadata = get_dataset_metadata(
            dataset_id
        )

        df = load_dataset(
            dataset_id
        )

        start_time = time.time()

        # ---------------------------------
        # TRANSFORM
        # ---------------------------------

        cleaned = transform_data(df)

        rows_before_fix = len(cleaned)

        # ---------------------------------
        # VALIDATION BEFORE AUTO-FIX
        # ---------------------------------

        validation_report_before = validate_data(
            cleaned
        )

        total_missing_before = int(
            cleaned.isna().sum().sum()
        )

        # ---------------------------------
        # AUTO-FIX
        # ---------------------------------

        cleaned = impute_missing(
            cleaned
        )

        # ---------------------------------
        # VALIDATION AFTER AUTO-FIX
        # ---------------------------------

        validation_report_after = validate_data(
            cleaned
        )

        total_missing_after = int(
            cleaned.isna().sum().sum()
        )

        rows_after_fix = len(cleaned)

        fixed_count = (
            total_missing_before
            - total_missing_after
        )

        # ---------------------------------
        # LOAD
        # ---------------------------------

        load_data(cleaned)

        runtime = round(
            time.time() - start_time,
            2
        )

        # Quality score is intentionally based
        # on the incoming/pre-fix dataset.
        quality_score = log_validation(
            filename=metadata["filename"],
            rows=rows_before_fix,
            report=validation_report_before,
            runtime=runtime,
            missing_fixed=fixed_count
        )

        # ---------------------------------
        # RESPONSE
        # ---------------------------------

        result = {
            "message":
                "Validation and auto-fix completed",

            "dataset_id":
                dataset_id,

            "filename":
                metadata["filename"],

            "rows":
                rows_after_fix,

            "runtime_seconds":
                runtime,

            "data_quality_score":
                quality_score,

            "auto_fix_applied":
                True,

            "completed_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),

            # Keep this for existing frontend compatibility
            "validation_summary":
                validation_report_before,

            # New remediation information
            "post_fix_summary":
                validation_report_after,

            "remediation": {
                "missing_before":
                    total_missing_before,

                "missing_after":
                    total_missing_after,

                "missing_fixed":
                    fixed_count,

                "rows_before":
                    rows_before_fix,

                "rows_after":
                    rows_after_fix
            }
        }

        save_result(
            dataset_id,
            "validation",
            result
        )

        return jsonify(result)

    except FileNotFoundError:
        return jsonify({
            "error":
                "Dataset not found."
        }), 404

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
        
@app.route(
    "/datasets/<dataset_id>/train",
    methods=["POST"]
)
def train_dataset(dataset_id):
    try:
        payload = request.get_json() or {}

        target_column = payload.get(
            "target_column"
        )

        model_name = payload.get(
            "model_name"
        )

        if not target_column:
            return jsonify({
                "error":
                    "Target column is required."
            }), 400

        if not model_name:
            return jsonify({
                "error":
                    "Model selection is required."
            }), 400

        metadata = get_dataset_metadata(
            dataset_id
        )

        df = load_dataset(
            dataset_id
        )

        result = train_model(
            df=df,
            target_column=target_column,
            model_name=model_name
        )

        response = {
            "message": "Model training completed",
            "dataset_id": dataset_id,
            "filename": metadata["filename"],
            "completed_at": datetime.now(
                timezone.utc
            ).isoformat(),
            **result
        }

        save_result(
            dataset_id,
            "ml",
            response
        )

        return jsonify(response)

    except FileNotFoundError:
        return jsonify({
            "error": "Dataset not found."
        }), 404

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route(
    "/datasets/<dataset_id>/ml/latest",
    methods=["GET"]
)
def latest_ml_result(dataset_id):
    try:
        result = get_result(
            dataset_id,
            "ml"
        )

        if result is None:
            return jsonify({
                "result": None
            })

        return jsonify({
            "result": result
        })

    except FileNotFoundError:
        return jsonify({
            "error": "Dataset not found."
        }), 404

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route(
    "/datasets/<dataset_id>/validation/latest",
    methods=["GET"]
)
def latest_validation(dataset_id):
    try:
        result = get_result(
            dataset_id,
            "validation"
        )

        return jsonify({
            "result": result
        }), 200

    except FileNotFoundError as e:
        return jsonify({
            "error": str(e)
        }), 404

    except Exception as e:
        print(
            "[Validation Restore Error]",
            repr(e)
        )

        return jsonify({
            "error": str(e)
        }), 500

@app.route(
    "/datasets/<dataset_id>/problem-type",
    methods=["POST"]
)
def dataset_problem_type(
    dataset_id
):
    try:
        payload = (
            request.get_json()
            or {}
        )

        target_column = payload.get(
            "target_column"
        )

        if not target_column:
            return jsonify({
                "error":
                    "Target column is required."
            }), 400

        df = load_dataset(
            dataset_id
        )

        if target_column not in df.columns:
            return jsonify({
                "error":
                    "Target column does not exist."
            }), 400

        problem_type = detect_problem_type(
            df[target_column]
        )

        if problem_type == "classification":

            models = [
                {
                    "value":
                        "logistic_regression",
                    "label":
                        "Logistic Regression"
                },
                {
                    "value":
                        "random_forest_classifier",
                    "label":
                        "Random Forest Classifier"
                },
            ]

        else:

            models = [
                {
                    "value":
                        "linear_regression",
                    "label":
                        "Linear Regression"
                },
                {
                    "value":
                        "random_forest_regressor",
                    "label":
                        "Random Forest Regressor"
                },
            ]

        return jsonify({
            "problem_type":
                problem_type,

            "models":
                models
        })

    except FileNotFoundError:

        return jsonify({
            "error":
                "Dataset not found."
        }), 404

    except Exception as e:

        return jsonify({
            "error":
                str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True)