import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

const API_BASE = `${API_BASE_URL}/api`;

export const AppDataProvider = ({ children }) => {
  const [dataFiles, setDataFiles] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [backtests, setBacktests] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comprehensive refresh function that fetches all data
  const refreshAllData = async () => {
    setLoading(true);
    console.log('🔄 Fetching data from:', API_BASE);
    try {
      // Fetch data sequentially to avoid overwhelming the server
      console.log('📁 Fetching datafiles...');
      const dfRes = await fetch(`${API_BASE}/list-datafiles/`)
        .then(r => {
          console.log('📁 Datafiles response:', r.status, r.ok);
          return r.ok ? r.json() : [];
        })
        .catch(err => {
          console.error('📁 Datafiles error:', err);
          return [];
        });
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('📜 Fetching strategies...');
      const stRes = await fetch(`${API_BASE}/list-strategies/`)
        .then(r => {
          console.log('📜 Strategies response:', r.status, r.ok);
          return r.ok ? r.json() : [];
        })
        .catch(err => {
          console.error('📜 Strategies error:', err);
          return [];
        });
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('📊 Fetching backtests...');
      const btRes = await fetch(`${API_BASE}/list-backtest-results/`)
        .then(r => {
          console.log('📊 Backtests response:', r.status, r.ok);
          return r.ok ? r.json() : [];
        })
        .catch(err => {
          console.error('📊 Backtests error:', err);
          return [];
        });
      
      console.log('✅ Data fetched:', { dataFiles: dfRes?.length, strategies: stRes?.length, backtests: btRes?.length || btRes?.results?.length });
      
      setDataFiles(dfRes || []);
      setStrategies(stRes || []);
      
      // Handle both old format (array) and new format (paginated object)
      if (Array.isArray(btRes)) {
        setBacktests(btRes);
      } else if (btRes && btRes.results) {
        setBacktests(btRes.results);
      } else {
        setBacktests([]);
      }
      
      // Build activity log from latest actions
      const acts = [];
      if (dfRes && Array.isArray(dfRes)) {
        dfRes.forEach(f => acts.push({ action: 'Data file added', item: f.name, time: new Date(f.uploaded_at).toLocaleString() }));
      }
      if (stRes && Array.isArray(stRes)) {
        stRes.forEach(s => acts.push({ action: 'Strategy uploaded', item: s.name, time: new Date(s.uploaded_at).toLocaleString() }));
      }
      const backtestData = Array.isArray(btRes) ? btRes : (btRes && btRes.results ? btRes.results : []);
      if (Array.isArray(backtestData)) {
        backtestData.forEach(b => acts.push({ action: 'Backtest completed', item: b.strategy, time: new Date(b.created_at).toLocaleString() }));
      }
      acts.sort((a, b) => new Date(b.time) - new Date(a.time));
      setActivity(acts);
    } catch (e) {
      console.error('💥 Error refreshing data:', e);
      // Set empty arrays as fallback
      setDataFiles([]);
      setStrategies([]);
      setBacktests([]);
      setActivity([]);
    }
    setLoading(false);
  };

  // Fetch all data on mount
  useEffect(() => {
    refreshAllData();
  }, []);

  // Upload data file to backend
  const addDataFile = async ({ name, file, ...rest }) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload-datafile/`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.id) {
      await refreshAllData();
    }
  };

  // Upload strategy to backend
  const addStrategy = async ({ name, file, ...rest }) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('script', file);
    const res = await fetch(`${API_BASE}/upload-strategy/`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.id) {
      await refreshAllData();
    }
  };

  // Run backtest and store result in backend
  const addBacktest = async ({ strategy_id, datafile_id }) => {
    try {
      const res = await fetch(`${API_BASE}/run-backtest/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy_id, datafile_id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Return error with status code and message
        return {
          error: data.error || `HTTP ${res.status}: ${res.statusText}`,
          status: res.status
        };
      }
      
      if (data.id) {
        // Refresh all data to get the latest backtest results
        await refreshAllData();
      }
      return data;
    } catch (error) {
      console.error('Network error in addBacktest:', error);
      return {
        error: 'Network error: Failed to connect to backend server.',
        status: 0
      };
    }
  };

  // Delete functions
  const deleteDataFile = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/delete-datafile/${id}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshAllData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting data file:', error);
      return false;
    }
  };

  const deleteStrategy = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/delete-strategy/${id}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshAllData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting strategy:', error);
      return false;
    }
  };

  const deleteBacktest = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/delete-backtest/${id}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBacktests(prev => prev.filter(bt => bt.id !== id));
        setActivity(prev => [{ action: 'Backtest deleted', item: 'Backtest result', time: new Date().toLocaleString() }, ...prev]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting backtest:', error);
      return false;
    }
  };

  // Update functions
  const updateDataFile = async (id, { name, file }) => {
    try {
      const formData = new FormData();
      formData.append('name', name); // Always send name
      if (file) formData.append('file', file);
      
      const res = await fetch(`${API_BASE}/update-datafile/${id}/`, {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        await refreshAllData();
        return true;
      }
      return null;
    } catch (error) {
      console.error('Error updating data file:', error);
      return null;
    }
  };

  const updateStrategy = async (id, { name, file }) => {
    try {
      console.log('🔄 Updating strategy:', { id, name, hasFile: !!file });
      const formData = new FormData();
      formData.append('name', name); // Always send name
      if (file) formData.append('script', file);
      
      const res = await fetch(`${API_BASE}/update-strategy/${id}/`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('📡 Update response status:', res.status);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log('✅ Update successful, response:', responseData);
        await refreshAllData();
        return true;
      } else {
        const errorData = await res.json();
        console.error('❌ Update failed:', errorData);
        return null;
      }
    } catch (error) {
      console.error('💥 Error updating strategy:', error);
      return null;
    }
  };

  // Refresh backtests from backend (kept for backward compatibility)
  const refreshBacktests = async () => {
    await refreshAllData();
  };

  return (
    <AppDataContext.Provider value={{
      dataFiles, strategies, backtests, activity, loading,
      addDataFile, addStrategy, addBacktest,
      deleteDataFile, deleteStrategy, deleteBacktest,
      updateDataFile, updateStrategy,
      refreshBacktests, refreshAllData
    }}>
      {children}
    </AppDataContext.Provider>
  );
}; 

