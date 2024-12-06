import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import AddUserForm from './AddUserForm';
import AddUserProject from './AddUserProject';
import deleteIcon from '../Assets/delete.png';
import editIcon from '../Assets/edit.png';
import addIcon from '../Assets/add.png';

import { API_URL } from '../Api/API_URL';


const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userEmail,setUserEmail] = useState(null);
  const [userName,setUserName] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [department, setDepartment] = useState(""); 
  const [businessUnit, setBusinessUnit] = useState(""); 

  const [isAddUserProjectModalOpen, setIsAddUserProjectModalOpen] = useState(false);
  const usersPerPage = 5;


  const [loading, setLoading] = useState(true);  
  const [fetchError, setFetchError] = useState(null);  


  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); 
      setFetchError(null);
      try {
        const query = new URLSearchParams({
          search: searchTerm,
          department,
          businessUnit,
        }).toString();
        const response = await fetch(`${API_URL}api/users?${query}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setFetchError('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setFetchError('Error fetching users');
      }finally {
        setLoading(false); 
      }
    };

    fetchUsers();
  }, [searchTerm, department, businessUnit]); 

  
  const deleteUser = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this user?');
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}api/users/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setUsers(users.filter((user) => user._id !== id));
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user', error);
      toast.error('Error deleting user');
    }
  };

 
  const handleAddUserClick = () => {
    setSelectedUserId(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };
  

  
  const handleEditUserClick = (user) => {
    setSelectedUserId(user._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openAddUserProjectModal = (user) => {
    setSelectedUserId(user._id);
    setUserEmail(user.email);
    setUserName(user.username);
    setIsAddUserProjectModalOpen(true);
  };


  const closeAddUserProjectModal = () => {
    setIsAddUserProjectModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };



  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);


  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div>
      {/* Modal for Adding/Editing User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 text-white font-medium text-2xl bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transform translate-x-1/3 translate-y-[-40%]"
            >
              &times;
            </button>
            <AddUserForm
              userId={selectedUserId}
              isEditing={isEditing}
              onClose={handleCloseModal}
              setUsers={setUsers}
            />
          </div>
        </div>
      )}

      {/* Modal for AddUserProject */}
      {isAddUserProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            {/* Close Button */}
            <button
              onClick={closeAddUserProjectModal}
              className="absolute top-0 right-0 text-white font-medium text-2xl bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transform translate-x-1/3 translate-y-[-40%]"
            >
              &times;
            </button>
            <AddUserProject userId={selectedUserId} userName={userName} userEmail={userEmail} onClose={closeAddUserProjectModal}/>
          </div>
        </div>
      )}

      
      {/* Search and Add User Buttons */}
      <div className="flex items-center justify-center gap-x-12 max-w-full mx-auto px-4">
        {/* First Search Bar */}
    <div className="bg-white flex px-1 py-1 rounded-full border border-blue-500 overflow-hidden max-w-md font-[sans-serif] m-5 px-5 py-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 192.904 192.904"
            width="18px"
            className="fill-gray-600 mr-3"
          >
            <path
              d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"
            ></path>
          </svg>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} 
        placeholder="Search User"
        className="w-full outline-none bg-white pl-4 text-sm"
      />
    </div>

    {/* Second Search Bar */}
    <div className="bg-white flex px-4 py-3 border-b border-[#333] focus-within:border-blue-500 overflow-hidden max-w-md font-[sans-serif]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 192.904 192.904"
        width="18px"
        className="fill-gray-600 mr-3"
      >
        <path
          d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"
        ></path>
      </svg>
      <input
        type="text"
        placeholder="Search department"
        className="w-full outline-none text-sm"
        value={department}
        onChange={(e) => setDepartment(e.target.value)} 
      />
      </div>
        {/* Third search */}
      <div className="bg-white flex px-4 py-3 border-b border-[#333] focus-within:border-blue-500 overflow-hidden max-w-md font-[sans-serif]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 192.904 192.904"
        width="18px"
        className="fill-gray-600 mr-3"
      >
        <path
          d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"
        ></path>
      </svg>
      <input
        type="text"
        placeholder="Search business unit"
        className="w-full outline-none text-sm"
        value={businessUnit}
        onChange={(e) => setBusinessUnit(e.target.value)}
      />
      </div>
      </div>

      {/* Add User Button */}
      <div className="text-center mt-4">
        <button
          type="button"
          className="px-5 py-2.5 rounded-lg text-white text-sm tracking-wider font-medium border border-current outline-none bg-blue-700 hover:bg-blue-800 active:bg-blue-700"
          onClick={handleAddUserClick}
        >
          Add User
        </button>
      </div>

      {/* User Table */}
      <div className="mt-4 px-4">
        <div className="max-w-8xl mx-auto bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4 text-center  text-xs font-semibold text-white">Username</th>
              <th className="p-4 text-center text-xs font-semibold text-white">Email</th>
              <th className="p-4 text-center text-xs font-semibold text-white">Phone</th>
              <th className="p-4 text-center text-xs font-semibold text-white">Department</th>
              <th className="p-4 text-center text-xs font-semibold text-white">Business unit</th>
              <th className="p-4 text-center text-xs font-semibold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
          {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-600">Loading...</td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-red-600">{fetchError}</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-600">No data present</td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user._id} className="even:bg-blue-50">
                    <td className="p-4 text-sm text-center text-black">{user.username}</td>
                    <td className="p-4 text-sm text-center text-black">{user.email}</td>
                    <td className="p-4 text-sm text-center text-black">{user.phone}</td>
                    <td className="p-4 text-sm text-center text-black">{user.department}</td>
                    <td className="p-4 text-sm text-center text-black">{user.businessUnit}</td>
                <td className="p-4 text-center">
                  {/* Edit & Delete Buttons */}
                  <button onClick={() => handleEditUserClick(user)} className="text-blue-500 mr-4">
                    <img src={editIcon} alt="edit" className="w-5 hover:opacity-80" title='edit'/>
                  </button>
                  <button onClick={() => deleteUser(user._id)} className="text-red-500">
                    <img src={deleteIcon} alt="delete" className="w-5 hover:opacity-80" title='delete'/>
                  </button>
                  <button 
                    onClick={() => openAddUserProjectModal(user)} 
                    className="text-green-500 ml-4"
                  >
                    <img src={addIcon} alt="add to project" className="w-5 hover:opacity-80" title='add to project' />
                  </button>
                </td>
              </tr>
            )))}
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

export default Users;
