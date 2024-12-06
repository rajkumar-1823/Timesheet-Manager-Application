import React, { useState } from 'react';
import PlannedVsActualHour from './PlannedVsActualHour';
import TaskStatus from './TaskStatus';
import EmployeePerformance from './EmployeePerformance';
import ProjectStatus from './ProjectStatus';

const HomeDash = () => {

  const [selectedComponent, setSelectedComponent] = useState(<PlannedVsActualHour />); 


  const handleClick = (component) => {
    setSelectedComponent(component); 
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <nav
        className="bg-white shadow-lg h-screen fixed top-0 left-0 min-w-[240px] py-6 px-4 font-[sans-serif] overflow-auto"
        style={{ marginTop: '60px' }}
      >
        <ul>
          <li>
            <button
              onClick={() => handleClick(<PlannedVsActualHour />)} 
              className="text-black hover:text-blue-600 text-[15px] block hover:bg-blue-50 rounded px-4 py-2.5 transition-all"
            >
              Planned hours Vs Actual hours
            </button>
          </li>
          <li>
            <button
              onClick={() => handleClick(<TaskStatus/>)} 
              className="text-black hover:text-blue-600 text-[15px] block hover:bg-blue-50 rounded px-4 py-2.5 transition-all"
            >
              Task Status
            </button>
          </li>
          <li>
            <button
              onClick={() => handleClick(<ProjectStatus/>)} 
              className="text-black hover:text-blue-600 text-[15px] block hover:bg-blue-50 rounded px-4 py-2.5 transition-all"
            >
              Project Status
            </button>
          </li>
          <li>
            <button
              onClick={() => handleClick(<EmployeePerformance/>)} 
              className="text-black hover:text-blue-600 text-[15px] block hover:bg-blue-50 rounded px-4 py-2.5 transition-all"
            >
              Employee Performance
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-[240px] p-8">
        
        <div className="mt-4">
          {selectedComponent }
        </div>
      </main>
    </div>
  );
};

export default HomeDash;
