import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_URL } from './Api/API_URL';

import loginlogo from '../component/Assets/calendar_log.png'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const navigate = useNavigate();

  const handleSignin = async () => {
    if (!username || !password) {
        toast.error('Please enter both username and password.');
        return;
    }

    try {
        const response = await axios.post(`${API_URL}api/auth/login`, {
            username,
            password,
        });

        if (response.status === 200) {
            const { token, role, userId } = response.data; 
            localStorage.setItem('token', token); 
            localStorage.setItem('role', role);   
            

            if (role === 'user') {
                localStorage.setItem('userId', userId); 
            } else {
                localStorage.removeItem('userId'); 
            }

            if (role === 'admin') {
                navigate('/admin');
                window.location.reload();
            } else if (role === 'user') {
                navigate('/user');
                window.location.reload();
            } else {

                toast.error('Unknown role detected.');
            }
        }
    } catch (error) {

        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
        toast.error(errorMessage);
    }
  };  

  return (
    <div>
      <div className="bg-gray-50 font-[sans-serif]">
        <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
          <div className="max-w-md w-full">
          <img src={loginlogo} alt="logoin_logo" className="w-12 mb-8 mx-auto block" title="logoin_logo" />
            
            <div className="p-8 rounded-2xl bg-white shadow">
              <h2 className="text-gray-800 text-center text-2xl font-bold">Sign in</h2>
              <form className="mt-8 space-y-4">
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">User name</label>
                  <div className="relative flex items-center">
                    <input
                      name="username"
                      type="text"
                      required
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                      placeholder="Enter user name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-800 text-sm mb-2 block">Password</label>
                  <div className="relative flex items-center">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'} 
                      required
                      className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={showPassword ? '#000' : '#bbb'} 
                      className="w-4 h-4 absolute right-4 cursor-pointer"
                      viewBox="0 0 128 128"
                      onClick={() => setShowPassword(!showPassword)} 
                    >
                      <path
                        d={
                          showPassword
                            ? 'M64 104c-41.873 0-62.633-36.504-63.496-38.057a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM64 96c-31.854 0-50.535-24.795-55.293-31.994C13.447 56.775 32.045 32 64 32c31.854 0 50.535 24.795 55.293 31.994C114.535 71.205 95.854 96 64 96z'
                            : 'M64 104c-41.873 0-62.633-36.504-63.496-38.057a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM64 96c-31.854 0-50.535-24.795-55.293-31.994C13.447 56.775 32.045 32 64 32c31.854 0 50.535 24.795 55.293 31.994C114.535 71.205 95.854 96 64 96z'
                        }
                      ></path>
                    </svg>
                  </div>
                </div>
                <div className="!mt-8">
                  <button
                    type="button"
                    className="w-full py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    onClick={handleSignin}
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
