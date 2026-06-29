import axios from "axios";
import { getBaseUrl } from "../contexts/AuthContext";

// Read tasks directly from MongoDB through Express
export const getTasks = async () => {
  const response = await axios.get(`${getBaseUrl()}/tasks`);
  // Map fields to verify consistency with client task cards (_id / id)
  const mapped = response.data.map((task) => ({
    ...task,
    _id: task._id || task.id,
    id: task._id || task.id
  }));
  return { data: mapped };
};

// Create task in MongoDB through Express
export const addTask = async (taskData) => {
  const payload = {
    title: taskData.title,
    description: taskData.description,
    status: taskData.status || "Pending",
    priority: taskData.priority || "Low",
    dueDate: taskData.dueDate || null
  };
  const response = await axios.post(`${getBaseUrl()}/tasks`, payload);
  return response.data;
};

// Edit task in MongoDB through Express
export const updateTask = async (taskId, taskData) => {
  if (!taskId) throw new Error("Task ID is required to update a task.");
  
  const payload = {
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    priority: taskData.priority,
    dueDate: taskData.dueDate || null
  };
  const response = await axios.put(`${getBaseUrl()}/tasks/${taskId}`, payload);
  return response.data;
};

// Remove task in MongoDB through Express
export const deleteTask = async (taskId) => {
  if (!taskId) throw new Error("Task ID is required to delete a task.");
  const response = await axios.delete(`${getBaseUrl()}/tasks/${taskId}`);
  return response.data;
};