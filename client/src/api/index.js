import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/bpr",
  headers: {
    "Content-Type": "application/json ",
  },
});
