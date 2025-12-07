import React, { useState, useEffect } from 'react';
import { Input, Button, Select } from './ui/index.jsx';
import FilterBuilder from './FilterBuilder/FilterBuilder';

const FIELD_OPTIONS = [
  { label: 'Close', value: 'close', category: 'price' },
  { label: 'Open', value: 'open', category: 'price' },
  { label: 'High', value: 'high', category: 'price' },
  { label: 'Low', value: 'low', category: 'price' },
  { label: 'Volume', value: 'volume', category: 'price' },
  { label: 'Previous Close', value: 'prev_close', category: 'price' },
  { label: 'Change %', value: 'change_pct', category: 'price' },
  { label: 'VWAP', value: 'vwap', category: 'price' },
  { label: 'EMA', value: 'ema', category: 'indicator' },
  { label: 'SMA', value: 'sma', category: 'indicator' },
  { label: 'RSI', value: 'rsi', category: 'indicator' },
  { label: 'MACD', value: 'macd', category: 'indicator' },
  { label: 'ADX', value: 'adx', category: 'indicator' },
  { label: 'Bollinger Bands', value: 'bb', category: 'indicator' },
  { label: 'Stochastic', value: 'stoch', category: 'indicator' },
];

const OPERATOR_OPTIONS = [
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '=', value: '=' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
];

const LOGIC_OPTIONS = [
  { label: 'AND', value: 'AND' },
  { label: 'OR', value: 'OR' },
];

const defaultCondition = () => ({
  field: 'close',
  operator: '>',
  compareType: 'number', // 'number' | 'field' | 'indicator'
  compareValue: '',
  compareField: 'close',
  compareIndicator: { type: 'ema', field: 'close', period: 5 },
  logic: 'AND',
});

function indicatorToString(ind) {
  if (!ind) return '';
  if (ind.type === 'ema' || ind.type === 'sma') {
    return `${ind.type.toUpperCase()}(${FIELD_OPTIONS.find(f => f.value === ind.field)?.label || 'Close'}, ${ind.period})`;
  }
  if (ind.type === 'rsi') {
    return `RSI(${FIELD_OPTIONS.find(f => f.value === ind.field)?.label || 'Close'}, ${ind.period})`;
  }
  if (ind.type === 'macd') {
    return `MACD(${FIELD_OPTIONS.find(f => f.value === ind.field)?.label || 'Close'})`;
  }
  return '';
}

function conditionToString(cond) {
  let left = FIELD_OPTIONS.find(f => f.value === cond.field)?.label || cond.field;
  let op = cond.operator;
  let right = '';
  if (cond.compareType === 'number') right = cond.compareValue;
  if (cond.compareType === 'field') right = FIELD_OPTIONS.find(f => f.value === cond.compareField)?.label || cond.compareField;
  if (cond.compareType === 'indicator') right = indicatorToString(cond.compareIndicator);
  return `${left} ${op} ${right}`;
}

function conditionsToString(conditions) {
  return conditions.map((c, i) => (i > 0 ? ` ${c.logic} ` : '') + conditionToString(c)).join('');
}

