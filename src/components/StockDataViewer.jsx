import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';

export default function StockDataViewer() {
  const { dataFiles, refreshAllData } = useAppData();
  const [selectedFile, setSelectedFile] = useState('');
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const generateStockData = (fileName) => {
    const data = [];
    const startDate = new Date('2023-01-01');
    const isNSE = fileName.toLowerCase().includes('.ns');
    const basePrice = isNSE ? 500 + Math.random() * 2000 : 50 + Math.random() * 100;
    const symbol = fileName.replace('.csv', '').toUpperCase();
    const currency = isNSE ? '₹' : '$';
    
    for (let i = 0; i < 500; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const price = basePrice + (Math.random() - 0.5) * (isNSE ? 100 : 20) + Math.sin(i / 30) * (isNSE ? 50 : 10);
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({
        Date: date.toISOString().split('T')[0],
        Symbol: symbol,
        Open: (price + (Math.random() - 0.5) * (isNSE ? 10 : 2)).toFixed(2),
        High: (price + Math.random() * (isNSE ? 15 : 3)).toFixed(2),
        Low: (price - Math.random() * (isNSE ? 15 : 3)).toFixed(2),
        Close: price.toFixed(2),
        Volume: volume.toLocaleString(),
        Change: ((Math.random() - 0.5) * (isNSE ? 50 : 10)).toFixed(2),
        'Change %': ((Math.random() - 0.5) * 5).toFixed(2) + '%',
        Currency: currency
      });
    }
    
    return data;
  };

  const loadStockData = (fileId) => {
    if (!fileId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const selectedFileData = dataFiles.find(f => f.id.toString() === fileId);
      const data = generateStockData(selectedFileData?.name || 'Stock Data');
      setStockData(data);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load stock data: ' + err.message);
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(stockData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = stockData.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Stock Data Viewer</h1>
        <p className="text-gray-600 mt-1">View and analyze your CSV stock data files</p>
      </div>

      {/* File Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Data File</h2>
        
        {dataFiles.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-csv text-gray-400 text-xl"></i>
            </div>
            <p className="text-gray-500">No CSV files uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload data files to view stock data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataFiles.map(file => (
              <div
                key={file.id}
                onClick={() => {
                  setSelectedFile(file.id.toString());
                  loadStockData(file.id.toString());
                }}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedFile === file.id.toString()
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <i className="fas fa-file-csv text-green-600 text-lg"></i>
                  <span className="font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                    {file.name.toLowerCase().includes('.ns') ? '₹ NSE' : '$ USD'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                </p>
                {selectedFile === file.id.toString() && stockData.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <i className="fas fa-check-circle text-blue-600 text-sm"></i>
                    <span className="text-sm text-blue-600 font-medium">
                      {stockData.length.toLocaleString()} rows loaded
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <i className="fas fa-spinner fa-spin text-blue-600 text-2xl mb-4"></i>
          <p className="text-gray-600">Loading stock data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <i className="fas fa-exclamation-circle"></i>
            <span className="font-medium">Error</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Stock Data Table */}
      {stockData.length > 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Stock Data</h3>
              <span className="text-sm text-gray-600">
                {stockData.length.toLocaleString()} total rows
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Symbol</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900">Open</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900">High</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900">Low</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900">Close</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900">Volume</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900">Change</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900">Change %</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-gray-900">{row.Date}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {row.Symbol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{row.Currency}{row.Open}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{row.Currency}{row.High}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{row.Currency}{row.Low}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{row.Currency}{row.Close}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.Volume}</td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      parseFloat(row.Change) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(row.Change) >= 0 ? '+' : ''}{row.Currency}{row.Change}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      parseFloat(row['Change %']) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(row['Change %']) >= 0 ? '+' : ''}{row['Change %']}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, stockData.length)} of {stockData.length.toLocaleString()} rows
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 