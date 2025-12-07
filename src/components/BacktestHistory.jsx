import React, { useState, useEffect, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/index.jsx';

const getCurrencySymbol = (fileName) => {
  return fileName && fileName.toLowerCase().includes('.ns') ? '₹' : '$';
};

const BacktestHistory = ({ onNavigate }) => {
  const { backtests, deleteBacktest, refreshBacktests, strategies, dataFiles } = useAppData();
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [tradePages, setTradePages] = useState({});
  const tradePageSize = 10;
  
  // Filter states
  const [filters, setFilters] = useState({
    strategy: 'all',
    dataFile: 'all',
    profitability: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort backtests
  const filteredBacktests = useMemo(() => {
    let filtered = [...backtests];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bt => 
        bt.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bt.datafile.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Strategy filter
    if (filters.strategy !== 'all') {
      filtered = filtered.filter(bt => bt.strategy === filters.strategy);
    }
    
    // Data file filter
    if (filters.dataFile !== 'all') {
      filtered = filtered.filter(bt => bt.datafile === filters.dataFile);
    }
    
    // Profitability filter
    if (filters.profitability !== 'all') {
      filtered = filtered.filter(bt => {
        const profit = bt.result?.summary?.total_profit || 0;
        if (filters.profitability === 'profitable') return profit > 0;
        if (filters.profitability === 'loss') return profit < 0;
        return true;
      });
    }
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (filters.dateRange === '7d') cutoff.setDate(now.getDate() - 7);
      else if (filters.dateRange === '30d') cutoff.setDate(now.getDate() - 30);
      else if (filters.dateRange === '90d') cutoff.setDate(now.getDate() - 90);
      
      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(bt => new Date(bt.created_at) >= cutoff);
      }
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (filters.sortBy) {
        case 'strategy':
          aVal = a.strategy;
          bVal = b.strategy;
          break;
        case 'profit':
          aVal = a.result?.summary?.total_profit || 0;
          bVal = b.result?.summary?.total_profit || 0;
          break;
        case 'trades':
          aVal = a.result?.summary?.total_trades || 0;
          bVal = b.result?.summary?.total_trades || 0;
          break;
        default:
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
      }
      
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [backtests, filters, searchTerm]);
  
  // Get unique values for filters
  const uniqueStrategies = [...new Set(backtests.map(bt => bt.strategy))];
  const uniqueDataFiles = [...new Set(backtests.map(bt => bt.datafile))];

  // Calculate pagination
  const totalPages = Math.ceil(filteredBacktests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this backtest result?')) {
      const success = await deleteBacktest(id);
      if (!success) {
        setError('Failed to delete backtest result.');
      }
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const renderSummaryMetrics = (summary) => {
    if (!summary || typeof summary !== 'object') {
      console.warn('Invalid summary data:', summary);
      return <div className="text-gray-500 text-sm">No summary data available</div>;
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <div className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</div>
            <div className="text-lg font-semibold mt-1">{value}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderTradeTable = (trades, currency, tradePage, setTradePage) => {
    if (!Array.isArray(trades)) {
      console.warn('Invalid trades data:', trades);
      return <div className="text-gray-500 text-sm">No trade data available</div>;
    }
    const currencySymbol = currency || '$';
    const totalTradePages = Math.ceil(trades.length / tradePageSize);
    const tradeStartIndex = (tradePage - 1) * tradePageSize;
    const tradeEndIndex = tradeStartIndex + tradePageSize;
    const currentTrades = trades.slice(tradeStartIndex, tradeEndIndex);
    return (
      <div className="overflow-x-auto thin-scrollbar bg-white rounded-lg shadow mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Profit/Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTrades.map((trade, index) => (
              <TableRow key={index} className={trade.profit > 0 ? 'bg-green-50' : trade.profit < 0 ? 'bg-red-50' : ''}>
                <TableCell>{trade.date || '-'}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${trade.type === 'BUY' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{trade.type || '-'}</span>
                </TableCell>
                <TableCell className="text-right">{currencySymbol}{typeof trade.price === 'number' ? trade.price.toLocaleString() : trade.price || '-'}</TableCell>
                <TableCell className="text-right">{typeof trade.shares === 'number' ? trade.shares.toLocaleString() : trade.shares || '-'}</TableCell>
                <TableCell className="text-right font-medium">
                  {trade.profit !== null && trade.profit !== undefined ? (
                    <span className={trade.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                      {trade.profit > 0 ? '+' : ''}{currencySymbol}{typeof trade.profit === 'number' ? trade.profit.toLocaleString() : trade.profit}
                    </span>
                  ) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination Controls for Trades */}
        {totalTradePages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 mt-6">
            <div className="text-sm text-gray-700">
              Showing {tradeStartIndex + 1}-{Math.min(tradeEndIndex, trades.length)} of {trades.length} trades
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
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 mt-6">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredBacktests.length)} of {filteredBacktests.length} results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-sm font-medium ${
              currentPage > 1 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-sm font-medium ${
              currentPage < totalPages 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Backtest Results</h1>
            <p className="text-gray-600 mt-1">
              {filteredBacktests.length} of {backtests.length} results
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate ? onNavigate('Run Backtest') : window.location.href = '#run-backtest'}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <i className="fas fa-plus"></i>
              New Backtest
            </button>
            <button
              onClick={refreshBacktests}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Refresh results"
            >
              <i className="fas fa-sync-alt text-sm"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="fas fa-filter text-gray-500"></i>
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        </div>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search strategies or data files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
        
        {/* Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Strategy</label>
            <select
              value={filters.strategy}
              onChange={(e) => setFilters(prev => ({ ...prev, strategy: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">All Strategies</option>
              {uniqueStrategies.map(strategy => (
                <option key={strategy} value={strategy}>{strategy}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Data File</label>
            <select
              value={filters.dataFile}
              onChange={(e) => setFilters(prev => ({ ...prev, dataFile: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">All Data Files</option>
              {uniqueDataFiles.map(dataFile => (
                <option key={dataFile} value={dataFile}>{dataFile}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Profitability</label>
            <select
              value={filters.profitability}
              onChange={(e) => setFilters(prev => ({ ...prev, profitability: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">All Results</option>
              <option value="profitable">Profitable Only</option>
              <option value="loss">Loss Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="strategy">Strategy</option>
              <option value="profit">Profit</option>
              <option value="trades">Trades</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        
        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setFilters({
                strategy: 'all',
                dataFile: 'all',
                profitability: 'all',
                dateRange: 'all',
                sortBy: 'date',
                sortOrder: 'desc'
              });
              setSearchTerm('');
            }}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 rounded p-3 mb-4">{error}</div>
      )}
      {filteredBacktests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <i className="fas fa-chart-bar text-4xl mb-4 text-gray-300"></i>
          <div className="text-lg font-medium mb-2">No backtest results found</div>
          <div className="text-sm">Run your first backtest to see results here</div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBacktests.slice(startIndex, endIndex).map((result) => {
            const tradePage = tradePages[result.id] || 1;
            const setTradePage = (page) => setTradePages((prev) => ({ ...prev, [result.id]: page }));
            return (
              <div key={result.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <i className="fas fa-scroll"></i>
                    <span>{result.strategy}</span>
                    <span className="text-gray-400 text-sm">({result.datafile})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{result.date}</span>
                    <button
                      className="p-2 rounded hover:bg-red-100 text-red-600"
                      onClick={() => handleDelete(result.id)}
                      title="Delete backtest result"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                {result.summary && renderSummaryMetrics(result.summary)}
                {result.trades && renderTradeTable(result.trades, result.currency, tradePage, setTradePage)}
                {!result.summary && !result.trades && (
                  <div className="text-gray-500 text-sm mt-4">
                    <div>No detailed results available for this backtest.</div>
                    <div className="text-xs mt-1">Raw result data: {JSON.stringify(result.result, null, 2)}</div>
                  </div>
                )}
              </div>
            );
          })}
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default BacktestHistory;