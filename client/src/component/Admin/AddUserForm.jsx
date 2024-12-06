import React, { useState, useEffect } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import bcrypt from "bcryptjs";
import { toast } from 'react-toastify';
import { API_URL } from '../Api/API_URL';

const AddUserForm = ({ userId, onClose, setUsers }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    department: '',
    businessUnit: '',
    completedTask: 0,
    completedDate: '',
  });


  useEffect(() => emailjs.init("7gxGKC-8BonyOFEIE"), []);
  useEffect(() => {
    if (userId) {
      axios
        .get(`${API_URL}api/users/${userId}`)
        .then((response) => {
          setFormData(response.data);
        })
        .catch((error) => {
          console.error('There was an error fetching the user details!', error);
        });
    }
  }, [userId]);

  const generateRandomPassword = (length = 10) => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    let password = "";
    password += letters[Math.floor(Math.random() * letters.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    const charset = letters + numbers;
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');
    return password;
  };

  
  const sendEmail = (username, password, email) => {
    emailjs.send('service_jc78pyd', 'template_irkmpg8', {
      username: username,
      password: password,
      email: email,
    })
      .then(
        (response) => {
          console.log('Email sent successfully:', response);
          toast.success('Email sent to the user!');
        },
        (error) => {
          console.error('Error sending email:', error);
          toast.error('Failed to send email.');
        }
      );
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      toast.warning('Phone Number is not valid');
      return;
    }

    let password = formData.password;
    if (!password) {
      password = generateRandomPassword(10); 
    }

    const hash = bcrypt.hashSync(password, 10);
    const updatedFormData = { ...formData, password: hash };

    try {
      let response;
      if (userId) {
        response = await axios.put(`${API_URL}api/users/${userId}`, updatedFormData);
      } else {
        response = await axios.post(`${API_URL}api/users`, updatedFormData);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(userId ? 'User updated successfully!' : 'User added successfully!');
        if (onClose) onClose();
        setUsers((prevUsers) =>
          userId
            ? prevUsers.map((user) => (user._id === userId ? response.data : user))
            : [...prevUsers, response.data]
        );


        sendEmail(formData.username, password, formData.email);
      } else {
        toast.error('Failed to save user.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
        toast.error('Error saving user.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 max-w-sm mx-auto font-[sans-serif]">
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Username</label>
        <input
          type="text"
          name="username"
          placeholder="Enter the username"
          value={formData.username}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter the email"
          value={formData.email}
          onChange={handleChange}
          required
          className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
        />
      </div>
      <div className="flex items-center">
        <label className="text-gray-400 w-36 text-sm">Phone No.</label>
        <input
          type="number"
          name="phone"
          placeholder="Enter the phone no"
          value={formData.phone}
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
      <button
        type="submit"
        className="!mt-8 px-6 py-2 w-full bg-[#333] hover:bg-[#444] text-sm text-white mx-auto block"
      >
        {userId ? 'Save Changes' : 'Add User'}
      </button>
    </form>
  );
};

export default AddUserForm;
