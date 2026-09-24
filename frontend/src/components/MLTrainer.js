import React, { useState } from "react";
import { getDatasetColumns, trainMLModel } from "../api";

function MLTrainer() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [target, setTarget] = useState("");
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    setFile(selectedFile);
    setTarget("");
    setResult(null);
    setError("");

    if (!selectedFile) {
      setColumns([]);
      setDatasetInfo(null);
      return;
    }

    try {
      setLoading(true);

      const data = await getDatasetColumns(selectedFile);

      setColumns(data.columns);
      setDatasetInfo(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to read dataset."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    if (!file || !target) {
      setError("Please select a dataset and target column.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await trainMLModel(file, target);

      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Model training failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-trainer">
      <h2>Machine Learning</h2>

      <p>
        Upload a CSV dataset and select the variable you want
        DataGuardian to predict.
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />

      {datasetInfo && (
        <p>
          <strong>{datasetInfo.filename}</strong>
          {" — "}
          {datasetInfo.rows} rows
        </p>
      )}

      {columns.length > 0 && (
        <div>
          <label htmlFor="target">
            Target column:
          </label>

          <select
            id="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          >
            <option value="">
              Select target
            </option>

            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>

          <button
            onClick={handleTrain}
            disabled={loading || !target}
          >
            {loading ? "Processing..." : "Train Model"}
          </button>
        </div>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      {result && (
        <div className="ml-results">
          <h3>Training Results</h3>

          <p>
            <strong>Problem Type:</strong>{" "}
            {result.problem_type}
          </p>

          <p>
            <strong>Model:</strong>{" "}
            {result.model}
          </p>

          <p>
            <strong>Target:</strong>{" "}
            {result.target_column}
          </p>

          <p>
            <strong>Features:</strong>{" "}
            {result.feature_count}
          </p>

          <p>
            <strong>Training Rows:</strong>{" "}
            {result.training_rows}
          </p>

          <p>
            <strong>Testing Rows:</strong>{" "}
            {result.testing_rows}
          </p>

          <h4>Metrics</h4>

          {Object.entries(result.metrics).map(
            ([metric, value]) => (
              <p key={metric}>
                <strong>
                  {metric.replaceAll("_", " ")}:
                </strong>{" "}
                {value}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default MLTrainer;