import React from "react";
import LogsTable from "../components/LogsTable";

export default function LogsPage() {
  return (
    <>
      <header className="topbar">
        <div>
          <span className="page-eyebrow">
            PIPELINE ACTIVITY
          </span>

          <h1>Pipeline Logs</h1>

          <p>
            Review previous executions, runtime, and quality history.
          </p>
        </div>

        <div className="topbar-badge">
          History
        </div>
      </header>

      <div className="dashboard-card">
        <LogsTable />
      </div>
    </>
  );
}