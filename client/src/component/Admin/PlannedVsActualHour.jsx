import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AgCharts } from 'ag-charts-react';
import { API_URL } from '../Api/API_URL';

const PlannedVsActualHour = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {

    const fetchAllProjects = async () => {
      try {
        const response = await axios.get(`${API_URL}api/projects/graph/hours`); 

 
        const aggregatedData = response.data.map((project) => {
          const totalTaskHour = project.tasks.reduce((sum, task) => sum + task.taskHour, 0);
          const totalSpentHour = project.tasks.reduce((sum, task) => sum + task.spentHour, 0);

          return {
            projectName: project.projectName,
            taskHour: totalTaskHour,
            spentHour: totalSpentHour,
          };
        });

        setChartData(aggregatedData); 
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

  if (chartData.length === 0) {
    return <p>No data available for charting.</p>;
  }


  const chartOptions = {
    data: chartData,
    series: [
      {
        type: 'bar',
        xKey: 'projectName',
        yKey: 'taskHour',
        yName: 'Planned Hours', 
        tooltip: {
          renderer: ({ datum }) => ({
            content: `${datum.projectName}: ${datum.taskHour} Planned hour`,
          }),
        },
      },
      {
        type: 'bar',
        xKey: 'projectName',
        yKey: 'spentHour',
        yName: 'Actual Hours', 
        tooltip: {
          renderer: ({ datum }) => ({
            content: `${datum.projectName}: ${datum.spentHour} Actual hour`,
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
        title: { text: 'Hours' },
      },
    ],
    legend: {
      position: 'top',
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Planned hours Vs Actual hours</h1>
      
      {/* AG-Chart */}
      <div className="ag-chart-container" style={{ height: '400px', marginBottom: '20px' }}>
        <AgCharts options={chartOptions} />
      </div>
    </div>
  );
};

export default PlannedVsActualHour;
