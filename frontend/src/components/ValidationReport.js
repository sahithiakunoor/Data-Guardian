import React from "react";

export default function ValidationReport({ report }) {
  if (!report) return null;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "10px",
        padding: "20px",
        marginTop: "20px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3>Validation Summary</h3>

      <section>
        <h4>⚠️ Missing Values</h4>
        {Object.keys(report.missing_values || {}).length ? (
          <ul>
            {Object.entries(report.missing_values).map(([col, val]) => (
              <li key={col}>
                <b>{col}</b>: {val} missing
              </li>
            ))}
          </ul>
        ) : (
          <p>✅ None</p>
        )}
      </section>

      <section>
        <h4>📉 Anomalies</h4>
        {Object.keys(report.anomalies || {}).length ? (
          <ul>
            {Object.entries(report.anomalies).map(([col, val]) => (
              <li key={col}>
                <b>{col}</b>: {val} outliers
              </li>
            ))}
          </ul>
        ) : (
          <p>✅ None</p>
        )}
      </section>

      <section>
        <h4>🧬 Data Types</h4>
        <ul>
          {Object.entries(report.datatypes || {}).map(([col, dtype]) => (
            <li key={col}>
              <b>{col}</b>: {dtype}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
