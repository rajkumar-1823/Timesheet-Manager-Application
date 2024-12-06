import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import AddTaskForm from './AddTaskForm';
import AddTaskProject from './AddTaskProject';
import deleteIcon from '../Assets/delete.png';
import editIcon from '../Assets/edit.png';
import addIcon from '../Assets/add.png';

import { API_URL } from '../Api/API_URL';

const TaskList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTaskProjectModalOpen, setIsAddTaskProjectModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskHour, setSelectedTaskHour] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_URL}api/tasks`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        } else {
          setFetchError('Failed to fetch tasks');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setFetchError('Error fetching tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const deleteTask = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this task?');
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTasks(tasks.filter((task) => task._id !== id));
        toast.success('Task deleted successfully');
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task', error);
      toast.error('Error deleting task');
    }
  };

  const handleAddTaskClick = () => {
    setSelectedTaskId(null);
    setSelectedTaskHour(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditTaskClick = (task) => {
    setSelectedTaskId(task._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openAddTaskProjectModal = (task) => {
    setSelectedTaskId(task._id);
    setSelectedTaskHour(task.taskHour);
    setIsAddTaskProjectModalOpen(true); 
  };

  const closeAddTaskProjectModal = () => {
    setIsAddTaskProjectModalOpen(false); 
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      {/* Modal for Adding/Editing Task */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 text-white font-medium text-2xl bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transform translate-x-1/3 translate-y-[-40%]"
            >
              &times;
            </button>
            <AddTaskForm
              taskId={selectedTaskId}
              isEditing={isEditing}
              onClose={handleCloseModal}
              setTasks={setTasks}
            />
          </div>
        </div>
      )}

      {/* Modal for AddTaskProject */}
      {isAddTaskProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={closeAddTaskProjectModal}
              className="absolute top-0 right-0 text-white font-medium text-2xl bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transform translate-x-1/3 translate-y-[-40%]"
            >
              &times;
            </button>
            <AddTaskProject taskId={selectedTaskId} taskHour={selectedTaskHour} onClose={closeAddTaskProjectModal} />
          </div>
        </div>
      )}

      {/* Add Task Button */}
      <div className="text-center mt-4">
        <button
          type="button"
          className="px-5 py-2.5 rounded-lg text-white text-sm tracking-wider font-medium border border-current outline-none bg-blue-700 hover:bg-blue-800 active:bg-blue-700"
          onClick={handleAddTaskClick}
        >
          Add Task
        </button>
      </div>

      {/* Task Table */}
      <div className="mt-4 px-4">
        <div className="max-w-8xl mx-auto bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 whitespace-nowrap">
              <tr>
                <th className="p-4 text-center text-xs font-semibold text-white">Task name</th>
                <th className="p-4 text-center text-xs font-semibold text-white">Task hours</th>
                <th className="p-4 text-center text-xs font-semibold text-white">Spent hours</th>
                <th className="p-4 text-center text-xs font-semibold text-white">Task status</th>
                <th className="p-4 text-center text-xs font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-600">Loading...</td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-red-600">{fetchError}</td>
                </tr>
              ) : currentTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-600">No data present</td>
                </tr>
              ) : (
                currentTasks.map((task) => (
                  <tr className="even:bg-blue-50" key={task._id}>
                    <td className="p-4 text-center text-sm">{task.taskName}</td>
                    <td className="p-4 text-center text-sm">{task.taskHour}</td>
                    <td className="p-4 text-center text-sm">{task.spentHour}</td>
                    <td className="p-4 text-center text-sm">
                    <span
                      className={`w-[68px] block mx-auto text-center py-1 border rounded text-xs ${
                        task.taskStatus === "Pending"
                          ? "border-red-500 text-red-600"
                          : task.taskStatus === "In Progress"
                          ? "border-yellow-500 text-yellow-600"
                          : "border-green-500 text-green-600"
                      }`}
                    >
                      {task.taskStatus}
                    </span>
                  </td>

                    <td className="p-4 text-center">
                      <button
                        
                        className={`${
                          task.taskStatus === "Completed" || task.taskStatus === "In progress" ? "cursor-not-allowed opacity-50" : "text-yellow-500 hover:text-yellow-600"
                        }`}
                        onClick={() => handleEditTaskClick(task)}
                        disabled={task.taskStatus === "Completed" || task.taskStatus === "In Progress"}
                      >
                        <img src={editIcon} alt="edit" className="w-5 hover:opacity-80" title="edit" />
                      </button>
                      <button
                        className={`${
                          task.taskStatus === "Completed" || task.taskStatus === "In Progress" ? "ml-4  cursor-not-allowed opacity-50" : "ml-4 text-red-500 hover:text-red-600"
                        }`}
                        onClick={() => deleteTask(task._id)}
                        disabled={task.taskStatus === "Completed"|| task.taskStatus === "In Progress"}
                      >
                        <img src={deleteIcon} alt="delete" className="w-5 hover:opacity-80" title="delete" />
                      </button>
                      <button
                        className={`${
                          task.taskStatus === "Completed" || task.taskStatus === "In Progress" ? "ml-4  cursor-not-allowed opacity-50" : "ml-4 text-green-500 hover:text-green-600"
                        }`}
                        onClick={() => openAddTaskProjectModal(task)}
                        disabled={task.taskStatus === "Completed" || task.taskStatus === "In Progress"}
                      >
                        <img src={addIcon} alt="add to project" className="w-5 hover:opacity-80" title="add to project" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
<div className="flex justify-center mt-6 font-[sans-serif]">
  <ul className="flex space-x-4">
    {/* Previous Button */}
    <li 
      className={`flex items-center justify-center shrink-0 w-9 h-9 rounded-md ${currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-200 cursor-pointer'}`}
      onClick={() => currentPage > 1 && paginate(currentPage - 1)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 fill-gray-500" viewBox="0 0 55.753 55.753">
        <path d="M12.745 23.915c.283-.282.59-.52.913-.727L35.266 1.581a5.4 5.4 0 0 1 7.637 7.638L24.294 27.828l18.705 18.706a5.4 5.4 0 0 1-7.636 7.637L13.658 32.464a5.367 5.367 0 0 1-.913-.727 5.367 5.367 0 0 1-1.572-3.911 5.369 5.369 0 0 1 1.572-3.911z" />
      </svg>
    </li>

    {/* Page Numbers */}
    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
      const isCurrentPage = currentPage === page;
      if (page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1) {
        return (
          <li
            key={page}
            className={`flex items-center justify-center shrink-0 px-[13px] h-9 rounded-md cursor-pointer ${
              isCurrentPage ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => paginate(page)}
          >
            {page}
          </li>
        );
      }
      if (page === currentPage - 2 || page === currentPage + 2) {
        return (
          <li key={page} className="flex items-center justify-center shrink-0 px-[13px] h-9 rounded-md">
            ...
          </li>
        );
      }
      return null;
    })}

    {/* Next Button */}
    <li 
      className={`flex items-center justify-center shrink-0 w-9 h-9 rounded-md ${currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-200 cursor-pointer'}`}
      onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
    >
      
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 fill-gray-500 rotate-180" viewBox="0 0 55.753 55.753">
        <path d="M12.745 23.915c.283-.282.59-.52.913-.727L35.266 1.581a5.4 5.4 0 0 1 7.637 7.638L24.294 27.828l18.705 18.706a5.4 5.4 0 0 1-7.636 7.637L13.658 32.464a5.367 5.367 0 0 1-.913-.727 5.367 5.367 0 0 1-1.572-3.911 5.369 5.369 0 0 1 1.572-3.911z" />
      </svg>
    </li>
  </ul>
</div>
    </div>
  );
};

export default TaskList;
