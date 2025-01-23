// src/components/RevenueChart.js
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export const RevenueChart = ({ data }) => (
  <Line 
    data={{
      labels: data.map(d => d._id),
      datasets: [{
        label: 'Monthly Revenue',
        data: data.map(d => d.totalRevenue),
        borderColor: '#6366f1',
        tension: 0.1
      }]
    }}
    options={{ responsive: true }}
  />
);

export const TopProductsChart = ({ data }) => (
  <Bar
    data={{
      labels: data.map(p => p.name),
      datasets: [{
        label: 'Units Sold',
        data: data.map(p => p.totalSold),
        backgroundColor: '#10b981'
      }]
    }}
    options={{ 
      responsive: true,
      indexAxis: 'y' 
    }}
  />
);