import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { API_URL } from '../Api/API_URL';

const AddTaskProject = ({ taskId, taskHour, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);


  useEffect(() => {
    fetch(`${API_URL}api/projects`)
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
        setFilteredProjects([]); 
      })
      .catch((error) => console.error('Error fetching projects:', error));
  }, []);


  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProjects([]); 
    } else {
      setFilteredProjects(
        projects.filter((project) =>
          project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, projects]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); 
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setIsOpen(false); 
  };

  const handleAddTaskToProject = async () => {
    try {

      if (selectedProject && selectedProject._id && taskId) {
        const response = await fetch(`${API_URL}api/projects/${selectedProject._id}/addTask`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: taskId,
            taskHour: taskHour, 
          }),
        });

        if (!response.ok) {
          throw new Error('Task already added in the project');
        }
        toast.success('Task added to project successfully!')
        if (onClose) onClose();
      } else {
        throw new Error('Please select a project.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };

  return (
    <div className="relative font-[sans-serif] w-max mx-auto">
      {/* Button to select a project */}
      <button
        type="button"
        onClick={handleToggleDropdown}
        className="px-5 py-2.5 rounded text-white text-sm font-semibold tracking-wide border-none outline-none bg-blue-600 hover:bg-blue-700 active:bg-blue-600"
      >
        {selectedProject ? selectedProject.projectName : 'Select Project'}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 fill-white inline ml-3" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M11.99997 18.1669a2.38 2.38 0 0 1-1.68266-.69733l-9.52-9.52a2.38 2.38 0 1 1 3.36532-3.36532l7.83734 7.83734 7.83734-7.83734a2.38 2.38 0 1 1 3.36532 3.36532l-9.52 9.52a2.38 2.38 0 0 1-1.68266.69734z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown for project selection */}
      {isOpen && (
        <ul
          id="dropdownMenu"
          className="absolute block shadow-lg bg-white py-2 px-2 z-[1000] min-w-full w-max rounded max-h-96 overflow-auto"
        >
          <li className="mb-2">
            <input
              type="text"
              placeholder="Search here"
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2.5 w-full rounded text-gray-800 text-sm border-none outline-blue-600 bg-blue-50 focus:bg-transparent"
            />
          </li>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <li
                key={project._id}
                onClick={() => handleProjectSelect(project)}
                className="py-2.5 px-4 hover:bg-blue-50 text-black text-sm cursor-pointer rounded"
              >
                {project.projectName}
              </li>
            ))
          ) : (
            <li className="py-2.5 px-4 text-black text-sm">No projects found</li>
          )}
        </ul>
      )}

      {/* Add User to Project Button */}
      <button
        type="button"
        onClick={handleAddTaskToProject}
        className="mt-4 px-5 py-2.5 rounded text-white text-sm font-semibold tracking-wide border-none outline-none bg-green-600 hover:bg-green-700 active:bg-green-600"
      >
        Add to Project
      </button>
    </div>
  );
};

export default AddTaskProject;
