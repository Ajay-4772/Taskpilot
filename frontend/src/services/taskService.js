import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Read tasks directly from Firestore filtered by user's UID
export const getTasks = async (uid) => {
  if (!uid) throw new Error("User UID is required to fetch tasks.");
  const q = query(
    collection(db, "tasks"),
    where("uid", "==", uid)
  );
  
  const querySnapshot = await getDocs(q);
  const tasks = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    tasks.push({ 
      _id: docSnap.id, 
      id: docSnap.id, 
      ...data 
    });
  });
  
  return { data: tasks };
};

// Create task in Firestore attaching the user's UID
export const addTask = async (uid, taskData) => {
  if (!uid) throw new Error("User UID is required to add a task.");
  
  const payload = {
    uid,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status || "Pending",
    priority: taskData.priority || "Low",
    dueDate: taskData.dueDate ? (taskData.dueDate instanceof Date ? taskData.dueDate.toISOString() : taskData.dueDate) : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const docRef = await addDoc(collection(db, "tasks"), payload);
  return docRef;
};

// Edit task in Firestore
export const updateTask = async (taskId, taskData) => {
  if (!taskId) throw new Error("Task ID is required to update a task.");
  const docRef = doc(db, "tasks", taskId);
  
  const payload = {
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    priority: taskData.priority,
    dueDate: taskData.dueDate ? (taskData.dueDate instanceof Date ? taskData.dueDate.toISOString() : taskData.dueDate) : null,
    updatedAt: new Date().toISOString()
  };
  
  await updateDoc(docRef, payload);
};

// Remove task in Firestore
export const deleteTask = async (taskId) => {
  if (!taskId) throw new Error("Task ID is required to delete a task.");
  const docRef = doc(db, "tasks", taskId);
  await deleteDoc(docRef);
};