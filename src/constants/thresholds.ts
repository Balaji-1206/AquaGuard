export const SENSOR_THRESHOLDS = {
  pH: {
    minNormal: 6.8,
    maxNormal: 7.6,
    minWarning: 6.0,
    maxWarning: 8.5,
    unit: 'pH',
    normalRangeText: '6.8 - 7.6 pH (Ideal)',
  },
  tds: {
    minNormal: 30,
    maxNormal: 150, // Ideal household RO drinking range
    maxWarning: 300,
    unit: 'ppm',
    normalRangeText: '50 - 150 ppm (Pure RO)',
  },
  turbidity: {
    minNormal: 0,
    maxNormal: 1.0,
    maxWarning: 5.0,
    unit: 'NTU',
    normalRangeText: '0 - 1 NTU (Crystal Clear)',
  },
  temperature: {
    minNormal: 18.0,
    maxNormal: 30.0,
    maxWarning: 38.0,
    unit: '°C',
    normalRangeText: '18 - 30 °C',
  },
};
