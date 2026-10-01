import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

export const chartColors = [
  '#c9184a',
  '#e0577f',
  '#d8a24a',
  '#9d4edd',
  '#5390d9',
  '#4caf7d',
  '#f2994a',
  '#ef476f',
  '#a13d5f',
  '#8d99ae',
];

export const chartTooltipTheme = {
  backgroundColor: '#241420',
  titleColor: '#f5eef1',
  bodyColor: '#b8a3ae',
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
};
