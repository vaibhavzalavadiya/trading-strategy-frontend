export const numericIndicators = [
  'Close', 'Open', 'High', 'Low', 'Volume',
  'Previous Close', 'Change %', 'VWAP', 'Delivery %',
  '52 Week High', '52 Week Low'
];

export const paramIndicators = [
  'EMA', 'SMA', 'RSI', 'MACD', 'ADX', 'Supertrend',
  'CCI', 'ATR', 'WMA', 'Stochastic K', 'Stochastic D',
  'Bollinger Bands', 'MFI'
];

export const operators = [
  '>', '<', '>=', '<=', '=', '!=',
  'crossed above', 'crossed below',
  'increased by', 'decreased by'
];

export const joiners = ['AND', 'OR'];

export const indicatorSources = ['Close', 'Open', 'High', 'Low', 'Volume'];

export const paramIndicatorMeta = [
  {
    name: 'EMA',
    params: [
      { name: 'source', type: 'select', options: indicatorSources },
      { name: 'period', type: 'number' },
    ],
  },
  {
    name: 'RSI',
    params: [
      { name: 'source', type: 'select', options: indicatorSources },
      { name: 'period', type: 'number' },
    ],
  },
  {
    name: 'Supertrend',
    params: [
      { name: 'period', type: 'number' },
      { name: 'multiplier', type: 'number' },
    ],
  },
]; 