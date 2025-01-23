// src/components/SalesDashboard.js
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function SalesDashboard({ revenueData, topProducts }) {
  const revenueChartData = {
    labels: revenueData.map(d => d._id),
    datasets: [{
      label: 'Monthly Revenue',
      data: revenueData.map(d => d.totalRevenue),
      borderColor: '#4f46e5',
      tension: 0.1
    }]
  };

  const topProductsData = {
    labels: topProducts.map(p => p.productName || 'Deleted Product'),
    datasets: [{
      label: 'Revenue Generated',
      data: topProducts.map(p => p.totalRevenue),
      backgroundColor: '#10b981',
    }, {
      label: 'Units Sold',
      data: topProducts.map(p => p.totalSold),
      backgroundColor: '#3b82f6',
    }]
  };

  return (
    <div className="row gap-4">
      <div className="col-md-12 bg-white p-4 rounded shadow-sm">
        <h4 className="mb-3">Revenue Trends</h4>
        <Line 
          data={revenueChartData}
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => `$${context.parsed.y.toFixed(2)}`
                }
              }
            }
          }}
        />
      </div>
      
      <div className="col-md-12 bg-white p-4 rounded shadow-sm">
        <h4 className="mb-3">Top Performing Products</h4>
        <Bar 
          data={topProductsData}
          options={{
            indexAxis: 'y',
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y || 0;
                    return `${label}: $${value.toFixed(2)}`;
                  }
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}