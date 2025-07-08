import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppData } from '../context/AppDataContext';

const DataFileManager = () => {
  const { dataFiles, addDataFile, deleteDataFile, updateDataFile, refreshAllData } = useAppData();
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(dataFiles.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentDataFiles = dataFiles.slice(startIndex, endIndex);

  // Refresh data when component mounts
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      if (acceptedFiles[0]) {
        const fileName = acceptedFiles[0].name.replace('.csv', '');
        setName(fileName.replace(/_/g, ' ').replace(/-/g, ' '));
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target.result;
            const rows = text.split('\n');
            const headers = rows[0].split(',');
            const parsedData = rows.slice(1, 6).map(row => {
              if (!row.trim()) return null;
              const values = row.split(',');
              const rowData = {};
              headers.forEach((header, i) => {
                rowData[header.trim()] = values[i] ? values[i].trim() : '';
              });
              return rowData;
            }).filter(Boolean);
            setPreviewData({
              headers: headers.map(h => h.trim()),
              rows: parsedData,
              totalRows: rows.length - 1
            });
          } catch (err) {
            console.error('Error parsing CSV:', err);
          }
        };
        reader.readAsText(acceptedFiles[0].slice(0, 10000));
      }
    }
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name || !file) return;
    setLoading(true);
    setError(null);
    try {
      await addDataFile({ name, file });
      setName('');
      setFile(null);
      setPreviewData(null);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to upload data file.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this data file?')) {
      const success = await deleteDataFile(id);
      if (success) {
        setCurrentPage(1);
      } else {
        setError('Failed to delete data file.');
      }
    }
  };

  const handleEdit = (datafile) => {
    setEditingFile(datafile);
    setEditName(datafile.name);
    setEditFile(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName) return;
    setEditLoading(true);
    setError(null);
    try {
      const result = await updateDataFile(editingFile.id, { name: editName, file: editFile });
      if (result) {
        setEditingFile(null);
        setEditName('');
        setEditFile(null);
        setCurrentPage(1);
      } else {
        setError('Failed to update data file.');
      }
    } catch (err) {
      setError('Failed to update data file.');
    }
    setEditLoading(false);
  };

  const closeEditModal = () => {
    setEditingFile(null);
    setEditName('');
    setEditFile(null);
    setError(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const { getRootProps: getEditRootProps, getInputProps: getEditInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    noClick: false,
    noDrag: false,
    onDrop: acceptedFiles => {
      setEditFile(acceptedFiles[0]);
      if (acceptedFiles[0]) {
        const fileName = acceptedFiles[0].name.replace('.csv', '');
        const originalName = editingFile?.name || '';
        if (editName === originalName || !editName) {
          setEditName(fileName.replace(/_/g, ' ').replace(/-/g, ' '));
        }
      }
    }
  });

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4">
            <i className="fas fa-folder"></i>
            <span>Upload Market Data</span>
          </div>
          <hr className="mb-4" />
          {error && (
            <div className="bg-red-100 text-red-700 rounded p-3 mb-4">{error}</div>
          )}
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
              <input {...getInputProps()} />
              <div className="text-3xl mb-2 text-blue-500"><i className="fas fa-download"></i></div>
              {file ? (
                <div>
                  <div className="inline-block px-3 py-1 rounded border border-blue-500 text-blue-700 bg-blue-50 text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              ) : (
                <div className="text-gray-500">Drag and drop your CSV data file here, or click to select</div>
              )}
            </div>
            {previewData && (
              <div className="mb-2">
                <div className="text-xs font-semibold mb-1">Data Preview ({previewData.totalRows} rows)</div>
                <div className="overflow-x-auto bg-white rounded border border-gray-200">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        {previewData.headers.slice(0, 5).map((header, i) => (
                          <th key={i} className="px-2 py-1 text-left">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {previewData.headers.slice(0, 5).map((header, cellIndex) => (
                            <td key={cellIndex} className="px-2 py-1">{row[header]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <input
              type="text"
              placeholder="Data File Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className={`w-full py-2 rounded bg-blue-600 text-white font-semibold transition ${loading || !name || !file ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              disabled={loading || !name || !file}
            >
              {loading ? 'Uploading...' : 'Upload Data File'}
            </button>
          </form>
        </div>
        {/* Data Library Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <i className="fas fa-folder"></i>
              <span>Data Library</span>
            </div>
            <button
              className="p-2 rounded hover:bg-blue-100 text-blue-600"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh data files"
            >
              {refreshing ? <i className="fas fa-sync-alt animate-spin"></i> : <i className="fas fa-sync-alt"></i>}
            </button>
          </div>
          <hr className="mb-4" />
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Uploaded</th>
                  <th className="px-4 py-2 text-right">Size</th>
                  <th className="px-4 py-2 text-right">Rows</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDataFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-6">No data files uploaded yet</td>
                  </tr>
                ) : (
                  currentDataFiles.map((datafile) => (
                    <tr key={datafile.id}>
                      <td className="px-4 py-2 flex items-center gap-2">
                        <span className="text-blue-500"><i className="fas fa-folder"></i></span>
                        {datafile.name}
                      </td>
                      <td className="px-4 py-2">{new Date(datafile.uploaded_at).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">{datafile.file_size}</td>
                      <td className="px-4 py-2 text-right">{datafile.rows ? datafile.rows.toLocaleString() : '-'}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          className="p-1 rounded hover:bg-blue-100 text-blue-600 mr-2"
                          onClick={() => handleEdit(datafile)}
                          title="Edit data file"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-100 text-red-600"
                          onClick={() => handleDelete(datafile.id)}
                          title="Delete data file"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 mt-6">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1}-{Math.min(endIndex, dataFiles.length)} of {dataFiles.length} results
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
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Data File</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            {error && (
              <div className="bg-red-100 text-red-700 rounded p-3 mb-4">{error}</div>
            )}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replace File (Optional)
                </label>
                <div {...getEditRootProps()} className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <input {...getEditInputProps()} key={`edit-input-${editingFile?.id}`} />
                  {editFile ? (
                    <div>
                      <div className="text-sm text-blue-600 font-medium">{editFile.name}</div>
                      <div className="text-xs text-gray-500 mt-1">New file selected ({(editFile.size / 1024).toFixed(1)} KB)</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-gray-500">Click to select new file</div>
                      <div className="text-xs text-gray-400 mt-1">Current: {editingFile.file.split('/').pop()}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 px-4 rounded text-white font-semibold ${editLoading || !editName ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={editLoading || !editName}
                >
                  {editLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataFileManager;