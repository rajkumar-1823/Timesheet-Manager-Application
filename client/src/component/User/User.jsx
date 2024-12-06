import React, { useState } from 'react';
import UserLogEntry from './UserLogEntry';


const User = () => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState('userlog'); // Default active tab

  // Tab click handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      {/* Tab buttons */}
      <ul className="flex gap-2 mt-5 w-max bg-white p-1 rounded-full shadow-[0_2px_8px_-1px_rgba(6,81,237,0.4)] mx-auto">
        <li
          id="settingTab"
          className={`tab font-bold text-center text-sm py-3 px-6 rounded-full tracking-wide cursor-pointer ${activeTab === 'userlog' ? 'text-white bg-blue-600' : 'text-gray-500'}`}
          onClick={() => handleTabClick('userlog')}
        >
         Register Entry
        </li>
      </ul>

      {/* Tab contents */}
      <div>
        <div className={`tab-content ${activeTab === 'userlog' ? '' : 'hidden'}`} id="settingContent">
          {/* Content for Settings */}
          <UserLogEntry/>
        </div>
      </div>
    </div>
  );
};

export default User;
