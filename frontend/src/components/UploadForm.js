import React, {
  useState
} from "react";

import {
  validateDataset
} from "../api";

import {
  useDataset
} from "../context/DatasetContext";


export function UploadForm({
  onResult
}) {
  const {
    activeDataset,
  } = useDataset();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const handleRun = async () => {

    if (!activeDataset?.dataset_id) {
      setError(
        "Please select a dataset from the Dashboard."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await validateDataset(
          activeDataset.dataset_id
        );

      onResult(result);

    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
        "Validation failed."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="etl-form">

      <div className="etl-input-group">

        <label>
          Active Dataset
        </label>

        <div className="dataset-path-input">

          <div className="dataset-file-icon">
            CSV
          </div>

          <div className="path-field">

            <span>
              Source dataset
            </span>

            <strong className="active-dataset-name">
              {activeDataset
                ? activeDataset.filename
                : "No dataset selected"}
            </strong>

            {activeDataset && (
              <small className="active-dataset-meta">

                {activeDataset.column_count}
                {" "}columns ·{" "}
                {activeDataset.rows}
                {" "}rows

              </small>
            )}

          </div>

        </div>

      </div>


      <button
        className="primary-button etl-button"
        onClick={handleRun}
        disabled={
          loading ||
          !activeDataset
        }
      >

        {loading
          ? "Running Validation..."
          : "Run Validation"}

      </button>


      {error && (
        <div className="message error-message etl-error">
          {error}
        </div>
      )}

    </div>
  );
}