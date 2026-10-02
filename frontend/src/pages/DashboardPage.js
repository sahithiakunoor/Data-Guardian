import React, {
  useEffect,
  useState,
} from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import DatasetUploader from "../components/DatasetUploader";

import {
  useDataset
} from "../context/DatasetContext";

import {
  getDatasetEDA
} from "../api";

export default function DashboardPage() {

  const {
    activeDataset,
    restoringDataset,
  } = useDataset();

  const [eda, setEda] = useState(null);

  const [loadingEDA, setLoadingEDA] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    selectedNumeric,
    setSelectedNumeric,
  ] = useState("");

  const [
    selectedCategorical,
    setSelectedCategorical,
  ] = useState("");

  useEffect(() => {
    if (!activeDataset?.dataset_id) {
      setEda(null);
      setSelectedNumeric("");
      setSelectedCategorical("");
      return;
    }
  
    const loadEDA = async () => {
      try {
        setLoadingEDA(true);
        setError("");
  
        const result =
          await getDatasetEDA(
            activeDataset.dataset_id
          );
  
        setEda(result);
  
        if (
          result.numeric_columns?.length
        ) {
          setSelectedNumeric(
            result.numeric_columns[0]
          );
        }
  
        if (
          result.categorical_columns?.length
        ) {
          setSelectedCategorical(
            result.categorical_columns[0]
          );
        }
  
      } catch (err) {
        console.error(err);
  
        setError(
          err?.response?.data?.error ||
          "Unable to generate EDA."
        );
  
      } finally {
        setLoadingEDA(false);
      }
    };
  
    loadEDA();
  
  }, [activeDataset?.dataset_id]);

  const numericStats =
    eda?.numeric_statistics?.[
    selectedNumeric
    ];

  const histogramData =
    eda?.histograms?.[
    selectedNumeric
    ] || [];

  const categoricalData =
    eda?.categorical_distributions?.[
    selectedCategorical
    ] || [];


  const formatPreviewValue = (value) => {

    if (
      typeof value === "string" &&
      value.includes("T")
    ) {

      const parsed =
        new Date(value);

      if (!Number.isNaN(
        parsed.getTime()
      )) {
        return parsed.toLocaleDateString();
      }
    }

    return String(value);
  };

  const getCorrelationStyle = (value) => {
    if (value === null || value === undefined) {
      return {};
    }

    const strength = Math.min(Math.abs(value), 1);

    if (value > 0) {
      return {
        background: `rgba(64, 94, 201, ${0.12 + strength * 0.45})`,
        color: strength > 0.55 ? "#ffffff" : "#24314d",
      };
    }

    if (value < 0) {
      return {
        background: `rgba(215, 73, 87, ${0.12 + strength * 0.45})`,
        color: strength > 0.55 ? "#ffffff" : "#4a2830",
      };
    }

    return {
      background: "#f7f8fb",
      color: "#667085",
    };
  };


  return (
    <>

      {/* HEADER */}

      <header className="topbar">

        <div>
          <span className="page-eyebrow">
            DATA OPERATIONS
          </span>

          <h1>
            DataGuardian Dashboard
          </h1>

          <p>
            Explore dataset health,
            distributions, missing values,
            and analytical insights.
          </p>
        </div>

        <div className="topbar-badge">
          ● Live
        </div>

      </header>


      {/* DATASET SELECTOR */}

      <div className="dashboard-card dataset-main-card">

        <div className="section-heading">

          <div>
            <span className="section-label">
              ACTIVE DATASET
            </span>

            <h2>
              {activeDataset
                ? activeDataset.filename
                : "Upload a Dataset"}
            </h2>

            <p>
              Upload once and use the same
              dataset across EDA, validation,
              and machine learning.
            </p>
          </div>

          {activeDataset && (
            <div className="status-badge">
              {activeDataset.column_count} columns
            </div>
          )}

        </div>

        <DatasetUploader />

      </div>


      {/* NO DATASET */}

      {!activeDataset && (

        <section className="dashboard-section">

          <div className="dashboard-card">

            <div className="validation-empty-state">

              <div className="empty-state-icon">
                ◫
              </div>

              <div>
                <h3>
                  No dataset selected
                </h3>

                <p>
                  Upload a CSV above to
                  automatically generate
                  exploratory data analysis.
                </p>
              </div>

            </div>

          </div>

        </section>

      )}


      {/* LOADING */}

      {loadingEDA && (

        <section className="dashboard-section">

          <div className="training-state">

            <div className="spinner"></div>

            <div>
              <strong>
                Analyzing dataset
              </strong>

              <p>
                DataGuardian is generating
                exploratory statistics.
              </p>
            </div>

          </div>

        </section>

      )}


      {/* ERROR */}

      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}


      {/* EDA */}

      {eda && !loadingEDA && (
        <>

          {/* OVERVIEW */}

          <section className="dashboard-section">

            <div className="section-title">

              <div>
                <span className="section-label">
                  EXPLORATORY DATA ANALYSIS
                </span>

                <h2>
                  Dataset Overview
                </h2>
              </div>

            </div>


            <div className="eda-stat-grid">

              <div className="eda-stat-card">
                <span>Rows</span>
                <strong>
                  {eda.rows}
                </strong>
                <small>
                  dataset records
                </small>
              </div>

              <div className="eda-stat-card">
                <span>Columns</span>
                <strong>
                  {eda.columns}
                </strong>
                <small>
                  total features
                </small>
              </div>

              <div className="eda-stat-card">
                <span>Missing</span>
                <strong>
                  {eda.total_missing}
                </strong>
                <small>
                  {eda.missing_percentage}% of cells
                </small>
              </div>

              <div className="eda-stat-card">
                <span>Duplicates</span>
                <strong>
                  {eda.duplicate_rows}
                </strong>
                <small>
                  duplicate rows
                </small>
              </div>

              <div className="eda-stat-card">
                <span>Numeric</span>
                <strong>
                  {eda.numeric_column_count}
                </strong>
                <small>
                  numeric features
                </small>
              </div>

              <div className="eda-stat-card">
                <span>Categorical</span>
                <strong>
                  {eda.categorical_column_count}
                </strong>
                <small>
                  categorical features
                </small>
              </div>

              <div className="eda-stat-card">
                <span>Date / Time</span>

                <strong>
                  {eda.datetime_column_count}
                </strong>

                <small>
                  temporal features
                </small>
              </div>

            </div>

          </section>

          {eda.preview?.length > 0 && (

            <section className="dashboard-section">

              <div className="dashboard-card">

                <div className="eda-card-header">

                  <div>
                    <span className="section-label">
                      DATASET SAMPLE
                    </span>

                    <h2>
                      Data Preview
                    </h2>

                    <p>
                      First {eda.preview.length} rows
                      from the uploaded dataset.
                    </p>
                  </div>

                  <div className="status-badge">
                    Preview
                  </div>

                </div>

                <div className="preview-table-wrapper">

                  <table className="preview-table">

                    <thead>
                      <tr>

                        {Object.keys(
                          eda.preview[0]
                        ).map((column) => (

                          <th key={column}>
                            {column}
                          </th>

                        ))}

                      </tr>
                    </thead>

                    <tbody>

                      {eda.preview.map(
                        (row, rowIndex) => (

                          <tr key={rowIndex}>

                            {Object.keys(
                              eda.preview[0]
                            ).map((column) => {

                              const value =
                                row[column];

                              return (
                                <td key={column}>

                                  {value === null ? (

                                    <span className="preview-missing">
                                      Missing
                                    </span>

                                  ) : (

                                    formatPreviewValue(
                                      value
                                    )

                                  )}

                                </td>
                              );

                            })}

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </section>

          )}


          {eda.datetime_columns?.length > 0 && (

            <section className="dashboard-section">

              <div className="dashboard-card">

                <div className="eda-card-header">

                  <div>
                    <span className="section-label">
                      TEMPORAL DATA
                    </span>

                    <h2>
                      Date & Time Columns
                    </h2>

                    <p>
                      Date-like features detected automatically
                      from the uploaded dataset.
                    </p>
                  </div>

                </div>

                <div className="date-summary-grid">

                  {eda.datetime_columns.map(
                    (column) => {

                      const summary =
                        eda.datetime_summary?.[
                        column
                        ];

                      return (
                        <div
                          className="date-summary-card"
                          key={column}
                        >

                          <span>
                            {column}
                          </span>

                          {summary && (
                            <>
                              <div>
                                <small>
                                  Earliest
                                </small>

                                <strong>
                                  {new Date(
                                    summary.min
                                  ).toLocaleDateString()}
                                </strong>
                              </div>

                              <div>
                                <small>
                                  Latest
                                </small>

                                <strong>
                                  {new Date(
                                    summary.max
                                  ).toLocaleDateString()}
                                </strong>
                              </div>

                              <div>
                                <small>
                                  Unique
                                </small>

                                <strong>
                                  {summary.unique}
                                </strong>
                              </div>
                            </>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </section>

          )}

          {/* NUMERIC */}

          {eda.numeric_columns?.length > 0 && (

            <section className="dashboard-section">

              <div className="dashboard-card">

                <div className="eda-card-header">

                  <div>
                    <span className="section-label">
                      NUMERIC ANALYSIS
                    </span>

                    <h2>
                      Feature Distribution
                    </h2>
                  </div>


                  <select
                    className="eda-select"
                    value={selectedNumeric}
                    onChange={(e) =>
                      setSelectedNumeric(
                        e.target.value
                      )
                    }
                  >

                    {eda.numeric_columns.map(
                      (column) => (
                        <option
                          key={column}
                          value={column}
                        >
                          {column}
                        </option>
                      )
                    )}

                  </select>

                </div>


                {numericStats && (

                  <div className="numeric-stat-grid">

                    <div>
                      <span>Mean</span>
                      <strong>
                        {numericStats.mean}
                      </strong>
                    </div>

                    <div>
                      <span>Median</span>
                      <strong>
                        {numericStats.median}
                      </strong>
                    </div>

                    <div>
                      <span>Std Dev</span>
                      <strong>
                        {numericStats.std}
                      </strong>
                    </div>

                    <div>
                      <span>Minimum</span>
                      <strong>
                        {numericStats.min}
                      </strong>
                    </div>

                    <div>
                      <span>Maximum</span>
                      <strong>
                        {numericStats.max}
                      </strong>
                    </div>

                  </div>

                )}


                <div className="eda-chart">

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <BarChart
                      data={histogramData}
                      margin={{
                        top: 15,
                        right: 20,
                        left: 0,
                        bottom: 40,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="range"
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        height={70}
                        tick={{
                          fontSize: 9
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 10
                        }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        fill="#506bc6"
                        radius={[5, 5, 0, 0]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </section>

          )}


          {/* CATEGORICAL */}

          {eda.categorical_columns?.length > 0 && (

            <section className="dashboard-section">

              <div className="dashboard-card">

                <div className="eda-card-header">

                  <div>
                    <span className="section-label">
                      CATEGORICAL ANALYSIS
                    </span>

                    <h2>
                      Category Distribution
                    </h2>
                  </div>


                  <select
                    className="eda-select"
                    value={
                      selectedCategorical
                    }
                    onChange={(e) =>
                      setSelectedCategorical(
                        e.target.value
                      )
                    }
                  >

                    {eda.categorical_columns.map(
                      (column) => (
                        <option
                          key={column}
                          value={column}
                        >
                          {column}
                        </option>
                      )
                    )}

                  </select>

                </div>


                <div className="eda-chart">

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <BarChart
                      data={categoricalData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 25,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="value"
                        tick={{
                          fontSize: 10
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 10
                        }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        fill="#6d59c9"
                        radius={[5, 5, 0, 0]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </section>

          )}


          {/* CORRELATION */}

          {Object.keys(
            eda.correlation || {}
          ).length > 0 && (

              <section className="dashboard-section">

                <div className="dashboard-card">

                  <div className="eda-card-header">

                    <div>
                      <span className="section-label">
                        RELATIONSHIPS
                      </span>

                      <h2>
                        Correlation Heatmap
                      </h2>

                      <p>
                        Pearson correlation between numeric features.
                        Stronger colors indicate stronger relationships.
                      </p>
                    </div>

                  </div>

                  <div className="correlation-legend">

                    <div className="legend-item">
                      <span className="legend-box negative-strong"></span>
                      <span>Strong negative</span>
                    </div>

                    <div className="legend-item">
                      <span className="legend-box neutral"></span>
                      <span>Weak / none</span>
                    </div>

                    <div className="legend-item">
                      <span className="legend-box positive-strong"></span>
                      <span>Strong positive</span>
                    </div>

                  </div>

                  <div className="correlation-wrapper">

                    <table className="correlation-table correlation-heatmap">

                      <thead>
                        <tr>

                          <th>
                            Feature
                          </th>

                          {Object.keys(
                            eda.correlation
                          ).map((column) => (
                            <th key={column}>
                              {column}
                            </th>
                          ))}

                        </tr>
                      </thead>

                      <tbody>

                        {Object.entries(
                          eda.correlation
                        ).map(([row, values]) => (

                          <tr key={row}>

                            <th>
                              {row}
                            </th>

                            {Object.keys(
                              eda.correlation
                            ).map((column) => {

                              const value =
                                values[column];

                              return (
                                <td
                                  key={column}
                                  style={
                                    getCorrelationStyle(
                                      value
                                    )
                                  }
                                  className={
                                    row === column
                                      ? "correlation-diagonal"
                                      : ""
                                  }
                                  title={
                                    value === null
                                      ? `${row} vs ${column}: unavailable`
                                      : `${row} vs ${column}: ${value}`
                                  }
                                >
                                  {value === null
                                    ? "—"
                                    : Number(value).toFixed(2)}
                                </td>
                              );

                            })}

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                  <div className="correlation-note">
                    <span>ⓘ</span>
                    Correlation ranges from -1 to +1.
                    Values closer to either extreme indicate a stronger
                    linear relationship.
                  </div>

                </div>

              </section>

            )}

        </>
      )}

    </>
  );
}