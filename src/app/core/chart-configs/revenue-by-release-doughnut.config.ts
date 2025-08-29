import { ChartConfiguration } from 'chart.js';

export function getRevenueByReleaseDoughnutConfig(labels: string[], data: number[]): ChartConfiguration<'doughnut'> {
  return {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue by Release',
          data,
          backgroundColor: [
            '#42a5f5',
            '#66bb6a',
            '#ffd600',
            '#ef5350',
            '#ab47bc',
            '#ffa726',
            '#26a69a',
            '#8d6e63',
            '#789262',
            '#d4e157',
          ],
          borderColor: '#232b36',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: { enabled: true },
      },
    },
  };
}
