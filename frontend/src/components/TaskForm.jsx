import { useState } from "react";
import Swal from "sweetalert2";
import { addTask } from "../services/taskService";

function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");

  const handleSubmit = async () => {
    if (!title.trim()) {
      await Swal.fire({
  icon: "error",
  title: "Validation Error",
  text: "Title is required",
});

      return;
    }

    if (description.length < 20) {
      await Swal.fire({
  icon: "warning",
  title: "Description Too Short",
  text: "Description must be at least 20 characters",
});
      return;
    }

    const task = {
      title,
      description,
      status,
    };

    await addTask(task);

await Swal.fire({
  icon: "success",
  title: "Task Added",
  text: "Task created successfully!",
  timer: 2000,
  showConfirmButton: false,
});

if (onTaskAdded) {
  onTaskAdded();
}
setTitle("");
setDescription("");
setStatus("Pending");


    // Clear Form
    setTitle("");
    setDescription("");
    setStatus("Pending");

    if (onTaskAdded) {
  onTaskAdded();
}
  };

  return (
    <div className="card p-4 mb-4">
      <h2 className="text-center mb-4">Add Task</h2>

      

      <input
        className="form-control mb-3"
        type="text"
        placeholder="Enter Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="form-control mb-3"
        rows="4"
        placeholder="Enter Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        className="form-select mb-3"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
      </select>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
      >
        Add Task
      </button>
    </div>
  );
}

export default TaskForm;