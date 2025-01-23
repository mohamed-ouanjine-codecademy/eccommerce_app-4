// src/components/SalesDashboard.js
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function SalesDashboard({ revenueData, topProducts }) {
  const revenueChartData = {
    labels: revenueData.map(d => d._id),
    datasets: [{
      label: 'Monthly Revenue',
      data: revenueData.map(d => d.total),
      borderColor: '#4f46e5',
    }]
  };

  const topProductsData = {
    labels: topProducts.map(p => p.product[0]?.name),
    datasets: [{
      label: 'Units Sold',
      data: topProducts.map(p => p.totalSold),
      backgroundColor: '#10b981',
    }]
  };

  return (
    <div className="row">
      <div className="col-md-6">
        <Line data={revenueChartData} />
      </div>
      <div className="col-md-6">
        <Bar data={topProductsData} />
      </div>
    </div>
  );
}