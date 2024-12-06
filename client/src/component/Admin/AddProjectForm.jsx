import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import { toast } from 'react-toastify';

import { API_URL } from '../Api/API_URL';


const AddProjectForm = ({ projectId, onClose, setProjects }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    address: '',
    department: '',
    businessUnit: '',
    projectType: '',
  });


  useEffect(() => {
    if (projectId) {
      axios
        .get(`${API_URL}api/projects/${projectId}`)
        .then((response) => {
          setFormData(response.data);
        })
        .catch((error) => {
          console.error('There was an error fetching the Project details!', error);
        });
    }
  }, [projectId]);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (projectId) {

        response = await axios.put(`${API_URL}api/projects/${projectId}`, formData);
      } else {

        response = await axios.post(`${API_URL}api/projects`, formData);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(projectId ? 'Project updated successfully!' : 'Project added successfully!');
        if (onClose) onClose(); 
          setProjects((prevProjects) => projectId ? prevProjects.map(project => project._id === projectId ? response.data : project) : [...prevProjects, response.data]);
      } else {
        toast.error('Failed to save Project.')
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error saving Project.')
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 max-w-sm mx-auto font-[sans-serif]">
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Project name</label>
        <input
          type="text"
          name="projectName"
          placeholder="Enter the project name"
          value={formData.projectName}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Client name</label>
        <input
          type="text"
          name="clientName"
          placeholder="Enter the client name"
          value={formData.clientName}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Address</label>
        <input
          type="text"
          name="address"
          placeholder="Enter the address"
          value={formData.address}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Department</label>
        <input
          type="text"
          name="department"
          placeholder="Enter the Department"
          value={formData.department}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Business Unit</label>
        <input
          type="text"
          name="businessUnit"
          placeholder="Enter the business unit"
          value={formData.businessUnit}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Project Type</label>
        <input
          type="text"
          name="projectType"
          placeholder="Enter the project type"
          value={formData.projectType}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <button
        type="submit"
        className="!mt-8 px-6 py-2 w-full bg-[#333] hover:bg-[#444] text-sm text-white mx-auto block"
      >
        {projectId ? 'Save Changes' : 'Add Project'}
      </button>
    </form>
  );
};

export default AddProjectForm;