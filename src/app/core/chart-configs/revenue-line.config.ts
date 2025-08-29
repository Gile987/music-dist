import { ChartConfiguration } from 'chart.js';

export function getRevenueLineConfig(labels: string[], data: number[]): ChartConfiguration<'line'> {
  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Monthly Revenue',
          data,
          borderColor: '#42a5f5',
          backgroundColor: 'rgba(66,165,245,0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Revenue ($)' },
        },
        x: { title: { display: true, text: 'Month' } },
      },
    },
  };
}
