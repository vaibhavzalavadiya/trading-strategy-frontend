import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Select } from './ui/index.jsx';

const StrategyUploader = () => {
  const [file, setFile] = useState(null);
  const [timeframe, setTimeframe] = useState('1h');
  const [pineScript, setPineScript] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [csvColumns, setCsvColumns] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setError(null);
    setCsvColumns(null);
    
    // Read the CSV file to show columns
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const firstLine = text.split('\n')[0];
      const columns = firstLine.split(',').map(col => col.trim());
      setCsvColumns(columns);
    };
    reader.readAsText(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!file || !pineScript) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timeframe', timeframe);
    formData.append('pineScript', pineScript);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze-strategy/', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze strategy');
      }

      setResults(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div>
              <p className="text-green-600">File selected: {file.name}</p>
              {csvColumns && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>CSV Columns:</p>
                  <ul className="list-disc list-inside">
                    {csvColumns.map((col, index) => (
                      <li key={index}>{col}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">
              {isDragActive
                ? 'Drop the CSV file here'
                : 'Drag and drop a CSV file here, or click to select'}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Timeframe</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Minute</SelectItem>
                <SelectItem value="5m">5 Minutes</SelectItem>
                <SelectItem value="15m">15 Minutes</SelectItem>
                <SelectItem value="30m">30 Minutes</SelectItem>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="4h">4 Hours</SelectItem>
                <SelectItem value="1d">1 Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pine Script Strategy</label>
            <textarea
              value={pineScript}
              onChange={(e) => setPineScript(e.target.value)}
              placeholder="// Enter your Pine Script strategy here
// Example:
// strategy('My Strategy', overlay=true)
// rsi = ta.rsi(close, 14)
// strategy.entry('Buy', strategy.long, when=rsi < 30)
// strategy.entry('Sell', strategy.short, when=rsi > 70)"
              rows="10"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || !pineScript || loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium
              ${!file || !pineScript || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? 'Analyzing...' : 'Analyze Strategy'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 font-medium">Error:</p>
              <p className="text-red-600 mt-1">{error}</p>
              <div className="mt-2 text-sm text-red-600">
                <p>Required columns:</p>
                <ul className="list-disc list-inside">
                  <li>timestamp (or date/time)</li>
                  <li>open (or opening price)</li>
                  <li>high (or highest price)</li>
                  <li>low (or lowest price)</li>
                  <li>close (or closing/last price)</li>
                  <li>volume (or amount/quantity)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {results && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyUploader; 