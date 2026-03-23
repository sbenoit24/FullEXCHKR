import axios from "axios";
import { useAuthStore } from "../stores/authStore";

/* ---------------------------------------
   Cookie helpers
---------------------------------------- */
const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

const getAllCookies = () => {
  if (typeof document === "undefined") return {};
  return document.cookie.split("; ").reduce((acc, cookie) => {
    const [name, value] = cookie.split("=");
    acc[name] = decodeURIComponent(value);
    return acc;
  }, {});
};

/* ---------------------------------------
   XSRF Token Cache
---------------------------------------- */
let cachedXsrfToken = null;
let lastCookieCheck = 0;
const CACHE_DURATION = 50;

const getLatestXsrfToken = () => {
  const now = Date.now();
  if (now - lastCookieCheck > CACHE_DURATION) {
    cachedXsrfToken = getCookie("XSRF-TOKEN");
    lastCookieCheck = now;
  }
  return cachedXsrfToken;
};

const refreshXsrfCache = () => {
  cachedXsrfToken = getCookie("XSRF-TOKEN");
  lastCookieCheck = Date.now();
};

/* ---------------------------------------
   Axios instance
---------------------------------------- */
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

/* ---------------------------------------
   Refresh Token Handling
---------------------------------------- */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

const AUTH_EXCLUDED_PATHS = [
  "/auth/login",
  "/auth/refresh-token",
  "/api/admin/onboarding/club",
  "/api/password/reset",
];

/* ---------------------------------------
   Request Interceptor
---------------------------------------- */
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof document === "undefined") return config;

    const method = config.method?.toUpperCase();
    const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];

    // ❗ Do NOT attach CSRF token for login & auth endpoints
    if (AUTH_EXCLUDED_PATHS.some((p) => config.url?.includes(p))) {
      return config;
    }

    if (unsafeMethods.includes(method)) {
      const xsrfToken = getLatestXsrfToken();
      if (xsrfToken) {
        config.headers["X-XSRF-TOKEN"] = xsrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------------------------
   Response Interceptor
---------------------------------------- */
axiosClient.interceptors.response.use(
  (response) => {
    refreshXsrfCache();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";
    const isAuthEndpoint = AUTH_EXCLUDED_PATHS.some((p) =>
      requestUrl.includes(p)
    );

    // ❌ NEVER retry CSRF or refresh on auth endpoints
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    /* ---- 403 CSRF retry ---- */
    if (error.response.status === 403 && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      await new Promise((r) => setTimeout(r, 150));
      refreshXsrfCache();

      const fresh = getLatestXsrfToken();
      if (fresh && fresh !== originalRequest.headers["X-XSRF-TOKEN"]) {
        originalRequest.headers["X-XSRF-TOKEN"] = fresh;
        return axiosClient(originalRequest);
      }
    }

    /* ---- 401 refresh flow ---- */
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosClient(originalRequest));
      }

      isRefreshing = true;

      try {
        refreshXsrfCache();
        const xsrfToken = getLatestXsrfToken();

        const refreshConfig = { withCredentials: true };
        if (xsrfToken) {
          refreshConfig.headers = { "X-XSRF-TOKEN": xsrfToken };
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`,
          {},
          refreshConfig
        );

        await new Promise((r) => setTimeout(r, 150));
        refreshXsrfCache();
        processQueue(null);

        return axiosClient(originalRequest);
      } catch (e) {
        processQueue(e);
        useAuthStore.getState().clearUser();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
