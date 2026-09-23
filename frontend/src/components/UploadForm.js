import React, { useState } from "react";
import { runETL } from "../api";

export default function UploadForm({ onResult }) {
  const [path, setPath] = useState("data/sample_data.csv");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const data = await runETL(path);
      onResult(data);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form">
      <h3>Run ETL Validation</h3>
      <input
        type="text"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder="Enter CSV path"
      />
      <button onClick={handleRun} disabled={loading}>
        {loading ? "Running..." : "Run Validation"}
      </button>
    </div>
  );
}
