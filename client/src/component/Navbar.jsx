import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import logo from '../component/Assets/calendar_log.png'

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
  }, []);

  const handleLogout = () => {

    localStorage.removeItem('token');
    setIsLoggedIn(false);

    navigate('/');
  };

  return (
    <div>
      <header className="flex shadow-md py-4 px-4 sm:px-10 bg-white font-[sans-serif] min-h-[70px] tracking-wide relative z-50">
        <div className="flex flex-wrap items-center justify-between gap-5 w-full">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="logo" className="w-12" title="logo" />
          <b className="text-[#4D38F7]">Timesheet Manager</b>
        </Link>


          <div className="flex gap-4">
            {/* Show Logout button only if logged in */}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
