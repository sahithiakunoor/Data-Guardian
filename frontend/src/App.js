import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import ValidationReport from "./components/ValidationReport";
import LogsTable from "./components/LogsTable";
import ScoreCard from "./components/ScoreCard";
import MLTrainer from "./components/MLTrainer";

export default function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="App" style={{ padding: 20 }}>
      <h2>🧠 DataGuardian Dashboard</h2>
      <UploadForm onResult={setResult} />
      <ValidationReport
        report={result?.validation_summary}
        score={result?.validation_summary
          ? 100 - (Object.keys(result.validation_summary.missing_values || {}).length * 10)
          : 100}
      />
      <LogsTable />
      <ScoreCard score={result?.validation_summary?.data_quality_score ?? 100} />
      <MLTrainer />
    </div>
    
  );
}
