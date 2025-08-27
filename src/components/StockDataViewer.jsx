import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';

export default function StockDataViewer() {
  const { strategies } = useAppData();
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [compatibleStocks, setCompatibleStocks] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backendBaseURL = import.meta.env.DEV
    ? 'http://localhost:8000'
    : '';

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
          <div style={{ width: 200 }}>
            <Select value={selectedStrategy || "__none__"} onValueChange={v => setSelectedStrategy(v === "__none__" ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select Strategy</SelectItem>
                {strategies.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <button onClick={fetchCompatibleStocks} className="bg-blue-600 text-white px-4 py-2 rounded h-10" disabled={!selectedStrategy || loading}>
          {loading ? 'Checking...' : 'Show Compatible Stocks'}
        </button>
      </div>
      {loading && <div className="text-blue-600 mb-2">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {compatibleStocks.length > 0 && (
        <div className="overflow-x-auto border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock Symbol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compatibleStocks.map((symbol, i) => (
                <TableRow key={symbol} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell>{symbol}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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