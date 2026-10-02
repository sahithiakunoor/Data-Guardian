import json
import os
import uuid

import pandas as pd
from werkzeug.utils import secure_filename


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATASET_DIR = os.path.join(
    BASE_DIR,
    "data",
    "datasets"
)

os.makedirs(DATASET_DIR, exist_ok=True)


def _dataset_folder(dataset_id: str) -> str:
    return os.path.join(
        DATASET_DIR,
        dataset_id
    )


def _metadata_path(dataset_id: str) -> str:
    return os.path.join(
        _dataset_folder(dataset_id),
        "metadata.json"
    )


def save_dataset(file) -> dict:
    """
    Persist an uploaded CSV and return its metadata.
    """

    if not file:
        raise ValueError("No file uploaded.")

    if not file.filename:
        raise ValueError("No file selected.")

    if not file.filename.lower().endswith(".csv"):
        raise ValueError(
            "Only CSV files are supported."
        )

    dataset_id = uuid.uuid4().hex

    folder = _dataset_folder(dataset_id)

    os.makedirs(folder, exist_ok=True)

    original_filename = secure_filename(
        file.filename
    )

    csv_path = os.path.join(
        folder,
        "dataset.csv"
    )

    file.save(csv_path)

    try:
        df = pd.read_csv(csv_path)
    except Exception:
        # Avoid keeping invalid uploads
        try:
            os.remove(csv_path)
            os.rmdir(folder)
        except OSError:
            pass

        raise ValueError(
            "Unable to read the uploaded CSV."
        )

    metadata = {
        "dataset_id": dataset_id,
        "filename": original_filename,
        "rows": int(len(df)),
        "columns": df.columns.tolist(),
        "column_count": int(len(df.columns)),
    }

    with open(
        _metadata_path(dataset_id),
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            metadata,
            f,
            indent=2
        )

    return metadata


def get_dataset_metadata(
    dataset_id: str
) -> dict:
    path = _metadata_path(dataset_id)

    if not os.path.exists(path):
        raise FileNotFoundError(
            "Dataset not found."
        )

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:
        return json.load(f)


def get_dataset_path(
    dataset_id: str
) -> str:
    # Also validates that dataset exists
    get_dataset_metadata(dataset_id)

    path = os.path.join(
        _dataset_folder(dataset_id),
        "dataset.csv"
    )

    if not os.path.exists(path):
        raise FileNotFoundError(
            "Dataset file not found."
        )

    return path


def load_dataset(
    dataset_id: str
) -> pd.DataFrame:
    path = get_dataset_path(
        dataset_id
    )

    return pd.read_csv(path)


def save_result(
    dataset_id: str,
    result_type: str,
    data: dict
):
    get_dataset_metadata(dataset_id)

    allowed = {
        "validation",
        "ml"
    }

    if result_type not in allowed:
        raise ValueError(
            "Unsupported result type."
        )

    path = os.path.join(
        _dataset_folder(dataset_id),
        f"latest_{result_type}.json"
    )

    with open(
        path,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            data,
            f,
            indent=2,
            default=str
        )


def get_result(
    dataset_id: str,
    result_type: str
):
    get_dataset_metadata(dataset_id)

    path = os.path.join(
        _dataset_folder(dataset_id),
        f"latest_{result_type}.json"
    )

    if not os.path.exists(path):
        return None

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:
        return json.load(f)