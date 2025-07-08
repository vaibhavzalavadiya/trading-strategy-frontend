import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';

export default function StockDataViewer() {
  const { strategies } = useAppData();
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [compatibleStocks, setCompatibleStocks] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backendBaseURL = import.meta.env.DEV
  ? 'http://localhost:8000'
  : ''; // production relative path

const fetchCompatibleStocks = async () => {
  if (!selectedStrategy) return;

  setLoading(true);
  setError('');
  setCompatibleStocks([]);
  setErrorCount(0);

  try {
    const res = await fetch(
      `${backendBaseURL}/api/compatible-stocks/?strategy_id=${selectedStrategy}`
    );

    const contentType = res.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      setError(`Expected JSON but got: ${text}`);
      setLoading(false);
      return;
    }

    if (res.ok && data.status === 'ok') {
      setCompatibleStocks(data.compatible_stocks || []);
      setErrorCount(data.error_count || 0);
    } else {
      setError(data.error || `Server error: ${res.status}`);
    }

  } catch (e) {
    console.error('Fetch error:', e);
    setError('Failed to fetch compatible stocks. Please check your network or backend logs.');
  }

  setLoading(false);
};

  

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Compatible Stocks for Strategy</h2>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Strategy</label>
          <select value={selectedStrategy} onChange={e => setSelectedStrategy(e.target.value)}>
  <option value="">Select Strategy</option>
  {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
</select>

        </div>
        <button onClick={fetchCompatibleStocks} className="bg-blue-600 text-white px-4 py-2 rounded h-10" disabled={!selectedStrategy || loading}>
          {loading ? 'Checking...' : 'Show Compatible Stocks'}
        </button>
      </div>
      {loading && <div className="text-blue-600 mb-2">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {compatibleStocks.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-gray-100">Stock Symbol</th>
              </tr>
            </thead>
            <tbody>
              {compatibleStocks.map((symbol, i) => (
                <tr key={symbol} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-2 py-1">{symbol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {compatibleStocks.length === 0 && !loading && selectedStrategy && !error && (
        <div className="text-gray-500 mt-4">No compatible stocks found for this strategy.</div>
      )}
      {errorCount > 0 && !loading && (
        <div className="text-yellow-700 bg-yellow-100 rounded p-2 mt-4 text-sm">{errorCount} stocks could not be checked due to errors.</div>
      )}
    </div>
  );
} 