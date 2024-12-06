import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import { API_URL } from '../Api/API_URL';

const AddTaskForm = ({ taskId, isEditing, onClose, setTasks }) => {
  const [formData, setFormData] = useState({
    taskName: '',
    taskHour: 0,
  });


  useEffect(() => {
    if (taskId) {
      axios
        .get(`${API_URL}api/tasks/${taskId}`)
        .then((response) => {
          setFormData(response.data);
        })
        .catch((error) => {
          console.error('There was an error fetching the task details!', error);
        });
    }
  }, [taskId]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'taskHour' && value < 0) {
      toast.warning('Task hours cannot be less than 0');
      return; 
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if(formData.taskHour===0){
        toast.warning('Task Hour should not be 0');
        return;
      }
      if (taskId) {
        response = await axios.put(`${API_URL}api/tasks/${taskId}`, formData);
      } else {
        response = await axios.post(`${API_URL}api/tasks`, formData);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(taskId ? 'Task updated successfully!' : 'Task added successfully!');
        if (onClose) onClose();
        
        setTasks((prevTasks) =>
          taskId ? prevTasks.map((task) => (task._id === taskId ? response.data : task)) : [...prevTasks, response.data]
        );
      } else {
        toast.error('Failed to save task.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error saving task.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 max-w-sm mx-auto font-[sans-serif]">
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Task Name</label>
        <input
          type="text"
          name="taskName"
          placeholder="Enter the task name"
          value={formData.taskName} 
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Task Hours</label>
        <input
          type="number"
          name="taskHour"
          placeholder="Enter task hours"
          value={formData.taskHour} 
          onChange={handleChange}
          required
          disabled={isEditing} 
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <button
        type="submit"
        className="!mt-8 px-6 py-2 w-full bg-[#333] hover:bg-[#444] text-sm text-white mx-auto block"
      >
        {taskId ? 'Save Changes' : 'Add Task'}
      </button>
    </form>
  );
};

export default AddTaskForm;
