// In dev, Vite's proxy (vite.config.js) forwards "/api" to localhost:4000.
// In production there's no proxy, so set VITE_API_URL to your deployed
// backend's URL (e.g. https://your-app.up.railway.app/api) in a .env
// file or in your hosting provider's environment variable settings.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "vitals_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (isJson && data && data.error) || "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),
  updateProfile: (payload) => request("/auth/me", { method: "PATCH", body: payload }),

  listLogs: (limit = 90) => request(`/logs?limit=${limit}`),
  createLog: (payload) => request("/logs", { method: "POST", body: payload }),
  updateLog: (id, payload) => request(`/logs/${id}`, { method: "PATCH", body: payload }),
  deleteLog: (id) => request(`/logs/${id}`, { method: "DELETE" }),

  analyticsSummary: (limit = 90) => request(`/analytics/summary?limit=${limit}`),

  /**
   * The export endpoint requires the Authorization header, so a plain
   * <a href> can't be used — fetch it as a blob and trigger the
   * browser's save dialog manually.
   */
  downloadExportCsv: async () => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/analytics/export?format=csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Could not export logs");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "health-log-export.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
