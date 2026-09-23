import React, { useEffect, useState } from "react";
import { fetchLogs } from "../api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function LogsTable() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs().then(setLogs).catch(console.error);
  }, []);

  if (!logs.length) return <p>No logs yet</p>;

  const chartData = logs.map((l) => ({
    name: new Date(l.timestamp).toLocaleString(),
    score: l.data_quality_score,
  }));

  return (
    <div className="logs-section">
      <h3>Past Runs</h3>

      <LineChart width={700} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="score"
        stroke="#4CAF50"
        strokeWidth={3}
        dot={{ r: 5 }}
        activeDot={{ r: 8 }}
      />
     </LineChart>


      <table border="1">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Filename</th>
            <th>Rows</th>
            <th>Quality Score</th>
            <th>Runtime (s)</th>
            <th>Missing Fixed</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.timestamp).toLocaleString()}</td>
              <td>{l.filename}</td>
              <td>{l.rows}</td>
              <td>{l.data_quality_score}</td>
              <td>{l.runtime_seconds}</td>
              <td>{l.missing_fixed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
