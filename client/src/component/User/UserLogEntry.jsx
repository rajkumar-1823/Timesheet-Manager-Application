import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserLogForm from './UserLogForm';
import UpdateLogForm from './UpdateLogForm'; 
import updateIcon from '../Assets/updated.png';
import { API_URL } from '../Api/API_URL';

const UserLogEntry = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); 
  const [Log, setLog] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(5);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const userId = localStorage.getItem('userId'); 
        const role = localStorage.getItem('role');

        if (!userId) {
          console.error('User ID not found in localStorage');
          return;
        }

        let response;
        if (role === 'admin') {
          // If role is admin, fetch all logs
          response = await axios.get(`${API_URL}api/logs`);
        } else {
          // Fetch logs for the specific user
          response = await axios.get(`${API_URL}api/logs/user/${userId}`);
        }

        setLog(response.data);
      } catch (error) {
        console.error('Error fetching log entries:', error);
      }
    };

    fetchLogs();
  }, [Log]); 

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date)) {
        console.error("Invalid date:", dateString); 
        return "Invalid Date";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
};

  const handleAddLogEntry = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUpdateLog = (log) => {
    setSelectedLog(log); 
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedLog(null);
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = Log.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(Log.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 text-white font-medium text-2xl bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transform translate-x-1/3 translate-y-[-40%]"
            >
              &times;
            </button>
            <UserLogForm onClose={handleCloseModal} setLog={setLog} />
          </div>
        </div>
      )}

      {isUpdateModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={handleCloseUpdateModal}
              className="absolute top-0 right-0 text-white font-medium text-2xl bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transform translate-x-1/3 translate-y-[-40%]"
            >
              &times;
            </button>
            <UpdateLogForm
              onClose={handleCloseUpdateModal}
              setLog={setLog}
              selectedLog={selectedLog} 
            />
          </div>
        </div>
      )}

      <div className="font-[sans-serif] space-x-4 space-y-4 text-center mt-4">
        <button
          type="button"
          onClick={handleAddLogEntry}
          className="px-5 py-2.5 rounded-lg text-white text-sm tracking-wider font-medium border border-current outline-none bg-blue-700 hover:bg-blue-800 active:bg-blue-700"
        >
          Add Log Entry
        </button>
      </div>

      <div className="mt-4 px-4">
        <div className="max-w-8xl mx-auto bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 whitespace-nowrap">
              <tr>
                <th className="p-4 text-center text-sm font-medium text-white">Date</th>
                <th className="p-4 text-center text-sm font-medium text-white">Project Name</th>
                <th className="p-4 text-center text-sm font-medium text-white">Task Name</th>
                <th className="p-4 text-center text-sm font-medium text-white">Hours</th>
                <th className="p-4 text-center text-sm font-medium text-white">Status</th>
                <th className="p-4 text-center text-sm font-medium text-white">Actions</th>
              </tr>
            </thead>

            <tbody className="whitespace-nowrap">
              {currentLogs.length > 0 ? (
                currentLogs.map((log, index) => (
                  <tr key={index} className="even:bg-blue-50">
                    <td className="p-4 text-sm text-center text-black">{formatDate(log.Date)}</td>
                    <td className="p-4 text-sm text-center text-black">{log.projectName}</td>
                    <td className="p-4 text-sm text-center text-black">{log.taskName}</td>
                    <td className="p-4 text-sm text-center text-black">{log.spentHour}</td>
                    <td className="p-4 text-center text-sm">
                      <span
                        className={`w-[68px] block mx-auto text-center py-1 border rounded text-xs ${
                          log.taskStatus === "In Progress"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-green-500 text-green-600"
                        }`}
                      >
                        {log.taskStatus}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleUpdateLog(log)}
                        title="Update Status"
                        disabled={log.taskStatus === "Completed"} 
                        className={`${
                          log.taskStatus === "Completed" ? "cursor-not-allowed opacity-50" : "hover:opacity-80"
                        }`}
                      >
                        <img src={updateIcon} alt="update" className="w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-black">
                    No log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <nav>
          <ul className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <li key={index}>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white text-blue-600"
                  }`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default UserLogEntry;
