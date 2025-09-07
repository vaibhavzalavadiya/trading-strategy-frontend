// import React, { useState, useEffect } from 'react';
// import { API_BASE_URL } from '../config/api';
// import { useAppData } from '../context/AppDataContext';

// const DebugApi = () => {
//   const [status, setStatus] = useState('Checking...');
//   const { dataFiles, strategies, backtests, loading } = useAppData();

//   useEffect(() => {
//     const checkApi = async () => {
//       try {
//         console.log('🔍 Testing API connection to:', API_BASE_URL);
//         const response = await fetch(`${API_BASE_URL}/api/list-datafiles/`);
//         console.log('📡 Response:', response.status, response.statusText);
        
//         if (response.ok) {
//           const data = await response.json();
//           setStatus(`✅ Connected - Found ${data.length} datafiles`);
//         } else {
//           setStatus(`❌ Error ${response.status}: ${response.statusText}`);
//         }
//       } catch (error) {
//         console.error('🚨 Connection error:', error);
//         setStatus(`❌ Connection failed: ${error.message}`);
//       }
//     };
    
//     checkApi();
//   }, []);

//   return (
//     <div className="p-4 bg-gray-100 rounded-lg">
//       <h3 className="font-bold mb-2">API Debug Info</h3>
//       <div className="space-y-2 text-sm">
//         <p><strong>API URL:</strong> {API_BASE_URL}</p>
//         <p><strong>Status:</strong> {status}</p>
//         <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
//         <p><strong>Data Files:</strong> {dataFiles.length}</p>
//         <p><strong>Strategies:</strong> {strategies.length}</p>
//         <p><strong>Backtests:</strong> {backtests.length}</p>
//       </div>
//     </div>
//   );
// };

// export default DebugApi;