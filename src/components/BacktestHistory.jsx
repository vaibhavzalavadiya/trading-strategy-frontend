import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';

const BacktestHistory = () => {
  const { backtests, deleteBacktest, refreshBacktests } = useAppData();
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [tradePages, setTradePages] = useState({});
  const tradePageSize = 10;

  // Debug: Log backtests data
  useEffect(() => {
    console.log('BacktestHistory - backtests data:', backtests);
  }, [backtests]);

  // Calculate pagination
  const totalPages = Math.ceil(backtests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBacktests = backtests.slice(startIndex, endIndex);

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
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    const totalTradePages = Math.ceil(trades.length / tradePageSize);
    const tradeStartIndex = (tradePage - 1) * tradePageSize;
    const tradeEndIndex = tradeStartIndex + tradePageSize;
    const currentTrades = trades.slice(tradeStartIndex, tradeEndIndex);
    return (
      <div className="overflow-x-auto thin-scrollbar bg-white rounded-lg shadow mb-4">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Price ({currencySymbol})</th>
              <th className="px-4 py-2 text-right">Shares</th>
              <th className="px-4 py-2 text-right">Profit/Loss ({currencySymbol})</th>
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
          Showing {startIndex + 1}-{Math.min(endIndex, backtests.length)} of {backtests.length} results
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
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <i className="fas fa-chart-bar"></i>
          <span>Backtest History</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {backtests.length} backtest{backtests.length !== 1 ? 's' : ''} completed
          </div>
          <button
            onClick={refreshBacktests}
            className="text-sm text-blue-600 hover:text-blue-800"
            title="Refresh backtest history"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 rounded p-3 mb-4">{error}</div>
      )}
      {backtests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <i className="fas fa-chart-bar text-4xl mb-4 text-gray-300"></i>
          <div className="text-lg font-medium mb-2">No backtest results found</div>
          <div className="text-sm">Run your first backtest to see results here</div>
        </div>
      ) : (
        <div className="space-y-8">
          {currentBacktests.map((result) => {
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