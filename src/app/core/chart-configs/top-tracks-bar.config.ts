import { ChartConfiguration } from 'chart.js';

export function getTopTracksBarConfig(labels: string[], data: number[]): ChartConfiguration<'bar'> {
  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Top 5 Tracks by Streams',
          data,
          backgroundColor: [
            '#42a5f5', '#66bb6a', '#ffd600', '#ef5350', '#ab47bc'
          ],
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: { beginAtZero: true, title: { display: true, text: 'Streams' } },
        y: { title: { display: true, text: 'Track' } },
      },
    },
  };
}
