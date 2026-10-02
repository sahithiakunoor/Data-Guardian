# DataGuardian

DataGuardian is a full-stack data quality and machine learning platform that helps users move from a raw CSV dataset to exploratory analysis, data validation, remediation, model training, and experiment tracking in one workflow.

The application is built with React, Flask, pandas, scikit-learn, SQLite, and MLflow.

---

## Overview

Data science workflows often require switching between notebooks, scripts, validation tools, visualization tools, and experiment trackers.

DataGuardian brings these steps together into one application.

A user can:

1. Upload a CSV dataset.
2. Explore the dataset.
3. Check its data quality.
4. Automatically handle missing values.
5. Review a data quality score.
6. Select a target column.
7. Train a machine learning model.
8. Track experiments with MLflow.
9. Review historical pipeline runs.

The uploaded dataset remains active across pages and can be restored after a browser refresh.

---

## Main Features

### Dashboard — Exploratory Data Analysis

The Dashboard provides an overview of the active dataset, including:

- Number of rows and columns
- Missing-value count
- Duplicate-row count
- Numeric, categorical, and datetime columns
- Data preview
- Numeric feature distributions
- Categorical value distributions
- Correlation matrix

---

### Data Quality

The Data Quality module runs the dataset through a validation and remediation pipeline.

Current checks include:

- Missing values
- Constant columns
- Column data types
- Numeric anomalies
- Duplicate handling

The application also performs automatic missing-value remediation.

After validation, DataGuardian displays:

- Data quality score
- Missing values before remediation
- Missing values after remediation
- Number of values fixed
- Rows preserved
- Validation details by column

Validation results are persisted so they remain available after navigating between pages or refreshing the browser.

---

### Machine Learning

The Machine Learning module allows users to train models using the active dataset.

The workflow is:

```text
Select target column
        ↓
Detect problem type
        ↓
Classification / Regression
        ↓
Select compatible model
        ↓
Train model
        ↓
Evaluate performance
        ↓
Track experiment in MLflow
```

Currently supported models include:

#### Classification

- Logistic Regression
- Random Forest Classifier

#### Regression

- Linear Regression
- Random Forest Regressor

Depending on the problem type, DataGuardian reports appropriate evaluation metrics.

#### Classification Metrics

- Accuracy
- Precision
- Recall
- F1 Score

#### Regression Metrics

- MAE
- RMSE
- R²

---

### MLflow Experiment Tracking

Model training runs are logged using MLflow.

Each run records information such as:

- Model
- Target column
- Problem type
- Training rows
- Testing rows
- Feature count
- Evaluation metrics
- Run timestamp

Experiment history is displayed directly in the DataGuardian interface.

---

### Pipeline Logs

Validation runs are stored in SQLite.

The Pipeline Logs page provides historical information including:

- Dataset name
- Validation timestamp
- Number of rows
- Runtime
- Missing values fixed
- Data quality score

Quality scores can also be visualized over time for different datasets.

---

## Architecture

```text
                        DataGuardian

                     React Frontend
                           │
                           │ HTTP / REST
                           ▼
                     Flask Backend
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
         EDA         Data Quality          ML
       pandas        ETL Pipeline      scikit-learn
          │                │                │
          │                ▼                ▼
          │             SQLite           MLflow
          │
          ▼
   Persistent Dataset Storage
```

---

## Tech Stack

### Frontend

- React
- JavaScript
- Axios
- Recharts
- CSS

### Backend

- Python
- Flask
- Flask-CORS

### Data Processing

- pandas
- NumPy

### Machine Learning

- scikit-learn
- Logistic Regression
- Linear Regression
- Random Forest

### Experiment Tracking

- MLflow

### Storage

- CSV
- JSON
- SQLite

---

## Project Structure

```text
data-guardian/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   │
│   ├── datasets/
│   │   ├── __init__.py
│   │   └── store.py
│   │
│   ├── eda/
│   │   └── analyzer.py
│   │
│   ├── etl/
│   │   ├── extract.py
│   │   ├── transform.py
│   │   ├── impute.py
│   │   └── load.py
│   │
│   ├── ml/
│   │   └── trainer.py
│   │
│   ├── utils/
│   │   ├── logger.py
│   │   └── monitor.py
│   │
│   └── data/
│       └── datasets/
│
├── frontend/
│   ├── public/
│   │
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── api.js
│       ├── App.js
│       └── App.css
│
├── .gitignore
└── README.md
```

---

## Application Workflow

```text
Upload CSV
    │
    ▼
Persistent Dataset Storage
    │
    ├───────────────┬────────────────┐
    │               │                │
    ▼               ▼                ▼
Dashboard       Data Quality     Machine Learning
EDA             Validation       Target Selection
                    │                │
                    ▼                ▼
               Auto-Fix         Problem Detection
                    │                │
                    ▼                ▼
              Quality Score     Model Selection
                                     │
                                     ▼
                                Model Training
                                     │
                                     ▼
                                Evaluation
                                     │
                                     ▼
                                   MLflow
```

---

## Core API Endpoints

### Dataset Management

```text
POST /datasets
GET  /datasets/<dataset_id>
```

### Exploratory Data Analysis

```text
GET /datasets/<dataset_id>/eda
```

### Data Quality

```text
POST /datasets/<dataset_id>/validate
GET  /datasets/<dataset_id>/validation/latest
```

### Machine Learning

```text
POST /datasets/<dataset_id>/problem-type
POST /datasets/<dataset_id>/train
GET  /datasets/<dataset_id>/ml/latest
```

### Experiment Tracking

