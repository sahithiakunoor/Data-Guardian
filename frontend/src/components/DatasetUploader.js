import React, {
  useRef,
  useState,
} from "react";

import {
  uploadDataset
} from "../api";

import {
  useDataset
} from "../context/DatasetContext";


export default function DatasetUploader() {
  const {
    activeDataset,
    setActiveDataset,
    clearDataset,
  } = useDataset();

  const fileInputRef = useRef(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleFileChange = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setError(
        "Please select a CSV file."
      );

      // Allows selecting the same file again
      event.target.value = "";

      return;
    }

    try {
      setLoading(true);
      setError("");

      const dataset =
        await uploadDataset(file);

      setActiveDataset(dataset);

    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
        "Unable to upload dataset."
      );

    } finally {
      setLoading(false);

      // Allows re-uploading the same filename later
      event.target.value = "";
    }
  };


  const handleChooseDataset = () => {
    fileInputRef.current?.click();
  };


  const handleClearDataset = () => {
    if (!activeDataset) {
      return;
    }

    const confirmed =
      window.confirm(
        `Clear "${activeDataset.filename}" as the active dataset?\n\n` +
        "This will not delete the stored dataset or its historical logs."
      );

    if (!confirmed) {
      return;
    }

    clearDataset();

    setError("");
  };


  return (
    <div className="dataset-uploader">

      {/* Hidden native picker */}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        disabled={loading}
        className="hidden-file-input"
      />


      {/* ACTIVE DATASET */}

      {activeDataset ? (

        <div className="active-dataset-control">

          <div className="active-dataset-file">

            <div className="dataset-file-icon">
              CSV
            </div>

            <div className="active-dataset-details">

              <strong>
                {activeDataset.filename}
              </strong>

              <span>
                {activeDataset.column_count}
                {" "}columns ·{" "}
                {activeDataset.rows}
                {" "}rows
              </span>

            </div>

          </div>


          <div className="dataset-actions">

            <button
              type="button"
              className="dataset-change-button"
              onClick={handleChooseDataset}
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : "Change Dataset"}
            </button>


            <button
              type="button"
              className="dataset-clear-button"
              onClick={handleClearDataset}
              disabled={loading}
            >
              Clear
            </button>

          </div>

        </div>

      ) : (

        /* NO DATASET */

        <button
          type="button"
          className="dataset-empty-upload"
          onClick={handleChooseDataset}
          disabled={loading}
        >

          <div className="dataset-file-icon">
            CSV
          </div>

          <div>

            <strong>
              {loading
                ? "Uploading dataset..."
                : "Choose CSV dataset"}
            </strong>

            <span>
              Upload once and reuse it across
              Dashboard, Data Quality, and
              Machine Learning.
            </span>

          </div>

        </button>

      )}


      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}

    </div>
  );
}