import axios from "axios";
export const API_URL = process.env.BACKEND_URL || "http://localhost:3005/api/v1";
const app_api = axios.create({
  baseURL: API_URL,
});

export default app_api;