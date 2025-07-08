import React, { useState, useEffect } from 'react';
import { useAppData } from './context/AppDataContext';
import Dashboard from './components/Dashboard';
import StrategyManager from './components/StrategyManager';
import DataFileManager from './components/DataFileManager';
import BacktestRunner from './components/BacktestRunner';
import BacktestHistory from './components/BacktestHistory';
import StockDataViewer from './components/StockDataViewer';

const sections = [
  { 
    label: 'Dashboard', 
    icon: <i className="fas fa-tachometer-alt"></i>, 
    component: <Dashboard />,
    description: 'Overview and quick actions'
  },
  { 
    label: 'Data Files', 
    icon: <i className="fas fa-folder"></i>, 
    component: <DataFileManager />,
    description: 'Manage market data files'
  },
  { 
    label: 'Strategies', 
    icon: <i className="fas fa-scroll"></i>, 
    component: <StrategyManager />,
    description: 'Upload and manage trading strategies'
  },
  { 
    label: 'Run Backtest', 
    icon: <i className="fas fa-play"></i>, 
    component: <BacktestRunner />,
    description: 'Execute strategy backtesting'
  },
  { 
    label: 'Results', 
    icon: <i className="fas fa-chart-bar"></i>, 
    component: <BacktestHistory />,
    description: 'View backtest results and history'
  },
  {
    label: 'Stock Data Viewer',
    icon: <i className="fas fa-database"></i>,
    component: <StockDataViewer />,
    description: 'Browse and filter stock CSV data'
  },
];

function App() {
  const { strategies, dataFiles, backtests, activity, loading } = useAppData();
  const [selected, setSelected] = useState(0); // Default to Dashboard
  const [mobileOpen, setMobileOpen] = useState(false);

  // Debug: Log data for troubleshooting
  useEffect(() => {
    console.log('App.jsx - Current data:', {
      strategies: strategies.length,
      dataFiles: dataFiles.length,
      backtests: backtests.length,
      activity: activity.length,
      loading,
      selectedSection: sections[selected].label
    });
    console.log('App.jsx - Backtests data:', backtests);
  }, [strategies, dataFiles, backtests, activity, loading, selected]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Dynamic sidebar stats based on context data
  const sidebarStats = {
    totalStrategies: strategies.length,
    totalDataFiles: dataFiles.length,
    recentBacktests: backtests.length,
    systemStatus: 'Online'
  };

  // Recent activity from context (show last 3)
  const recentActivity = activity.slice(0, 3);

  // Add onNavigate callback for Dashboard
  const handleNavigate = (sectionLabel) => {
    const idx = sections.findIndex(s => s.label === sectionLabel);
    if (idx !== -1) setSelected(idx);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed z-30 inset-y-0 left-0 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <i className="fas fa-chart-line text-white text-xl"></i>
          </div>
          <div>
            <div className="font-bold text-lg">Trading Strategy</div>
            <div className="text-xs text-gray-500">Backtesting Platform</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="overflow-auto sidebar-scroll">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="font-semibold text-blue-600">{sidebarStats.totalStrategies}</div>
              <div className="text-gray-500">Strategies</div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="font-semibold text-green-600">{sidebarStats.totalDataFiles}</div>
              <div className="text-gray-500">Data Files</div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-600">System Status:</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-600 font-medium">{sidebarStats.systemStatus}</span>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-600">Backtests:</span>
            <span className="text-blue-600 font-medium">{sidebarStats.recentBacktests}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sections.map((section, index) => (
            <button
              key={section.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 group ${
                selected === index 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'hover:bg-blue-50 text-gray-700 hover:text-blue-700'
              }`}
              onClick={() => {
                setSelected(index);
                setMobileOpen(false);
              }}
            >
              <span className={`text-lg transition-colors ${selected === index ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`}>
                {section.icon}
              </span>
              <div className="flex-1 text-left">
                <div className="font-medium">{section.label}</div>
                <div className={`text-xs ${selected === index ? 'text-blue-100' : 'text-gray-400'}`}>
                  {section.description}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Recent Activity */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-600 mb-2">Recent Activity</div>
          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <div className="text-xs text-gray-400">No recent activity</div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="text-xs text-gray-500">
                  <div className="font-medium text-gray-700">{activity.action}</div>
                  <div className="flex justify-between">
                    <span>{activity.item}</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                <i className="fas fa-user"></i>
              </div>
              <div>
                <div className="font-medium text-sm">Trading User</div>
                <div className="text-xs text-gray-400">Premium Plan</div>
              </div>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Settings">
              <i className="fas fa-cog text-sm"></i>
            </button>
          </div>
        </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 sm:hidden" onClick={handleDrawerToggle}></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-0 sm:ml-72 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center h-16 px-4 sm:px-6">
          <button className="sm:hidden mr-3 p-2 rounded-lg hover:bg-gray-100" onClick={handleDrawerToggle}>
            <i className="fas fa-bars text-gray-600"></i>
          </button>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-lg font-semibold text-gray-800">{sections[selected].label}</h1>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{sections[selected].description}</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {selected === 0 && (
              <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                <i className="fas fa-plus mr-1"></i>
                New Backtest
              </button>
            )}
            {selected === 1 && (
              <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                <i className="fas fa-upload mr-1"></i>
                Upload Data
              </button>
            )}
            {selected === 2 && (
              <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                <i className="fas fa-upload mr-1"></i>
                Upload Strategy
              </button>
            )}
            {selected === 4 && (
              <button className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors">
                <i className="fas fa-sync-alt mr-1"></i>
                Refresh Results
              </button>
            )}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-gray-50">
            {loading && selected === 4 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-gray-600">Loading backtest results...</div>
                </div>
              </div>
            ) : (
              selected === 0 ? (
                <Dashboard onNavigate={handleNavigate} />
              ) : (
                sections[selected].component
              )
            )}
        </main>
      </div>
    </div>
  );
}

export default App;