import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

export const runETL = async (filePath) => {
  const res = await axios.post(`${API_BASE}/run_etl`, {
    source: filePath,
    auto_fix: true,
  });
  return res.data;
};

export const fetchLogs = async () => {
  const res = await axios.get(`${API_BASE}/logs`);
  return res.data;
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


export const trainMLModel = async (file, targetColumn) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_column", targetColumn);

  const response = await axios.post(
    `${API_BASE}/train_model`,
    formData
  );

  return response.data;
};
