import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../Api/API_URL';

const UserLogForm = ({ onClose, setLog }) => {
  const [formData, setFormData] = useState({
    Date: '',
    projectName: '',
    taskName: '',
    spentHour: '',
    taskStatus: '',
    user:'',
  });

  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token'); 
        const userId = localStorage.getItem('userId'); 
  
        if (!token || !userId) {
          toast.error('User not authenticated');
          return;
        }
        
        const response = await axios.get(`${API_URL}api/projects/user/${userId}`);
        
        if (response.status === 200) {
          setProjects(response.data); 
        }
      } catch (error) {
        console.error(error);
        toast.error('You are not added to any Project');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProjects();
  }, []);
  
  

  const handleClickProject = () => {
    setIsProjectOpen(!isProjectOpen);
  };

  const handleClickTask = () => {
    setIsTaskOpen(!isTaskOpen);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProjectSelect = async (project) => {
    setFormData({
      ...formData,
      projectName: project.projectName,
    });
    setIsProjectOpen(false);
  
    try {
      const projectId = project._id; 
  
      if (projectId) {
        const response = await axios.get(`${API_URL}api/project-tasks`, {
          params: { projectId },
        });
        
        const availableTasks = response.data.filter(task => task.taskStatus === 'Pending');
        
        if (availableTasks.length === 0) {
          toast.warning('No tasks available in pending status for this project');
        }
  
        setTasks(availableTasks); 
      } else {
        toast.error('No tasks available for this project');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
      toast.error('Error fetching tasks');
    }
  };
  
  

  const handleTaskSelect = (task) => {
    setFormData({
      ...formData,
      taskName: task.taskName,
    });
    setSelectedTask(task); 
    setIsTaskOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.projectName) {
      toast.warning('Please select a project.');
      return;
    }
  
    if (!formData.taskName) {
      toast.warning('Please select a task.');
      return;
    }
  

    if (selectedTask && Number(formData.spentHour) > selectedTask.taskHour) {
      toast.warning(
        `Spent hours (${formData.spentHour}) cannot exceed the task's allowed hours (${selectedTask.taskHour}).`
      );
      return;
    }
  
    if (Number(formData.spentHour) < 1 || Number(formData.spentHour) > 24) {
      toast.warning('Hours must be between 1 and 24.');
      return;
    }
  
    try {

      const userId = localStorage.getItem('userId');  

      const logResponse = await axios.post(`${API_URL}api/logs`, {
        ...formData,
        taskStatus: "In Progress",
        user: userId,  
      });
  
      setLog((prevLogs) => [...prevLogs, logResponse.data]);


      const taskResponse = await axios.put(`${API_URL}api/tasks/${selectedTask._id}`, {
        taskStatus: "In Progress",
      });
  
      if (taskResponse.status === 200) {
        toast.success('Task status updated to "In Progress".');
      } else {
        toast.warning('Task status could not be updated.');
      }
  
      onClose();
      toast.success('Log entry added successfully!');
    } catch (error) {
      toast.error('Error adding log entry or updating task status');
      console.error('Error:', error);
    }
};
  

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 max-w-sm mx-auto font-[sans-serif]">
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Date</label>
        <input
          type="date"
          name="Date"
          value={formData.Date}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>

      {/* Project Dropdown */}
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Project name</label>
        <button
          type="button"
          className="px-5 py-2.5 rounded text-white text-sm font-semibold tracking-wide bg-blue-600 hover:bg-blue-700"
          onClick={handleClickProject}
        >
          {formData.projectName || 'Select Project'}
        </button>

        {isProjectOpen && (
          <ul className="absolute block shadow-lg bg-white py-2 px-2 z-[1000] min-w-full w-max rounded max-h-96 overflow-auto">
            {loading ? (
              <li className="py-2.5 px-4 text-gray-500 text-sm">Loading...</li>
            ) : (
              projects.map((project) => (
                <li
                  key={project._id}
                  className="py-2.5 px-4 hover:bg-blue-50 text-black text-sm cursor-pointer rounded"
                  onClick={() => handleProjectSelect(project)}
                >
                  {project.projectName}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Task Dropdown */}
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Task Name</label>
        <button
          type="button"
          className="px-5 py-2.5 rounded text-white text-sm font-semibold tracking-wide bg-blue-600 hover:bg-blue-700"
          onClick={handleClickTask}
          disabled={!formData.projectName}
        >
          {formData.taskName || 'Select Task'}
        </button>

        {isTaskOpen && formData.projectName && (
          <ul className="absolute block shadow-lg bg-white py-2 px-2 z-[1000] min-w-full w-max rounded max-h-96 overflow-auto">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <li
                  key={task._id}
                  className="py-2.5 px-4 hover:bg-blue-50 text-black text-sm cursor-pointer rounded"
                  onClick={() => handleTaskSelect(task)}
                >
                  {task.taskName} (Max: {task.taskHour} hrs)
                </li>
              ))
            ) : (
              <li className="py-2.5 px-4 text-gray-500 text-sm">No tasks available</li>
            )}
          </ul>
        )}
      </div>

      {/* Hours to Spend */}
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Hours to spend</label>
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
        <input
          type="text"
          name="taskStatus"
          value="In Progress"
          disabled
          className="px-2 py-2 w-full border-b-2 text-gray-500 bg-gray-100 focus:border-none outline-none text-sm"
        />
      </div>


      <button type="submit" className="mt-8 px-6 py-2 w-full bg-[#333] hover:bg-[#444] text-sm text-white">
        Add Log
      </button>
    </form>
  );
};

export default UserLogForm;
