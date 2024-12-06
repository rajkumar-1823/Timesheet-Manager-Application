import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { API_URL } from "../Api/API_URL";

const UpdateLogForm = ({ onClose, setLog, selectedLog }) => {
  const [formData, setFormData] = useState({
    spentHour: selectedLog?.spentHour || "",
    taskStatus: selectedLog?.taskStatus || "In Progress",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.spentHour || !formData.taskStatus) {
      toast.warning("Please fill out all fields.");
      return;
    }
  
    try {
  
      const userId = localStorage.getItem("userId");
  
      const response = await axios.put(
        `${API_URL}api/logs/${selectedLog._id}`,
        formData
      );

      if (formData.taskStatus === "Completed" && userId) {
        await axios.put(
          `${API_URL}api/users/${userId}/updateCompletedTasks`,
          { increment: 1 }
        );
      }
  
      setLog((prevLogs) =>
        prevLogs.map((log) =>
          log._id === selectedLog._id ? response.data : log
        )
      );
  
      toast.success("Log updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Error updating log entry.");
      console.error("Error:", error);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 max-w-sm mx-auto font-[sans-serif]">
      {/* Hours to Spend */}
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Hours to Spend</label>
        <input
          type="number"
          name="spentHour"
          value={formData.spentHour}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>

      {/* Task Status */}
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Task Status</label>
        <select
          name="taskStatus"
          value={formData.taskStatus}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        >
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <button
        type="submit"
        className="mt-8 px-6 py-2 w-full bg-[#333] hover:bg-[#444] text-sm text-white"
      >
        Update Log
      </button>
    </form>
  );
};

export default UpdateLogForm;
