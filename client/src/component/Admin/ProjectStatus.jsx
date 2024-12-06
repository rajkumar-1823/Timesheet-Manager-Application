import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AgCharts } from 'ag-charts-react';
import { API_URL } from '../Api/API_URL';

const ProjectStatus = () => {
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState([]);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const response = await axios.get(`${API_URL}api/project/status`);
        setProjectData(response.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProjects();
  }, []); 
  if (loading) {
    return <p>Loading project status data...</p>;
  }

  if (projectData.length === 0) {
    return <p>No data available for project statuses.</p>;
  }


  const chartOptions = {
    data: projectData,
    series: [
      {
        type: 'bar',
        xKey: 'businessUnit', 
        yKey: 'pending',
        yName: 'Pending Tasks',
        fill: '#ff0000',
        tooltip: {
          renderer: ({ datum }) => ({
            content: `${datum.businessUnit}: ${datum.pending} pending tasks`,
          }),
        },
      },
      {
        type: 'bar',
        xKey: 'businessUnit',
        yKey: 'inProgress',
        yName: 'In Progress Tasks',
        tooltip: {
          renderer: ({ datum }) => ({
            content: `${datum.businessUnit}: ${datum.inProgress} in progress tasks`,
          }),
        },
      },
      {
        type: 'bar',
        xKey: 'businessUnit',
        yKey: 'completed',
        yName: 'Completed Tasks',
        fill: '#63993D',
        tooltip: {
          renderer: ({ datum }) => ({
            content: `${datum.businessUnit}: ${datum.completed} completed tasks`,
          }),
        },
      },
    ],
    axes: [
      {
        type: 'category',
        position: 'bottom',
        title: { text: 'Business Unit' },  
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

export default ProjectStatus;
