import axios from "axios";

const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000/tasks";
  
  // Ensure the URL ends with /tasks to prevent fetching the plain-text status page
  if (url && !url.endsWith("/tasks") && !url.endsWith("/tasks/")) {
    url = url.endsWith("/") ? `${url}tasks` : `${url}/tasks`;
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname;
    const isLocal = host === "localhost" || 
                    host === "127.0.0.1" || 
                    host.startsWith("192.168.") || 
                    host.startsWith("10.") || 
                    host.startsWith("172.16.") || 
                    host.endsWith(".local");
                    
    if (isLocal && typeof window !== "undefined" && window.location.hostname) {
      parsedUrl.hostname = window.location.hostname;
      url = parsedUrl.toString();
    }
  } catch (e) {
    if (typeof window !== "undefined" && window.location.hostname) {
      url = `http://${window.location.hostname}:5000/tasks`;
    }
  }
  return url;
};

const API_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: API_URL
});

// Inject authentication token into all requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("taskpilot_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getTasks = () => {
  return apiClient.get("/");
};

export const addTask = (task) => {
  return apiClient.post("/", task);
};

export const updateTask = (id, taskData) => {
  return apiClient.put(`/${id}`, taskData);
};

export const deleteTask = (id) => {
  return apiClient.delete(`/${id}`);
};