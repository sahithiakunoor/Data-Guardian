import React, {
  useEffect,
  useMemo,
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
  Legend,
} from "recharts";

import {
  fetchLogs
} from "../api";


const datasetColors = [
  "#506bc6",
  "#6d59c9",
  "#2f9e7d",
  "#d97706",
  "#d74957",
];


export default function LogsTable() {
  const [logs, setLogs] = useState([]);

  const [
    selectedDataset,
    setSelectedDataset,
  ] = useState("all");


  useEffect(() => {
    fetchLogs()
      .then(setLogs)
      .catch(console.error);
  }, []);


  const formatChartTime = (timestamp) => {
    const date = new Date(timestamp);

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };


  const datasets = useMemo(() => {
    return [
      ...new Set(
        logs
          .map(log => log.filename)
          .filter(Boolean)
      )
    ];
  }, [logs]);


  /*
   * Single-dataset chart
   * oldest -> newest
   */
  const chartData = useMemo(() => {
    if (selectedDataset === "all") {
      return [];
    }

    return [...logs]
      .reverse()
      .filter(
        log =>
          log.filename === selectedDataset
      )
      .map(log => ({
        timestamp:
          formatChartTime(
            log.timestamp
          ),

        score:
          log.data_quality_score,
      }));

  }, [logs, selectedDataset]);


  /*
   * All-datasets chart.
   *
   * Creates rows such as:
   *
   * {
   *   timestamp: "Sep 27, 4:29 PM",
   *   "sample_data.csv": 94.05
   * }
   */
  const multiDatasetChartData =
    useMemo(() => {

      if (selectedDataset !== "all") {
        return [];
      }

      const chronological =
        [...logs].reverse();

      const grouped = {};

      chronological.forEach(log => {

        const time =
          formatChartTime(
            log.timestamp
          );

        if (!grouped[time]) {
          grouped[time] = {
            timestamp: time
          };
        }

        grouped[time][log.filename] =
          log.data_quality_score;

      });

      return Object.values(grouped);

    }, [logs, selectedDataset]);


  if (!logs.length) {
    return (
      <div className="validation-empty-state">

        <div className="empty-state-icon">
          ≡
        </div>

        <div>
          <h3>
            No pipeline runs yet
          </h3>

          <p>
            Run validation to create your
            first pipeline log.
          </p>
        </div>

      </div>
    );
  }


  return (
    <div className="logs-section">

      {/* HEADER */}

      <div className="logs-header">

        <div>
          <h3>
            Quality History
          </h3>

          <p>
            Data quality score across previous
            pipeline executions.
          </p>
        </div>


        {/* DATASET FILTER */}

        <div className="logs-filter">

          <label htmlFor="dataset-filter">
            Dataset
          </label>

          <select
            id="dataset-filter"
            value={selectedDataset}
            onChange={
              event =>
                setSelectedDataset(
                  event.target.value
                )
            }
          >

            <option value="all">
              All datasets
            </option>

            {datasets.map(dataset => (

              <option
                key={dataset}
                value={dataset}
              >
                {dataset}
              </option>

            ))}

          </select>

        </div>

      </div>


      {/* CHART */}

      <div className="quality-chart">

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          {selectedDataset === "all" ? (

            /*
             * MULTI-DATASET CHART
             */
            <LineChart
              data={
                multiDatasetChartData
              }
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />


              <XAxis
                dataKey="timestamp"
                tick={{
                  fontSize: 10
                }}
                interval="preserveStartEnd"
              />


              <YAxis
                domain={[0, 100]}
                tick={{
                  fontSize: 10
                }}
              />


              <Tooltip />


              <Legend />


              {datasets.map(
                (dataset, index) => (

                  <Line
                    key={dataset}
                    type="monotone"
                    dataKey={dataset}

                    name={dataset}

                    stroke={
                      datasetColors[
                        index %
                        datasetColors.length
                      ]
                    }

                    strokeWidth={3}

                    dot={{
                      r: 4
                    }}

                    activeDot={{
                      r: 7
                    }}

                    connectNulls={false}

                    isAnimationActive={false}
                  />

                )
              )}

            </LineChart>

          ) : (

            /*
             * SINGLE-DATASET CHART
             */
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />


              <XAxis
                dataKey="timestamp"
                tick={{
                  fontSize: 10
                }}
                interval="preserveStartEnd"
              />


              <YAxis
                domain={[0, 100]}
                tick={{
                  fontSize: 10
                }}
              />


              <Tooltip />


              <Line
                type="monotone"

                dataKey="score"

                name={
                  selectedDataset
                }

                stroke="#506bc6"

                strokeWidth={3}

                dot={{
                  r: 4
                }}

                activeDot={{
                  r: 7
                }}

                isAnimationActive={false}
              />

            </LineChart>

          )}

        </ResponsiveContainer>

      </div>


      {/* PIPELINE HISTORY TABLE */}

      <div className="logs-table-wrapper">

        <table className="logs-table">

          <thead>

            <tr>
              <th>
                Timestamp
              </th>

              <th>
                Dataset
              </th>

              <th>
                Rows
              </th>

              <th>
                Quality
              </th>

              <th>
                Runtime
              </th>

              <th>
                Missing Fixed
              </th>
            </tr>

          </thead>


          <tbody>

            {logs.map(log => (

              <tr key={log.id}>

                <td>
                  {new Date(
                    log.timestamp
                  ).toLocaleString()}
                </td>


                <td>
                  <span className="filename-cell">
                    {log.filename}
                  </span>
                </td>


                <td>
                  {log.rows}
                </td>


                <td>

                  <span
                    className={
                      log.data_quality_score >= 90
                        ? "table-score table-score-good"
                        : log.data_quality_score >= 70
                        ? "table-score table-score-medium"
                        : "table-score table-score-bad"
                    }
                  >

                    {log.data_quality_score}%

                  </span>

                </td>


                <td>
                  {log.runtime_seconds}s
                </td>


                <td>
                  {log.missing_fixed}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}