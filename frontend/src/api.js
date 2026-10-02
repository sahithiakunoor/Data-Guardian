import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";


export const runETL = async (file) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("auto_fix", "true");

  const response = await axios.post(
    `${API_BASE}/run_etl`,
    formData
  );

  return response.data;
};


export const fetchLogs = async () => {
  const response = await axios.get(
    `${API_BASE}/logs`
  );

  return response.data;
};


export const getDatasetColumns = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(
    `${API_BASE}/dataset_columns`,
    formData
  );

  return response.data;
};


export const trainMLModel = async (
  file,
  targetColumn
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "target_column",
    targetColumn
  );

  const response = await axios.post(
    `${API_BASE}/train_model`,
    formData
  );

  return response.data;
};


export const getEDA = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(
    `${API_BASE}/eda`,
    formData
  );

  return response.data;
};


export const fetchMLflowRuns = async () => {
  const response = await axios.get(
    `${API_BASE}/mlflow_runs`
  );

  return response.data;
};

export const uploadDataset = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(
    `${API_BASE}/datasets`,
    formData
  );

  return response.data;
};


export const fetchDataset = async (
  datasetId
) => {
  const response = await axios.get(
    `${API_BASE}/datasets/${datasetId}`
  );

  return response.data;
};

export const getDatasetEDA = async (
  datasetId
) => {
  const response = await axios.get(
    `${API_BASE}/datasets/${datasetId}/eda`
  );

  return response.data;
};


export const validateDataset = async (
  datasetId
) => {
  const response = await axios.post(
    `${API_BASE}/datasets/${datasetId}/validate`
  );

  return response.data;
};


export const fetchLatestValidation = async (
  datasetId
) => {
  const response = await axios.get(
    `${API_BASE}/datasets/${datasetId}/validation/latest`
  );

  return response.data.result;
};


export const trainDataset = async (
  datasetId,
  targetColumn,
  modelName
) => {
  const response = await axios.post(
    `${API_BASE}/datasets/${datasetId}/train`,
    {
      target_column: targetColumn,
      model_name: modelName,
    }
  );

  return response.data;
};


export const fetchLatestMLResult = async (
  datasetId
) => {
  const response = await axios.get(
    `${API_BASE}/datasets/${datasetId}/ml/latest`
  );

  return response.data.result;
};

export const getProblemType = async (
  datasetId,
  targetColumn
) => {
  const response = await axios.post(
    `${API_BASE}/datasets/${datasetId}/problem-type`,
    {
      target_column: targetColumn
    }
  );

  return response.data;
};