import React, { useState } from 'react';

import Users from './Users.jsx'
import Projects from './Projects.jsx'
import TaskList from './TaskList.jsx';
import HomeDash from './HomeDash.jsx';
import LogEntry from './LogEntry.jsx';

const Admin = () => {

  const [activeTab, setActiveTab] = useState('home'); 

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      {/* Tab buttons */}
      <ul className="flex gap-2 mt-5 w-max bg-white p-1 rounded-full shadow-[0_2px_8px_-1px_rgba(6,81,237,0.4)] mx-auto">
        <li
          id="homeTab"
          className={`tab font-bold text-center text-sm py-3 px-6 rounded-full tracking-wide cursor-pointer ${activeTab === 'home' ? 'text-white bg-blue-600' : 'text-gray-500'}`}
          onClick={() => handleTabClick('home')}
        >
          Home
        </li>
        <li
          id="settingTab"
          className={`tab font-bold text-center text-sm py-3 px-6 rounded-full tracking-wide cursor-pointer ${activeTab === 'user' ? 'text-white bg-blue-600' : 'text-gray-500'}`}
          onClick={() => handleTabClick('user')}
        >
          Users
        </li>
        <li
          id="profileTab"
          className={`tab font-bold text-center text-sm py-3 px-6 rounded-full tracking-wide cursor-pointer ${activeTab === 'projects' ? 'text-white bg-blue-600' : 'text-gray-500'}`}
          onClick={() => handleTabClick('projects')}
        >
          Projects
        </li>
        <li
          id="TasksTab"
          className={`tab font-bold text-center text-sm py-3 px-6 rounded-full tracking-wide cursor-pointer ${activeTab === 'tasks' ? 'text-white bg-blue-600' : 'text-gray-500'}`}
          onClick={() => handleTabClick('tasks')}
        >
          Tasks
          
        </li>
        <li
          id="LogTab"
          className={`tab font-bold text-center text-sm py-3 px-6 rounded-full tracking-wide cursor-pointer ${activeTab === 'logs' ? 'text-white bg-blue-600' : 'text-gray-500'}`}
          onClick={() => handleTabClick('logs')}
        >
          Log Entry
        </li>
      </ul>

      {/* Tab contents */}
      <div>
        <div className={`tab-content ${activeTab === 'home' ? '' : 'hidden'}`} id="homeContent">
          <HomeDash/>
        </div>
        <div className={`tab-content ${activeTab === 'user' ? '' : 'hidden'}`} id="settingContent">
          <Users />
        </div>
        <div className={`tab-content ${activeTab === 'projects' ? '' : 'hidden'}`} id="profileContent">
          <Projects />
        </div>
        <div className={`tab-content ${activeTab === 'tasks' ? '' : 'hidden'}`} id="TasksContent">
          <TaskList/>
        </div>
        <div className={`tab-content ${activeTab === 'logs' ? '' : 'hidden'}`} id="LogContent">
          <LogEntry/>
        </div>
      </div>
    </div>
  );
};

export default Admin;
