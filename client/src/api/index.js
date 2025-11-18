import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/bpr",
  headers: {
    "Content-Type": "application/json ",
  },
});

// interceptor(just like pre and post in midd) for every requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tokenForBPR");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
  