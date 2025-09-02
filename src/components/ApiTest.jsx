import React, { useState } from 'react';
import { API_BASE_URL, apiCall } from '../config/api';

const ApiTest = () => {
  const [result, setResult] = useState('');

  const testApi = async () => {
    try {
      setResult(`Testing API at: ${API_BASE_URL}`);
      const response = await apiCall('/api/list-strategies/');
      const data = await response.json();
      setResult(`✅ API working! Found ${data.length} strategies`);
    } catch (error) {
      setResult(`❌ API Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>API Configuration Test</h3>
      <p>Current API URL: <code>{API_BASE_URL}</code></p>
      <button onClick={testApi} className="bg-blue-500 text-white px-4 py-2 rounded">
        Test API
      </button>
      {result && <p className="mt-2">{result}</p>}
    </div>
  );
};

export default ApiTest;