import React from "react";

export default function ScoreCard({ score }) {
  if (score === undefined) return null;

  const color =
    score >= 90 ? "#4CAF50" : score >= 70 ? "#FFC107" : "#F44336";

  return (
    <div
      style={{
        textAlign: "center",
        background: "#1e1e1e",
        color: "white",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
      }}
    >
      <h3>Data Health Score</h3>
      <div
        style={{
          fontSize: "48px",
          fontWeight: "bold",
          color,
        }}
      >
        {score}%
      </div>
    </div>
  );
}
