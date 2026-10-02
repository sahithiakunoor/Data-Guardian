import React from "react";


// ScoreCard.js
export function ScoreCard({ score = 100 })  {
  const numericScore = Number(score);

  let status = "Excellent";
  let statusClass = "score-excellent";
  if (
    score === null ||
    score === undefined
  ) {
    return (
      <div className="quality-score-card">
  
        <div className="quality-score-header">
  
          <div>
            <span>
              Overall Score
            </span>
  
            <h3>
              Data Health
            </h3>
          </div>
  
        </div>
  
        <div className="score-description">
  
          <strong>
            Not evaluated
          </strong>
  
          <p>
            Run validation to calculate
            the dataset quality score.
          </p>
  
        </div>
  
      </div>
    );
  }
  
  if (numericScore < 70) {
    status = "Needs Attention";
    statusClass = "score-poor";
  } else if (numericScore < 90) {
    status = "Good";
    statusClass = "score-good";
  }

  return (
    <div className={`quality-score-card ${statusClass}`}>

      <div className="quality-score-header">
        <div>
          <span>Overall Score</span>
          <h3>Data Health</h3>
        </div>

        <div className="quality-status">
          {status}
        </div>
      </div>

      <div className="quality-score-body">

        <div
          className="score-ring"
          style={{
            background: `conic-gradient(
              currentColor ${numericScore * 3.6}deg,
              #edf1f6 0deg
            )`,
          }}
        >
          <div className="score-ring-inner">
          <strong>
            {Number.isInteger(numericScore)
              ? numericScore
              : numericScore.toFixed(1)}%
          </strong>
            <span>quality</span>
          </div>
        </div>

        <div className="score-description">
          <strong>
            {numericScore >= 90
              ? "Dataset is healthy"
              : numericScore >= 70
              ? "Minor issues detected"
              : "Data quality issues detected"}
          </strong>

          <p>
            Based on the latest validation run.
          </p>
        </div>

      </div>
    </div>
  );
}