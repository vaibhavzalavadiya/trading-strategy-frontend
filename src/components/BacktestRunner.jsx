import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import StrategyManager from './StrategyManager';

const BacktestRunner = () => {
  const { strategies, dataFiles, addBacktest, refreshAllData } = useAppData();
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedDataFile, setSelectedDataFile] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tradePage, setTradePage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const tradePageSize = 10;

  // Refresh data when component mounts
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Reset selections when data changes
  useEffect(() => {
    // If selected strategy no longer exists, reset it
    if (selectedStrategy && !strategies.find(s => s.id.toString() === selectedStrategy)) {
      setSelectedStrategy('');
    }
    // If selected data file no longer exists, reset it
    if (selectedDataFile && !dataFiles.find(d => d.id.toString() === selectedDataFile)) {
      setSelectedDataFile('');
    }
  }, [strategies, dataFiles, selectedStrategy, selectedDataFile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const runBacktest = async () => {
    setError(null);
    setSuccess(null);
    if (!selectedStrategy || !selectedDataFile) {
      setError('Please select both a strategy and a data file.');
      return;
    }
    
    const strategy_id = parseInt(selectedStrategy, 10);
    const datafile_id = parseInt(selectedDataFile, 10);
    
    // Debug: log the raw values and types
    console.log('SelectedStrategy:', selectedStrategy, typeof selectedStrategy);
    console.log('SelectedDataFile:', selectedDataFile, typeof selectedDataFile);
    console.log('Parsed strategy_id:', strategy_id, typeof strategy_id);
    console.log('Parsed datafile_id:', datafile_id, typeof datafile_id);
    
    if (isNaN(strategy_id) || isNaN(datafile_id)) {
      setError('Invalid strategy or data file selection.');
      return;
    }
    
    console.log('Running backtest with:', { strategy_id, datafile_id }, strategy_id, datafile_id);
    console.log('Available strategies:', strategies);
    console.log('Available data files:', dataFiles);
    
    setLoading(true);
    try {
      const backendResult = await addBacktest({ strategy_id, datafile_id });
      console.log('Backend result:', backendResult);
      
      if (backendResult && backendResult.error) {
        let errorMsg = `Backend error: ${backendResult.error}`;
        if (backendResult.traceback) {
          errorMsg += `\nTraceback:\n${backendResult.traceback}`;
        }
        setError(errorMsg);
        setResults(null);
        setLoading(false);
        return;
      }
      
      if (backendResult && backendResult.result) {
        setResults({
          ...backendResult.result,
          summary: backendResult.result.summary || {},
          trades: backendResult.result.trades || [],
          currency: backendResult.result.currency || '$',
        });
        setSuccess('Backtest completed successfully!');
        await refreshAllData();
      } else {
        setResults(null);
        setError('Backtest completed but no results were returned.');
      }
    } catch (error) {
      console.error('Error in runBacktest:', error);
      setError('Failed to run backtest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;
    
    // Ensure we have the required properties
    const safeResults = {
      summary: results.summary || {},
      trades: Array.isArray(results.trades) ? results.trades : [],
      currency: results.currency || '$'
    };
    const totalTradePages = Math.ceil(safeResults.trades.length / tradePageSize);
    const tradeStartIndex = (tradePage - 1) * tradePageSize;
    const tradeEndIndex = tradeStartIndex + tradePageSize;
    const currentTrades = safeResults.trades.slice(tradeStartIndex, tradeEndIndex);
    
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <div className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-chart-bar"></i>
          <span>Backtest Results</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Object.entries(safeResults.summary).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
              <div className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</div>
              <div className="text-lg font-semibold mt-1">{value}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto thin-scrollbar bg-white rounded-lg shadow mb-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Price ({safeResults.currency})</th>
                <th className="px-4 py-2 text-right">Shares</th>
                <th className="px-4 py-2 text-right">Profit/Loss ({safeResults.currency})</th>
              </tr>
            </thead>
            <tbody>
              {currentTrades.map((trade, index) => (
                <tr key={index} className={trade.profit > 0 ? 'bg-green-50' : trade.profit < 0 ? 'bg-red-50' : ''}>
                  <td className="px-4 py-2">{trade.date || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${trade.type === 'BUY' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{trade.type || '-'}</span>
                  </td>
                  <td className="px-4 py-2 text-right">{typeof trade.price === 'number' ? trade.price.toLocaleString() : trade.price || '-'}</td>
                  <td className="px-4 py-2 text-right">{typeof trade.shares === 'number' ? trade.shares.toLocaleString() : trade.shares || '-'}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {trade.profit !== null && trade.profit !== undefined ? (
                      <span className={trade.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                        {trade.profit > 0 ? '+' : ''}{typeof trade.profit === 'number' ? trade.profit.toLocaleString() : trade.profit}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls for Trades */}
          {totalTradePages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 mt-6">
              <div className="text-sm text-gray-700">
                Showing {tradeStartIndex + 1}-{Math.min(tradeEndIndex, safeResults.trades.length)} of {safeResults.trades.length} trades
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTradePage(tradePage - 1)}
                  disabled={tradePage === 1}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    tradePage > 1 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalTradePages) }, (_, i) => {
                  let pageNum;
                  if (totalTradePages <= 5) {
                    pageNum = i + 1;
                  } else if (tradePage <= 3) {
                    pageNum = i + 1;
                  } else if (tradePage >= totalTradePages - 2) {
                    pageNum = totalTradePages - 4 + i;
                  } else {
                    pageNum = tradePage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setTradePage(pageNum)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        pageNum === tradePage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setTradePage(tradePage + 1)}
                  disabled={tradePage === totalTradePages}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    tradePage < totalTradePages 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <i className="fas fa-play"></i>
            <span>Backtest Runner</span>
          </div>
          <button
            className="p-2 rounded hover:bg-blue-100 text-blue-600"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            {refreshing ? <i className="fas fa-sync-alt animate-spin"></i> : <i className="fas fa-sync-alt"></i>}
          </button>
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 rounded p-3 mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 rounded p-3 mb-4">{success}</div>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Strategy Selection */}
          <div className="flex-1">
            <div className="mb-2 text-sm font-medium">1. Select Python Strategy</div>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedStrategy}
              onChange={e => setSelectedStrategy(e.target.value)}
            >
              <option value="">-- Select Strategy --</option>
              {strategies.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {strategies.length === 0 && (
              <div className="text-xs text-gray-400 mt-2">
                No strategies uploaded yet. Please upload one first.
              </div>
            )}
          </div>
          {/* Data File Selection */}
          <div className="flex-1">
            <div className="mb-2 text-sm font-medium">2. Select Market Data</div>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedDataFile}
              onChange={e => setSelectedDataFile(e.target.value)}
            >
              <option value="">-- Select Data File --</option>
              {dataFiles.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {dataFiles.length === 0 && (
              <div className="text-xs text-gray-400 mt-2">
                No data files uploaded yet. Please upload one first.
              </div>
            )}
          </div>
        </div>
        <button
          className={`w-full mt-6 py-2 rounded bg-blue-600 text-white font-semibold transition ${loading || !selectedStrategy || !selectedDataFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          onClick={runBacktest}
          disabled={loading || !selectedStrategy || !selectedDataFile}
        >
          {loading ? 'Running Backtest...' : 'Run Backtest'}
        </button>
        {renderResults()}
      </div>
    </div>
  );
};

export default BacktestRunner;