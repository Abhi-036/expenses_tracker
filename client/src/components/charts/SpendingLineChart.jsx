import React from 'react';
import { Line } from 'react-chartjs-2';
import './chartSetup.js';
import { chartTooltipTheme } from './chartSetup.js';
import EmptyState from '../EmptyState.jsx';

export default function SpendingLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No trend yet"
        message="Your monthly spending trend will appear here over time."
      />
    );
  }

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Expenses',
        data: data.map((d) => d.expense),
        borderColor: '#e0577f',
        backgroundColor: 'rgba(224, 87, 127, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#e0577f',
        pointRadius: 4,
      },
      {
        label: 'Income',
        data: data.map((d) => d.income),
        borderColor: '#4caf7d',
        backgroundColor: 'rgba(76, 175, 125, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4caf7d',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#b8a3ae',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
        },
      },
      tooltip: chartTooltipTheme,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8a7581',
        },
      },
      y: {
        grid: {
          color: 'rgba(255,255,255,0.05)',
        },
        ticks: {
          color: '#8a7581',
        },
      },
    },
  };

  return (
    <div className="chart-canvas-wrap">
      <Line data={chartData} options={options} />
    </div>
  );
}