const StockFilterBuilder = ({ onApply }) => {
  const [conditions, setConditions] = useState([defaultCondition()]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [strategyName, setStrategyName] = useState('');
  const [savedStrategies, setSavedStrategies] = useState([]);

  // Load saved strategies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customStrategies');
    if (saved) {
      setSavedStrategies(JSON.parse(saved));
    }
  }, []);

  const handleChange = (idx, key, value) => {
    const updated = [...conditions];
    updated[idx][key] = value;
    setConditions(updated);
  };

  const handleIndicatorChange = (idx, key, value) => {
    const updated = [...conditions];
    updated[idx].compareIndicator = { ...updated[idx].compareIndicator, [key]: value };
    setConditions(updated);
  };

  const addCondition = () => {
    setConditions([...conditions, defaultCondition()]);
  };

  const removeCondition = (idx) => {
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  const saveStrategy = () => {
    if (!strategyName.trim()) {
      alert('Please enter a strategy name');
      return;
    }
    const newStrategy = {
      id: Date.now(),
      name: strategyName,
      conditions: conditions,
      created: new Date().toISOString()
    };
    const updated = [...savedStrategies, newStrategy];
    setSavedStrategies(updated);
    localStorage.setItem('customStrategies', JSON.stringify(updated));
    setStrategyName('');
    alert('Strategy saved successfully!');
  };

  const loadStrategy = (strategy) => {
    setConditions(strategy.conditions);
    setStrategyName(strategy.name);
  };

  const deleteStrategy = (id) => {
    if (confirm('Delete this strategy?')) {
      const updated = savedStrategies.filter(s => s.id !== id);
      setSavedStrategies(updated);
      localStorage.setItem('customStrategies', JSON.stringify(updated));
    }
  };

  const generateMockData = (conditions) => {
    // Generate mock filtered data based on conditions
    const mockStocks = [
      { symbol: 'AAPL', close: 150.25, open: 148.50, high: 152.10, low: 147.80, volume: 1250000, change_pct: 1.2 },
      { symbol: 'GOOGL', close: 2750.80, open: 2720.30, high: 2780.50, low: 2715.20, volume: 890000, change_pct: 1.1 },
      { symbol: 'MSFT', close: 310.45, open: 308.20, high: 315.60, low: 306.90, volume: 1100000, change_pct: 0.7 },
      { symbol: 'TSLA', close: 245.30, open: 240.10, high: 248.90, low: 238.50, volume: 2100000, change_pct: 2.2 },
      { symbol: 'AMZN', close: 3380.75, open: 3350.20, high: 3420.10, low: 3340.80, volume: 750000, change_pct: 0.9 },
    ];
    
    // Simple filtering logic (in real app, this would be server-side)
    return mockStocks.filter(stock => {
      return conditions.every(condition => {
        const fieldValue = stock[condition.field] || 0;
        const compareValue = condition.compareType === 'number' ? 
          parseFloat(condition.compareValue) : stock[condition.compareField] || 0;
        
        switch (condition.operator) {
          case '>': return fieldValue > compareValue;
          case '<': return fieldValue < compareValue;
          case '>=': return fieldValue >= compareValue;
          case '<=': return fieldValue <= compareValue;
          case '=': return fieldValue === compareValue;
          default: return true;
        }
      });
    });
  };

  const handleApply = async () => {
    setLoading(true);
    setShowResults(true);
    
    // Simulate API call
    setTimeout(() => {
      const results = generateMockData(conditions);
      setFilteredData(results);
      setLoading(false);
      if (onApply) onApply(conditions, conditionsToString(conditions));
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Custom Strategy Builder</h1>
        <p className="text-gray-600">Create and test your own trading strategies with custom filters</p>
      </div>

      {/* Strategy Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Strategy Management</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Save Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Strategy Name</label>
            <div className="flex gap-2">
              <Input
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                placeholder="Enter strategy name..."
                className="flex-1"
              />
              <Button onClick={saveStrategy}>
                💾 Save
              </Button>
            </div>
          </div>
          
          {/* Load Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Saved Strategies</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {savedStrategies.map(strategy => (
                <div key={strategy.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{strategy.name}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => loadStrategy(strategy)}>
                      Load
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteStrategy(strategy.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {savedStrategies.length === 0 && (
                <p className="text-sm text-gray-500">No saved strategies</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Builder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Conditions</h2>
        {conditions.map((cond, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              {idx > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logic</label>
                  <select
                    value={cond.logic}
                    onChange={(e) => handleChange(idx, 'logic', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LOGIC_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                <select
                  value={cond.field}
                  onChange={(e) => handleChange(idx, 'field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <optgroup label="Price Data">
                    {FIELD_OPTIONS.filter(f => f.category === 'price').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Technical Indicators">
                    {FIELD_OPTIONS.filter(f => f.category === 'indicator').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
                <select
                  value={cond.operator}
                  onChange={(e) => handleChange(idx, 'operator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OPERATOR_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compare to</label>
                <select
                  value={cond.compareType}
                  onChange={(e) => handleChange(idx, 'compareType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="number">📊 Number</option>
                  <option value="field">📈 Field</option>
                  <option value="indicator">⚙️ Indicator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                {cond.compareType === 'number' && (
                  <Input
                    type="number"
                    value={cond.compareValue}
                    onChange={(e) => handleChange(idx, 'compareValue', e.target.value)}
                    placeholder="Enter value..."
                  />
                )}
                {cond.compareType === 'field' && (
                  <select
                    value={cond.compareField}
                    onChange={(e) => handleChange(idx, 'compareField', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_OPTIONS.filter(f => f.category === 'price').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
                {cond.compareType === 'indicator' && (
                  <div className="space-y-2">
                    <select
                      value={cond.compareIndicator.type}
                      onChange={(e) => handleIndicatorChange(idx, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FIELD_OPTIONS.filter(f => f.category === 'indicator').map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={cond.compareIndicator.period}
                        onChange={(e) => handleIndicatorChange(idx, 'period', e.target.value)}
                        placeholder="Period"
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-end">
                <Button size="sm" variant="ghost" onClick={() => removeCondition(idx)}>
                  🗑️
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={addCondition}>
              ➕ Add Condition
            </Button>
            
            <Button variant="outline" onClick={() => setConditions([defaultCondition()])}>
              🔄 Reset
            </Button>
          </div>
          
          <button
            onClick={handleApply}
            disabled={loading}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-lg font-bold rounded-lg shadow-lg transition-all"
          >
            {loading ? '⏳ Filtering...' : '🔍 FILTER STOCKS'}
          </button>
        </div>
        
        {/* Preview */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-800 mb-2">Strategy Preview:</div>
          <div className="text-sm text-blue-700">{conditionsToString(conditions)}</div>
        </div>
      </div>

      {/* Results */}
      {showResults && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Results</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-gray-600">Applying filters...</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Found {filteredData.length} stocks matching your criteria
                </p>
              </div>
              
              {filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Close</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">High</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Low</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredData.map((stock, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-4 font-medium text-gray-900">{stock.symbol}</td>
                          <td className="px-4 py-4 text-gray-900">${stock.close.toFixed(2)}</td>
                          <td className="px-4 py-4 text-gray-600">${stock.open.toFixed(2)}</td>
                          <td className="px-4 py-4 text-gray-600">${stock.high.toFixed(2)}</td>
                          <td className="px-4 py-4 text-gray-600">${stock.low.toFixed(2)}</td>
                          <td className="px-4 py-4 text-gray-600">{stock.volume.toLocaleString()}</td>
                          <td className={`px-4 py-4 font-medium ${
                            stock.change_pct > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change_pct > 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-600">No stocks match your filter criteria</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your conditions</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockFilterBuilder; 