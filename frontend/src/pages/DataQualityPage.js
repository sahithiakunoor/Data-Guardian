import React, {
  useEffect,
  useState,
} from "react";

import {
  UploadForm
} from "../components/UploadForm";

import {
  ValidationReport
} from "../components/ValidationReport";

import {
  ScoreCard
} from "../components/ScoreCard";

import {
  useDataset
} from "../context/DatasetContext";

import {
  fetchLatestValidation
} from "../api";


export default function DataQualityPage() {

  const {
    activeDataset,
    validationResult,
    setValidationResult,
    restoringDataset,
  } = useDataset();


  const [
    loadingPrevious,
    setLoadingPrevious,
  ] = useState(false);


  /*
   * Always restore the latest persisted validation
   * when this page mounts or the active dataset changes.
   *
   * This handles:
   * - normal navigation
   * - browser refresh
   * - reopening the page
   */
  useEffect(() => {

    if (restoringDataset) {
      return;
    }

    if (!activeDataset?.dataset_id) {
      setValidationResult(null);
      return;
    }


    const loadLatestValidation =
      async () => {

        try {
          setLoadingPrevious(true);

          const latest =
            await fetchLatestValidation(
              activeDataset.dataset_id
            );

          setValidationResult(
            latest || null
          );

        } catch (error) {

          console.error(
            "Unable to restore validation result:",
            error
          );

          /*
           * Do not destroy an already available
           * Context result just because the refresh
           * request failed.
           */
        } finally {
          setLoadingPrevious(false);
        }

      };


    loadLatestValidation();

  }, [
    activeDataset?.dataset_id,
    restoringDataset,
    setValidationResult,
  ]);


  const result =
    validationResult;


  const validationSummary =
    result?.validation_summary;


  const score =
    result?.data_quality_score ??
    null;


  const formatTimestamp = (
    value
  ) => {

    if (!value) {
      return null;
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date.toLocaleString();
  };


  return (
    <>

      {/* PAGE HEADER */}

      <header className="topbar">

        <div>

          <span className="page-eyebrow">
            DATA QUALITY
          </span>

          <h1>
            Data Quality
          </h1>

          <p>
            Validate and inspect the health
            of your active dataset.
          </p>

        </div>


        <div className="topbar-badge">
          ETL
        </div>

      </header>


      {/* TOP GRID */}

      <div className="quality-page-grid">


        {/* VALIDATION CONTROL */}

        <div className="dashboard-card">

          <div className="section-heading">

            <div>

              <span className="section-label">
                DATASET
              </span>

              <h2>
                Run DataGuardian
              </h2>

              <p>
                Start the ETL and validation
                pipeline.
              </p>

            </div>


            <div className="status-badge">
              ETL Pipeline
            </div>

          </div>


          <UploadForm
            onResult={
              setValidationResult
            }
          />

        </div>


        {/* QUALITY SCORE */}

        <div className="score-wrapper">

          <div className="mini-heading">
            DATA QUALITY
          </div>


          <ScoreCard
            score={score}
          />

        </div>

      </div>


      {/* VALIDATION RESULTS */}

      <section className="dashboard-section">


        <div className="section-title">

          <div>

            <span className="section-label">
              VALIDATION
            </span>

            <h2>
              Validation Overview
            </h2>

          </div>


          {result?.completed_at && (

            <div className="result-timestamp">

              Last validated:{" "}

              {formatTimestamp(
                result.completed_at
              )}

            </div>

          )}

        </div>


        <div className="dashboard-card">


          {restoringDataset ||
           loadingPrevious ? (

            <div className="training-state">

              <div className="spinner">
              </div>

              <div>

                <strong>
                  Restoring validation results
                </strong>

                <p>
                  Loading the latest saved
                  validation run.
                </p>

              </div>

            </div>

          ) : validationSummary ? (

            <ValidationReport
              report={
                validationSummary
              }

              score={
                score
              }

              postFixReport={
                result?.post_fix_summary
              }

              remediation={
                result?.remediation
              }
            />

          ) : (

            <div className="validation-empty-state">

              <div className="empty-state-icon">
                ✓
              </div>

              <div>

                <h3>
                  No validation run yet
                </h3>

                <p>
                  Run the ETL pipeline above
                  to inspect missing values,
                  anomalies, column types,
                  and overall data quality.
                </p>

              </div>

            </div>

          )}

        </div>

      </section>

    </>
  );
}