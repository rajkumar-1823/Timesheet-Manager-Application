import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AgCharts } from 'ag-charts-react';

import { API_URL } from '../Api/API_URL';

const TaskStatus = () => {
  const [loading, setLoading] = useState(true);
  const [taskCountData, setTaskCountData] = useState([]);

  useEffect(() => {

    const fetchAllProjects = async () => {
      try {
        const response = await axios.get(`${API_URL}api/projects/graph/hours`); 


        const aggregatedData = response.data.map((project) => {
          const completedTaskCount = project.tasks.filter(task => task.taskStatus === 'Completed').length;

          return {
            projectName: project.projectName,
            completedTasks: completedTaskCount, 
          };
        });

        setTaskCountData(aggregatedData); 
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProjects();
  }, []); 

  if (loading) {
    return <p>Loading project details...</p>;
  }

  if (taskCountData.length === 0) {
    return <p>No data available for completed tasks.</p>;
  }


  const chartOptions = {
    data: taskCountData,
    series: [
      {
        type: 'bar',
        xKey: 'projectName',
        yKey: 'completedTasks',
        yName: 'Completed Tasks',
        fill: '#3D2785',
        tooltip: {
          renderer: ({ datum }) => ({
            content: `${datum.projectName}: ${datum.completedTasks} Completed tasks`,
          }),
        },
      },
    ],
    axes: [
      {
        type: 'category',
        position: 'bottom',
        title: { text: 'Project Name' },
      },
      {
        type: 'number',
        position: 'left',
        title: { text: 'Number of Tasks' },
      },
    ],
    legend: {
      position: 'top',
    },
  };

  return (
    <div className="ag-chart-container" style={{ height: '400px' }}>
      <AgCharts options={chartOptions} />
    </div>
  );
};

export default TaskStatus;
