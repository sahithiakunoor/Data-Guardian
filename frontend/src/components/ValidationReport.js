import React from "react";

export function ValidationReport({
  report,
  score,
  postFixReport,
  remediation
}) {
  if (!report) {
    return (
      <div className="validation-empty-state">
        <div className="empty-state-icon">✓</div>

        <div>
          <h3>No validation run yet</h3>
          <p>
            Run the ETL pipeline above to inspect missing values,
            anomalies, column types, and overall data quality.
          </p>
        </div>
      </div>
    );
  }

  const missingValues = report.missing_values || {};
  const anomalies = report.anomalies || {};
  const datatypes = report.datatypes || {};
  const constantColumns = report.constant_columns || [];

  const totalMissing = Object.values(missingValues).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  const totalAnomalies = Object.values(anomalies).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  const issueCount =
    Object.keys(missingValues).length +
    Object.keys(anomalies).length +
    constantColumns.length;

  return (
    <div className="validation-report">

      {/* Summary cards */}

      <div className="validation-stat-grid">

        <div className="validation-stat">
          <div className="stat-icon stat-quality">✓</div>

          <div>
            <span>Quality Score</span>
            <strong>{score ?? report.data_quality_score ?? 100}%</strong>
          </div>
        </div>

        <div className="validation-stat">
          <div className="stat-icon stat-warning">!</div>

          <div>
            <span>Missing Values</span>
            <strong>{totalMissing}</strong>
          </div>
        </div>

        <div className="validation-stat">
          <div className="stat-icon stat-anomaly">⌁</div>

          <div>
            <span>Anomalies</span>
            <strong>{totalAnomalies}</strong>
          </div>
        </div>

        <div className="validation-stat">
          <div className="stat-icon stat-columns">#</div>

          <div>
            <span>Columns</span>
            <strong>{Object.keys(datatypes).length}</strong>
          </div>
        </div>

      </div>

      {remediation && (

        <div className="remediation-section">

          <div className="remediation-header">

            <div>
              <span className="section-label">
                AUTO-FIX RESULTS
              </span>

              <h3>
                Data Remediation
              </h3>

              <p>
                DataGuardian automatically repaired
                supported quality issues detected during
                validation.
              </p>
            </div>

            {remediation.missing_after === 0 && (
              <span className="remediation-status">
                Fixes Applied
              </span>
            )}

          </div>


          <div className="remediation-grid">

            <div className="remediation-card before">

              <span>
                Before Auto-Fix
              </span>

              <strong>
                {remediation.missing_before}
              </strong>

              <small>
                missing values
              </small>

            </div>


            <div className="remediation-arrow">
              →
            </div>


            <div className="remediation-card after">

              <span>
                After Auto-Fix
              </span>

              <strong>
                {remediation.missing_after}
              </strong>

              <small>
                missing values remaining
              </small>

            </div>


            <div className="remediation-card fixed">

              <span>
                Values Fixed
              </span>

              <strong>
                {remediation.missing_fixed}
              </strong>

              <small>
                successfully imputed
              </small>

            </div>


            <div className="remediation-card">

              <span>
                Rows Preserved
              </span>

              <strong>
                {remediation.rows_after}
                /
                {remediation.rows_before}
              </strong>

              <small>
                processed rows retained
              </small>

            </div>

          </div>


          {postFixReport && (

            <div className="post-fix-message">

              {Object.keys(
                postFixReport.missing_values || {}
              ).length === 0 ? (

                <>
                  <span>✓</span>

                  <div>
                    <strong>
                      Missing-value remediation complete
                    </strong>

                    <p>
                      No missing values remain after
                      automatic imputation.
                    </p>
                  </div>
                </>

              ) : (

                <>
                  <span>!</span>

                  <div>
                    <strong>
                      Some missing values remain
                    </strong>

                    <p>
                      Review the remaining issues before
                      using this dataset for modeling.
                    </p>
                  </div>
                </>

              )}

            </div>

          )}

        </div>

      )}

      {/* Issues */}

      <div className="validation-block">

        <div className="validation-block-header">
          <div>
            <h3>Issues Detected</h3>
            <p>
              Data quality issues identified during validation.
            </p>
          </div>

          <span
            className={
              issueCount === 0
                ? "issue-count issue-count-success"
                : "issue-count"
            }
          >
            {issueCount === 0
              ? "No Issues"
              : `${issueCount} issue${issueCount === 1 ? "" : "s"}`}
          </span>
        </div>

        {issueCount === 0 ? (
          <div className="validation-success">
            <span>✓</span>

            <div>
              <strong>No major quality issues detected</strong>
              <p>
                Missing value, anomaly, and constant-column checks passed.
              </p>
            </div>
          </div>
        ) : (
          <div className="issue-list">

            {Object.entries(missingValues).map(([column, value]) => (
              <div className="issue-row" key={`missing-${column}`}>

                <div className="issue-main">
                  <div className="issue-symbol warning-symbol">!</div>

                  <div>
                    <strong>{column}</strong>
                    <span>
                      {value} missing value{Number(value) === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <span className="issue-badge warning-badge">
                  Missing
                </span>
              </div>
            ))}

            {Object.entries(anomalies).map(([column, value]) => (
              <div className="issue-row" key={`anomaly-${column}`}>

                <div className="issue-main">
                  <div className="issue-symbol anomaly-symbol">⌁</div>

                  <div>
                    <strong>{column}</strong>
                    <span>
                      {value} potential outlier
                      {Number(value) === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <span className="issue-badge anomaly-badge">
                  Anomaly
                </span>
              </div>
            ))}

            {constantColumns.map((column) => (
              <div className="issue-row" key={`constant-${column}`}>

                <div className="issue-main">
                  <div className="issue-symbol constant-symbol">−</div>

                  <div>
                    <strong>{column}</strong>
                    <span>
                      Column contains only one unique value
                    </span>
                  </div>
                </div>

                <span className="issue-badge constant-badge">
                  Constant
                </span>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* Data types */}

      <div className="validation-block">

        <div className="validation-block-header">
          <div>
            <h3>Detected Schema</h3>
            <p>
              Column types detected in the processed dataset.
            </p>
          </div>
        </div>

        <div className="datatype-grid">

          {Object.entries(datatypes).map(([column, dtype]) => (
            <div className="datatype-item" key={column}>

              <span className="datatype-column">
                {column}
              </span>

              <span className="datatype-badge">
                {dtype}
              </span>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}