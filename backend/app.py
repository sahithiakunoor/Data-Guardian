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

app = Flask(__name__)
init_log_table()
CORS(app)


@app.route('/')
def home():
    return jsonify({"message": "DataGuardian backend running successfully!"})

@app.route("/run_etl", methods=["POST"])
def run_etl():
    payload = request.get_json()
    source = payload.get("source", "data/sample_data.csv")
    auto_fix = bool(payload.get("auto_fix", True))

    if not os.path.exists(source):
        return jsonify({"error": f"File not found: {source}"}), 404

    start_time = time.time()

    df = extract_data(source)
    cleaned = transform_data(df)
    validation_report = validate_data(cleaned)
    print_validation_report(validation_report)

    # Count missing before imputation
    total_missing_before = int(cleaned.isna().sum().sum())

    if auto_fix:
        cleaned = impute_missing(cleaned)

    total_missing_after = int(cleaned.isna().sum().sum())
    fixed_count = total_missing_before - total_missing_after

    load_data(cleaned)

    runtime = round(time.time() - start_time, 2)

    log_validation(
        filename=os.path.basename(source),
        rows=len(cleaned),
        report=validation_report,
        runtime=runtime,
        missing_fixed=fixed_count if auto_fix else 0
    )

    return jsonify({
        "message": "ETL + Validation + Auto-Fix completed",
        "rows": len(cleaned),
        "auto_fix": auto_fix,
        "runtime_seconds": runtime,
        "missing_fixed": fixed_count,
        "validation_summary": validation_report
    })

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

        df = pd.read_csv(file)

        result = train_model(
            df=df,
            target_column=target_column
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

if __name__ == '__main__':
    app.run(debug=True)