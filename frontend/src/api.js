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
