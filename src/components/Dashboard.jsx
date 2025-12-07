import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Select, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Card, CardHeader, CardContent, CardTitle, Button, Badge } from './ui/index.jsx';

const Dashboard = ({ onNavigate }) => {
  const { dataFiles, strategies, backtests, activity, refreshBacktests } = useAppData();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(backtests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBacktests = backtests.slice(startIndex, endIndex);

  // Calculate real statistics
  const calculateStats = () => {
    const totalStrategies = strategies.length;
    const totalDataFiles = dataFiles.length;
    const totalBacktests = backtests.length;

    // Calculate success rate based on profitable backtests
    const profitableBacktests = backtests.filter(bt =>
      bt.result?.summary?.total_profit > 0
    ).length;
    const successRate = totalBacktests > 0 ? Math.round((profitableBacktests / totalBacktests) * 100) : 0;

    // Calculate total profit across all backtests
    const totalProfit = backtests.reduce((sum, bt) =>
      sum + (bt.result?.summary?.total_profit || 0), 0
    );

    // Calculate average profit per backtest
    const avgProfit = totalBacktests > 0 ? totalProfit / totalBacktests : 0;

    // Get recent activity
    const recentActivity = activity.slice(0, 5);

    // Get top performing strategies
    const strategyPerformance = strategies.map(strategy => {
      const strategyBacktests = backtests.filter(bt => bt.strategy === strategy.name);
      const totalProfit = strategyBacktests.reduce((sum, bt) =>
        sum + (bt.result?.summary?.total_profit || 0), 0
      );
      const avgProfit = strategyBacktests.length > 0 ? totalProfit / strategyBacktests.length : 0;
      return {
        name: strategy.name,
        totalProfit,
        avgProfit,
        backtestCount: strategyBacktests.length
      };
    }).sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 3);

    return {
      totalStrategies,
      totalDataFiles,
      totalBacktests,
      successRate,
      totalProfit,
      avgProfit,
      recentActivity,
      strategyPerformance
    };
  };

  const stats = calculateStats();

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBacktests();
    setIsRefreshing(false);
  };

  // Get status color based on profit
  const getProfitColor = (profit) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Get status indicator
  const getStatusIndicator = () => {
    const hasData = dataFiles.length > 0 && strategies.length > 0;
    const hasBacktests = backtests.length > 0;
    const isProfitable = stats.successRate > 50;

    if (!hasData) return { status: 'Setup Required', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (!hasBacktests) return { status: 'Ready to Test', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (isProfitable) return { status: 'Performing Well', color: 'text-green-600', bg: 'bg-green-100' };
    return { status: 'Needs Optimization', color: 'text-orange-600', bg: 'bg-orange-100' };
  };

  const statusIndicator = getStatusIndicator();

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header with Status */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">Trading Strategy Dashboard</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
            <div>
              <p className="text-muted-foreground text-lg">Monitor your trading performance and strategy analytics</p>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Badge className={`px-4 py-2 font-semibold shadow ${statusIndicator.bg} ${statusIndicator.color}`}>{statusIndicator.status}</Badge>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-muted hover:bg-accent text-foreground"
                aria-label="Refresh Backtests"
                title="Refresh Backtests"
              >
                {isRefreshing ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : (
                  <i className="fas fa-sync-alt"></i>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-2 mt-2">
                <i className="fas fa-scroll text-blue-500 text-xl"></i>
                <span className="text-3xl font-bold text-gray-800">{stats.totalStrategies}</span>
            </div>
            <div className="text-blue-700 text-sm font-medium mt-2">Strategies</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-2 mt-2">
                <i className="fas fa-database text-green-500 text-xl"></i>
                <span className="text-3xl font-bold text-gray-800">{stats.totalDataFiles}</span>
            </div>
            <div className="text-green-700 text-sm font-medium mt-2">Data Files</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-2 mt-2">
                <i className="fas fa-history text-purple-500 text-xl"></i>
                <span className="text-3xl font-bold text-gray-800">{stats.totalBacktests}</span>
            </div>
            <div className="text-purple-700 text-sm font-medium mt-2">Backtests</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-2 mt-2">
                <i className="fas fa-percentage text-yellow-500 text-xl"></i>
                <span className="text-3xl font-bold text-gray-800">{stats.successRate}%</span>
            </div>
            <div className="text-yellow-700 text-sm font-medium mt-2">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Responsive Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {/* Performance Overview */}
        <Card className="col-span-2 bg-white">
          <CardHeader className="">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-600"></i>
            Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex flex-col items-center justify-center p-6 bg-white border min-h-[120px]">
              <i className="fas fa-rupee-sign text-green-500 text-2xl mb-2"></i>
                <div className="text-2xl font-bold text-green-600">
                  ₹{stats.totalProfit.toLocaleString()}
                </div>
              <div className="text-sm text-green-700 font-medium">Total Profit</div>
              <div className="text-xs text-green-600 mt-1">All Time</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6 bg-white border min-h-[120px]">
                <i className="fas fa-chart-bar text-blue-500 text-2xl mb-2"></i>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{stats.avgProfit.toLocaleString()}
            </div>
              <div className="text-sm text-blue-700 font-medium">Avg Profit</div>
              <div className="text-xs text-blue-600 mt-1">Per Backtest</div>
              </Card>
              <Card className="flex flex-col items-center justify-center p-6 bg-white border min-h-[120px]">
              <i className="fas fa-trophy text-purple-500 text-2xl mb-2"></i>
              <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
              <div className="text-sm text-purple-700 font-medium">Win Rate</div>
              <div className="text-xs text-purple-600 mt-1">Profitable Trades</div>
              </Card>
            </div>
          </CardContent>
        </Card>
        {/* Quick Actions */}
        <Card className="col-span-1 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i className="fas fa-bolt text-green-600"></i>
            Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
              <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow"
              onClick={() => onNavigate && onNavigate('Data Files')}
              aria-label="Upload Data File"
              title="Go to Data Files section to upload"
            >
              <i className="fas fa-upload mr-2"></i>
              Upload Data File
              </Button>
              <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow"
              onClick={() => onNavigate && onNavigate('Strategies')}
              aria-label="Upload Strategy"
              title="Go to Strategies section to upload"
            >
              <i className="fas fa-upload mr-2"></i>
              Upload Strategy
              </Button>
              <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow"
              onClick={() => onNavigate && onNavigate('Run Backtest')}
              aria-label="Run Backtest"
              title="Go to Run Backtest section"
            >
              <i className="fas fa-play mr-2"></i>
              Run Backtest
              </Button>
          </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">

        {/* Top Performing Strategies */}
        <Card className="bg-white">
          <CardHeader className="">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <i className="fas fa-trophy text-yellow-600"></i>
            Top Performing Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
          {stats.strategyPerformance.length > 0 ? (
            <div className="space-y-4">
              {stats.strategyPerformance.map((strategy, index) => (
                  <Card key={strategy.name} className={`flex items-center justify-between p-4 shadow border ${index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-4">
                      <Badge className={`w-10 h-10 flex items-center justify-center text-white font-bold text-lg shadow ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}>{index + 1}</Badge>
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">{strategy.name}</div>
                      <div className="text-sm text-gray-500">{strategy.backtestCount} backtests</div>
                    </div>
                  </div>
                  <div className="text-right">
                      <span className={`font-bold ${getProfitColor(strategy.totalProfit)} text-lg`}><Badge>₹{strategy.totalProfit.toLocaleString()}</Badge></span>
                      <div className="text-sm text-gray-500">
                        Avg: <Badge>₹{strategy.avgProfit.toLocaleString()}</Badge>
                    </div>
                    </div>
                  </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-chart-bar text-4xl mb-4 text-gray-300"></i>
              <div>No strategies with backtest results yet</div>
              <div className="text-sm mt-2">Run some backtests to see performance data</div>
            </div>
          )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white">
          <CardHeader className="">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i className="fas fa-clock text-blue-600"></i>
            Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                  <Card key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg shadow border border-gray-100">
                    <Badge className="w-2 h-2 bg-blue-600 rounded-full mt-2 p-0"></Badge>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      <i className="fas fa-bolt text-blue-400"></i>
                      {activity.action}
                    </div>
                    <div className="text-xs text-gray-500">{activity.item}</div>
                    <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                  </div>
                  </Card>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <div>No recent activity</div>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

      </div>

      {/* Recent Backtests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 text-nowrap">
              <i className="fas fa-history text-blue-600"></i>
              Recent Backtests
            </h2>
            <Select value={selectedTimeframe} onChange={(e) => setSelectedTimeframe(e.target.value)} className="w-[150px]">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600 text-nowrap">Rows per page:</label>
            <Select value={pageSize.toString()} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="w-[100px]">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Strategy</TableHead>
                <TableHead>Data File</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Profit/Loss</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBacktests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-gray-500">
                      <i className="fas fa-chart-bar text-4xl mb-4 text-gray-300 block"></i>
                      <div className="text-lg font-medium mb-2">No backtests yet</div>
                      <div className="text-sm">Run your first backtest to see results here</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentBacktests.map((backtest, idx) => (
                  <TableRow key={backtest.id} className="hover:bg-blue-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-scroll text-blue-600 text-sm"></i>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{backtest.strategy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">{backtest.datafile}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {backtest.result?.summary?.total_trades || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-bold ${getProfitColor(backtest.result?.summary?.total_profit || 0)}`}>
                        {backtest.result?.summary?.total_profit !== undefined
                          ? `₹${backtest.result.summary.total_profit.toLocaleString()}`
                          : '--'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 mr-2">
                          {backtest.result?.summary?.win_rate || 0}%
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${backtest.result?.summary?.win_rate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(backtest.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-between bg-white rounded-lg shadow p-4 mt-6" aria-label="Pagination">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1}-{Math.min(endIndex, backtests.length)} of {backtests.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentPage > 1
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                aria-label="Previous Page"
                title="Previous Page"
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
                    className={`px-3 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    aria-current={pageNum === currentPage ? 'page' : undefined}
                    aria-label={`Go to page ${pageNum}`}
                    title={`Go to page ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentPage < totalPages
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                aria-label="Next Page"
                title="Next Page"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>

  );
};

export default Dashboard; 