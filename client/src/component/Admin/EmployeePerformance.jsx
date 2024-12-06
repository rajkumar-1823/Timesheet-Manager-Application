import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AgCharts } from 'ag-charts-react';
import { API_URL } from '../Api/API_URL';

const EmployeePerformance = () => {
  const [loading, setLoading] = useState(true);
  const [userTaskData, setUserTaskData] = useState([]);

  useEffect(() => {

    const fetchAllUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}api/users`); 


        const userData = response.data.filter(user => user.role !== 'admin').map((user) => ({
          userName: user.username, 
          completedTasks: user.completedTask, 
        }));

        setUserTaskData(userData);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  if (loading) {
    return <p>Loading user details...</p>;
  }

  if (userTaskData.length === 0) {
    return <p>No data available for completed tasks.</p>;
  }

  const chartOptions = {
    data: userTaskData,
    series: [
      {
        type: 'bar',
        xKey: 'userName',
        yKey: 'completedTasks',
        yName: 'Completed Tasks',
        fill:'#9E4A06',
        tooltip: {
          renderer: ({ datum }) => ({
            content: `${datum.userName}: ${datum.completedTasks} Completed tasks`,
          }),
        },
      },
    ],
    axes: [
      {
        type: 'category',
        position: 'bottom',
        title: { text: 'Employee Name' },
      },
      {
        type: 'number',
        position: 'left',
        title: { text: 'Number of Completed Tasks' },
      },
    ],
    legend: {
      position: 'top',
    },
  };

  return (
    <div className="ag-chart-container" style={{ height: '400px' }}>
      {/* Date Range Filter */}
      {/* <div className="flex justify-center mb-4">
            <input
              type="date"
              className="border px-4 py-2 mr-2 rounded"
            />
            <span className="mx-2 mt-2 text-gray-600 font-medium">to</span>
            <input
              type="date"
              className="border px-4 py-2 mr-2 rounded"
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Filter
            </button>
            <button
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
                Reset
            </button>
          </div> */}
      <AgCharts options={chartOptions} />
    </div>
  );
};

export default EmployeePerformance;
