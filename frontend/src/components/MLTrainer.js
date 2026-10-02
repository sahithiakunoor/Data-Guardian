import React, {
  useEffect,
  useState,
} from "react";


import {
  useDataset
} from "../context/DatasetContext";

import {
  trainDataset,
  fetchLatestMLResult,
  getProblemType,
} from "../api";

export default function MLTrainer({
  onTrainingComplete
}) {

  const [
    problemType,
    setProblemType,
  ] = useState("");

  const [
    modelOptions,
    setModelOptions,
  ] = useState([]);

  const [
    selectedModel,
    setSelectedModel,
  ] = useState("");

  const [
    targetColumn,
    setTargetColumn,
  ] = useState("");

  const {
    activeDataset,
    mlResult,
    setMlResult,
  } = useDataset();

  const result = mlResult;

  const [
    training,
    setTraining,
  ] = useState(false);

  const [
    loadingPrevious,
    setLoadingPrevious,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    if (
      !activeDataset?.dataset_id ||
      !targetColumn
    ) {
      setProblemType("");
      setModelOptions([]);
      setSelectedModel("");

      return;
    }

    const detectType =
      async () => {

        try {
          const response =
            await getProblemType(
              activeDataset.dataset_id,
              targetColumn
            );

          setProblemType(
            response.problem_type
          );

          setModelOptions(
            response.models || []
          );

          setSelectedModel("");

        } catch (error) {
          console.error(error);

          setProblemType("");
          setModelOptions([]);
          setSelectedModel("");
        }
      };

    detectType();

  }, [
    activeDataset?.dataset_id,
    targetColumn,
  ]);


  const handleTrain = async () => {

    if (!activeDataset?.dataset_id) {
      setError(
        "Select a dataset from the Dashboard first."
      );

      return;
    }

    if (!targetColumn) {
      setError(
        "Please select a target column."
      );

      return;
    }

    try {
      setTraining(true);
      setError("");

      const response =
        await trainDataset(
          activeDataset.dataset_id,
          targetColumn,
          selectedModel
        );

      setMlResult(response);

      if (!selectedModel) {
        setError(
          "Please select a model."
        );

        return;
      }

      if (onTrainingComplete) {
        onTrainingComplete();
      }

    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
        "Model training failed."
      );

    } finally {
      setTraining(false);
    }
  };


  const formatMetric = value => {
    if (
      value === null ||
      value === undefined
    ) {
      return "N/A";
    }

    return Number(value).toFixed(3);
  };


  const columns =
    activeDataset?.columns || [];

  const formatTimestamp = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleString();
  };

  return (
    <div className="dashboard-card ml-section">

      <div className="section-heading">

        <div>
          <span className="section-label">
            MACHINE LEARNING
          </span>

          <h2>
            Model Training
          </h2>

          <p>
            Train a model using the active
            persistent dataset.
          </p>
        </div>

        <div className="status-badge status-purple">
          ML Pipeline
        </div>

      </div>


      <div className="ml-controls">

        <div className="form-group">

          <label>
            Training Dataset
          </label>

          <div className="selected-dataset-card">

            <div className="dataset-file-icon">
              CSV
            </div>

            <div className="selected-dataset-info">

              <strong>
                {activeDataset
                  ? activeDataset.filename
                  : "No dataset selected"}
              </strong>

              <span>
                {activeDataset
                  ? `${activeDataset.column_count} columns · ${activeDataset.rows} rows`
                  : "Select a dataset from Dashboard"}
              </span>

            </div>

          </div>

        </div>


        <div className="form-group">

          <label htmlFor="target-column">
            Target Column
          </label>

          <select
            id="target-column"
            value={targetColumn}
            onChange={
              event =>
                setTargetColumn(
                  event.target.value
                )
            }
            disabled={!activeDataset}
          >

            <option value="">
              Select target column
            </option>

            {columns.map(column => (
              <option
                key={column}
                value={column}
              >
                {column}
              </option>
            ))}

          </select>

        </div>

        <div className="form-group">

          <label htmlFor="model-selection">
            Model
          </label>

          <select
            id="model-selection"
            value={selectedModel}
            onChange={
              event =>
                setSelectedModel(
                  event.target.value
                )
            }
            disabled={
              !targetColumn ||
              !modelOptions.length
            }
          >

            <option value="">
              Select model
            </option>

            {modelOptions.map(
              model => (

                <option
                  key={model.value}
                  value={model.value}
                >
                  {model.label}
                </option>

              )
            )}

          </select>


          {problemType && (
            <small className="model-type-hint">
              Detected problem:{" "}
              <strong>
                {problemType}
              </strong>
            </small>
          )}

        </div>

        <button
          className="primary-button"
          onClick={handleTrain}
          disabled={
            !activeDataset ||
            !targetColumn ||
            !selectedModel ||
            training
          }
        >

          {training
            ? "Training Model..."
            : "Train Model"}

        </button>

      </div>


      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}


      {(training ||
        loadingPrevious) && (

          <div className="training-state">

            <div className="spinner"></div>

            <div>
              <strong>
                {training
                  ? "Training model"
                  : "Loading previous model result"}
              </strong>
            </div>

          </div>

        )}


      {result &&
        !training &&
        !loadingPrevious && (

          <div className="training-results">

            <div className="result-meta-row">

              <div>
                <span className="section-label">
                  LATEST MODEL RESULT
                </span>
              </div>

              {result.completed_at && (
                <span className="result-timestamp">
                  Last trained:{" "}
                  {formatTimestamp(
                    result.completed_at
                  )}
                </span>
              )}

            </div>

            <div className="result-summary">

              <div>
                <span>Model</span>
                <strong>
                  {result.model || "N/A"}
                </strong>
              </div>

              <div>
                <span>Problem Type</span>
                <strong>
                  {result.problem_type || "N/A"}
                </strong>
              </div>

              <div>
                <span>Target</span>
                <strong>
                  {result.target_column || "N/A"}
                </strong>
              </div>

              <div>
                <span>Features</span>
                <strong>
                  {result.feature_count ?? "N/A"}
                </strong>
              </div>

              <div>
                <span>Training Rows</span>
                <strong>
                  {result.training_rows ?? "N/A"}
                </strong>
              </div>

              <div>
                <span>Testing Rows</span>
                <strong>
                  {result.testing_rows ?? "N/A"}
                </strong>
              </div>

            </div>


            {result.metrics && (

              <>
                <div className="subsection-title">
                  Model Performance
                </div>

                <div className="metric-grid">

                  {Object.entries(
                    result.metrics
                  ).map(
                    ([name, value]) => (

                      <div
                        className="metric-card"
                        key={name}
                      >

                        <span>
                          {name
                            .replaceAll("_", " ")}
                        </span>

                        <strong>
                          {formatMetric(value)}
                        </strong>

                      </div>

                    )
                  )}

                </div>
              </>

            )}

          </div>

        )}

    </div>
  );
}