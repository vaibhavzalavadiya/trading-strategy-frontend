import React, { useEffect, useState } from "react";
import axios from "axios";

const BacktestResult = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/backtest/")
      .then((res) => {
        if (res.data.trades && res.data.trades.length > 0) {
          setData(res.data); // ✅ This was the issue
        } else {
          setError("No backtest results available");
        }
      })
      .catch(() => {
        setError("Error fetching backtest results");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p className="animate-pulse">Loading backtest results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Backtest Summary</h2>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
        <p className="text-lg font-medium text-gray-700">
          ✅ {data.message}
        </p>
        <p className="mt-2 text-gray-600">Total Trades: <strong>{data.total_trades}</strong></p>
        <p className="text-gray-600">Total Profit: <strong className="text-green-600">₹{data.profit}</strong></p>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-gray-800">Trade Details</h3>
      <div className="space-y-4">
        {data.trades.map((trade, index) => (
          <div
            key={index}
            className="bg-gray-50 hover:bg-gray-100 transition rounded-lg p-4 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Symbol: {trade.symbol}</span>
              <span
                className={`text-sm font-semibold ${
                  trade.profit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ₹{trade.profit}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Entry Date: <span className="font-medium">{trade.entry}</span> <br />
              Exit Date: <span className="font-medium">{trade.exit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BacktestResult;