```text
GET /mlflow_runs
```

### Pipeline History

```text
GET /logs
```

---

## Data Persistence

DataGuardian stores each uploaded dataset using a unique dataset ID.

A dataset directory can contain:

```text
backend/data/datasets/<dataset_id>/
│
├── dataset.csv
├── metadata.json
├── latest_validation.json
└── latest_ml.json
```

This allows the application to restore:

- The active dataset
- The latest validation result
- The latest machine learning result

The active dataset ID is also stored in the browser so it can be restored after refresh.

---

## Data Quality Scoring

The current quality score is calculated using missing values and detected anomalies.

Conceptually:

```text
Quality Score
=
100 ×
(
1 -
(missing values + anomalies)
/
(rows × columns)
)
```

The score describes the quality of the dataset before automatic remediation.

Remediation results are shown separately so users can see both the original quality issues and the improvements made by the pipeline.

---

## Missing-Value Remediation

The ETL pipeline automatically handles missing values before the cleaned dataset is loaded.

The Data Quality page reports:

```text
Before Auto-Fix
After Auto-Fix
Values Fixed
Rows Preserved
```

This makes the remediation process visible instead of silently modifying the dataset.

---

## Machine Learning Workflow

The user first selects a target column.

DataGuardian then determines whether the target represents a classification or regression problem.

For example:

```text
Target: churn

Detected Problem:
Classification

Available Models:
- Logistic Regression
- Random Forest Classifier
```

For a continuous target:

```text
Target: customer_satisfaction

Detected Problem:
Regression

Available Models:
- Linear Regression
- Random Forest Regressor
```

The selected model is then trained using a scikit-learn pipeline.

---

## ML Preprocessing

The machine learning pipeline handles numeric and categorical features separately.

Numeric features use:

- Median imputation

Categorical features use:

- Most-frequent-value imputation
- One-hot encoding

The preprocessing steps and model are combined using a scikit-learn `Pipeline`.

This allows training to work with mixed numeric and categorical datasets without requiring the user to manually preprocess the data.

---

## Running the Project Locally

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd data-guardian
```

---

### 2. Start the Backend

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the environment on macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start Flask:

```bash
python app.py
```

The backend should run at:

```text
http://127.0.0.1:5000
```

---

### 3. Start the Frontend

Open another terminal and move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend should run at:

```text
http://localhost:3000
```

---

### 4. Start MLflow UI

From the backend environment, start MLflow with:

```bash
mlflow ui
```

The MLflow interface is typically available at:

```text
http://127.0.0.1:5001
```

---

## Example Usage

A typical DataGuardian workflow is:

1. Upload a CSV file.
2. Review the dataset overview on the Dashboard.
3. Inspect numeric and categorical distributions.
4. Review the correlation matrix.
5. Open the Data Quality page.
6. Run validation.
7. Review missing values, anomalies, and data types.
8. Review automatic remediation results.
9. Check the data quality score.
10. Open the Machine Learning page.
11. Select a target column.
12. Review the detected problem type.
13. Select a compatible machine learning model.
14. Train the model.
15. Review model metrics.
16. Inspect the run in MLflow.
17. Open Pipeline Logs to review previous validation runs.

---

## Current Status

### Implemented

- CSV dataset upload
- Persistent dataset storage
- Active dataset state across pages
- Dataset restoration after browser refresh
- Exploratory data analysis
- Data preview
- Missing-value analysis
- Duplicate detection
- Numeric distributions
- Categorical distributions
- Datetime detection
- Correlation matrix
- Data quality validation
- Missing-value remediation
- Data quality scoring
- Persistent validation results
- Pipeline validation history
- Data quality trend visualization
- Classification and regression detection
- User-selectable machine learning models
- Logistic Regression
- Random Forest Classifier
- Linear Regression
- Random Forest Regressor
- Classification metrics
- Regression metrics
- MLflow experiment tracking
- Persistent latest ML result

### Planned Improvements

- Side-by-side model comparison
- Additional machine learning algorithms
- Feature importance
- Model explainability
- Additional validation rules
- Outlier remediation options
- Model artifact persistence
- Automated testing
- Docker deployment
- Cloud deployment
- Authentication and multi-user support

---

## Design Goals

DataGuardian was designed around a few core ideas:

### Reusable Dataset State

The user should not need to upload the same dataset separately on every page.

### Transparent Data Cleaning

Data remediation should be visible to the user instead of happening silently.

### Integrated ML Workflow

Users should be able to move from data validation to model training without switching tools.

### Experiment Reproducibility

MLflow is used to maintain a history of machine learning experiments and metrics.

### End-to-End Application Design

The project combines frontend development, backend APIs, ETL processing, data quality monitoring, machine learning, persistence, and experiment tracking in one application.

---

## Future Direction

DataGuardian is being developed toward a more complete intelligent data workflow platform.

Future versions may include:

- Automatic comparison of multiple models
- Feature importance visualization
- SHAP-based model explainability
- Custom data validation rules
- Configurable remediation strategies
- Model versioning
- Dataset versioning
- Cloud-based storage
- Containerized deployment
- CI/CD integration

---

## Author

**Sahithi Akunoor**

Master's in Engineering Data Science  
University of Houston

---

## Project Purpose

DataGuardian was developed as a portfolio project to demonstrate practical experience across:

- Data science
- Machine learning
- Data engineering
- ETL pipelines
- Data quality monitoring
- Experiment tracking
- REST API development
- React frontend development
- Full-stack application architecture

The goal is to demonstrate how multiple stages of a real-world data workflow can be integrated into a single usable application.