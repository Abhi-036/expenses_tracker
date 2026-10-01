import React from 'react';
import { Bar } from 'react-chartjs-2';
import './chartSetup.js';
import { chartTooltipTheme } from './chartSetup.js';
import EmptyState from '../EmptyState.jsx';

export default function IncomeExpenseBar({ data }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Not enough data yet"
        message="Once you log some transactions, this chart will come to life."
      />
    );
  }

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Income',
        data: data.map((d) => d.income),
        backgroundColor: '#4caf7d',
        borderRadius: 6,
        maxBarThickness: 28,
      },
      {
        label: 'Expenses',
        data: data.map((d) => d.expense),
        backgroundColor: '#c9184a',
        borderRadius: 6,
        maxBarThickness: 28,
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
      <Bar data={chartData} options={options} />
    </div>
  );
}
