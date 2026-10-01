import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import './chartSetup.js';
import { chartColors, chartTooltipTheme } from './chartSetup.js';
import EmptyState from '../EmptyState.jsx';

export default function ExpenseDoughnut({ data }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        message="Add a transaction to see your spending breakdown."
      />
    );
  }

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: chartColors,
        borderColor: '#1c1017',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#b8a3ae',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          padding: 14,
          font: {
            size: 12,
          },
        },
      },
      tooltip: chartTooltipTheme,
    },
  };

  return (
    <div className="chart-canvas-wrap">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
