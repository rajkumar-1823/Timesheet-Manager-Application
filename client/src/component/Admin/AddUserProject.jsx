import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import { API_URL } from '../Api/API_URL';

const AddUserProject = ({ userId, userEmail, userName, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => emailjs.init('7gxGKC-8BonyOFEIE'), []);

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

  const sendEmail = async (userName, userEmail) => {
    try {
      const response = await emailjs.send('service_jc78pyd', 'template_irlcvlx', {
        user_name: userName,
        email: userEmail,
        project_name: selectedProject.projectName,
      });
      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  const handleAddUserToProject = async () => {
    if (!selectedProject || !selectedProject._id || !userId) {
      toast.warning('Please select a project.');
      return;
    }

    setLoading(true); 
    try {
      const emailSuccess = await sendEmail(userName, userEmail);

      if (!emailSuccess) {
        throw new Error('Email sending failed. User will not be added to the project.');
      }

      const response = await fetch(
        `${API_URL}api/projects/${selectedProject._id}/addUser`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error('User already in the Project.');
    } else {
        toast.success('User added to project successfully!');
    }
    
      if (onClose) onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="relative font-[sans-serif] w-max mx-auto">
      <button
        type="button"
        onClick={handleToggleDropdown}
        className="px-5 py-2.5 rounded text-white text-sm font-semibold tracking-wide border-none outline-none bg-blue-600 hover:bg-blue-700 active:bg-blue-600"
        disabled={loading}
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

      <button
        type="button"
        onClick={handleAddUserToProject}
        className="mt-4 px-5 py-2.5 rounded text-white text-sm font-semibold tracking-wide border-none outline-none bg-green-600 hover:bg-green-700 active:bg-green-600"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Add to Project'}
      </button>
    </div>
  );
};

export default AddUserProject;
