import React, {
    useEffect,
    useState,
  } from "react";
  
  import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
  } from "recharts";
  
  import {
    fetchMLflowRuns
  } from "../api";
  
  
  export default function MLflowRuns({
    refreshKey
  }) {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] =
      useState(true);
    const [error, setError] =
      useState("");
  
    useEffect(() => {
  
      const loadRuns = async () => {
        try {
          setLoading(true);
          setError("");
  
          const data =
            await fetchMLflowRuns();
  
          setRuns(data);
  
        } catch (err) {
          console.error(err);
  
          setError(
            err?.response?.data?.error ||
            "Unable to load MLflow runs."
          );
  
        } finally {
          setLoading(false);
        }
      };
  
      loadRuns();
  
    }, [refreshKey]);
  
  
    if (loading) {
      return (
        <div className="training-state">
          <div className="spinner"></div>
  
          <div>
            <strong>
              Loading MLflow runs
            </strong>
  
            <p>
              Reading experiment history.
            </p>
          </div>
        </div>
      );
    }
  
  
    if (error) {
      return (
        <div className="message error-message">
          {error}
        </div>
      );
    }
  
  
    if (!runs.length) {
      return (
        <div className="validation-empty-state">
  
          <div className="empty-state-icon">
            ◈
          </div>
  
          <div>
            <h3>
              No MLflow runs yet
            </h3>
  
            <p>
              Train a model to create the
              first experiment run.
            </p>
          </div>
  
        </div>
      );
    }
  
  
    const classificationRuns =
      runs.filter(
        run =>
          run.problem_type ===
          "classification"
      );
  
  
    const chartData =
      [...classificationRuns]
        .reverse()
        .map((run, index) => ({
          name: `Run ${index + 1}`,
          accuracy:
            run.metrics?.accuracy,
          f1:
            run.metrics?.f1_score,
        }));
  
  
    return (
      <div className="mlflow-section">
  
        <div className="logs-header">
  
          <div>
            <h3>
              Experiment History
            </h3>
  
            <p>
              MLflow-tracked model runs
              from the DataGuardian experiment.
            </p>
          </div>
  
          <span className="run-count">
            {runs.length} run
            {runs.length === 1 ? "" : "s"}
          </span>
  
        </div>
  
  
        {chartData.length > 0 && (
  
          <div className="quality-chart">
  
            <ResponsiveContainer
              width="100%"
              height={260}
            >
  
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: -10,
                  bottom: 10,
                }}
              >
  
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />
  
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10
                  }}
                />
  
                <YAxis
                  domain={[0, 1]}
                  tick={{
                    fontSize: 10
                  }}
                />
  
                <Tooltip />
  
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#506bc6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
  
                <Line
                  type="monotone"
                  dataKey="f1"
                  stroke="#6d59c9"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
  
              </LineChart>
  
            </ResponsiveContainer>
  
          </div>
  
        )}
  
  
        <div className="logs-table-wrapper">
  
          <table className="logs-table">
  
            <thead>
              <tr>
                <th>Run</th>
                <th>Model</th>
                <th>Target</th>
                <th>Type</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1</th>
                <th>R²</th>
                <th>Status</th>
              </tr>
            </thead>
  
            <tbody>
  
              {runs.map((run) => (
  
                <tr key={run.run_id}>
  
                  <td>
                    <span className="filename-cell">
                      {run.run_name}
                    </span>
                  </td>
  
                  <td>
                    {run.model || "—"}
                  </td>
  
                  <td>
                    {run.target_column || "—"}
                  </td>
  
                  <td>
                    {run.problem_type || "—"}
                  </td>
  
                  <td>
                    {run.metrics?.accuracy ??
                      "—"}
                  </td>
  
                  <td>
                    {run.metrics?.precision ??
                      "—"}
                  </td>
  
                  <td>
                    {run.metrics?.recall ??
                      "—"}
                  </td>
  
                  <td>
                    {run.metrics?.f1_score ??
                      "—"}
                  </td>
  
                  <td>
                    {run.metrics?.r2 ??
                      "—"}
                  </td>
  
                  <td>
                    <span
                      className={
                        run.status ===
                        "FINISHED"
                          ? "table-score table-score-good"
                          : "table-score table-score-medium"
                      }
                    >
                      {run.status}
                    </span>
                  </td>
  
                </tr>
  
              ))}
  
            </tbody>
  
          </table>
  
        </div>
  
      </div>
    );
  }