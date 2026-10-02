import React, {
  useState,
} from "react";

import MLTrainer from "../components/MLTrainer";
import MLflowRuns from "../components/MLflowRuns";


export default function MachineLearningPage() {
  const [refreshKey, setRefreshKey] =
    useState(0);

  return (
    <>
      <header className="topbar">

        <div>
          <span className="page-eyebrow">
            MACHINE LEARNING
          </span>

          <h1>
            Machine Learning
          </h1>

          <p>
            Train models and evaluate
            experiment performance.
          </p>
        </div>

        <div className="topbar-badge">
          ML
        </div>

      </header>


      <MLTrainer
        onTrainingComplete={() =>
          setRefreshKey(
            previous =>
              previous + 1
          )
        }
      />


      <section className="dashboard-section">

        <div className="dashboard-card">

          <span className="section-label">
            EXPERIMENT TRACKING
          </span>

          <h2>
            MLflow Experiments
          </h2>

          <p className="placeholder-text">
            Compare model runs and track
            performance over time.
          </p>

          <MLflowRuns
            refreshKey={refreshKey}
          />

        </div>

      </section>

    </>
  );
}