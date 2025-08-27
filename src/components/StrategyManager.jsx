import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppData } from '../context/AppDataContext';
import { Input } from './ui/input';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

const StrategyManager = () => {
  const { strategies, addStrategy, deleteStrategy, updateStrategy, refreshAllData } = useAppData();
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(strategies.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentStrategies = strategies.slice(startIndex, endIndex);

  // Refresh data when component mounts
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/x-python': ['.py']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      if (acceptedFiles[0]) {
        const fileName = acceptedFiles[0].name.replace('.py', '');
        setName(fileName.replace(/_/g, ' ').replace(/-/g, ' '));
      }
      setError(null);
    }
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name || !file) return;
    setLoading(true);
    setError(null);
    try {
      await addStrategy({ name, file });
      setName('');
      setFile(null);
      setCurrentPage(1); // Reset to first page after add
    } catch (err) {
      setError('Failed to upload strategy.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      const success = await deleteStrategy(id);
      if (success) {
        setCurrentPage(1); // Reset to first page after delete
      } else {
        setError('Failed to delete strategy.');
      }
    }
  };

  const handleEdit = (strategy) => {
    setEditingStrategy(strategy);
    setEditName(strategy.name);
    setEditFile(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName) return;
    setEditLoading(true);
    setError(null);
    try {
      const result = await updateStrategy(editingStrategy.id, { name: editName, file: editFile });
      if (result) {
        // updateStrategy in context already updates the state, no need to call refreshAllData
        setEditingStrategy(null);
        setEditName('');
        setEditFile(null);
        setCurrentPage(1); // Reset to first page after update
      } else {
        setError('Failed to update strategy.');
      }
    } catch (err) {
      setError('Failed to update strategy.');
    }
    setEditLoading(false);
  };

  const closeEditModal = () => {
    setEditingStrategy(null);
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
      'text/x-python': ['.py']
    },
    maxFiles: 1,
    noClick: false,
    noDrag: false,
    onDrop: acceptedFiles => {
      setEditFile(acceptedFiles[0]);
      if (acceptedFiles[0]) {
        const fileName = acceptedFiles[0].name.replace('.py', '');
        const originalName = editingStrategy?.name || '';
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
            <i className="fas fa-scroll"></i>
            <span>Upload Strategy</span>
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
                <div className="text-gray-500">Drag and drop your Python strategy script here, or click to select</div>
              )}
            </div>
            <Input
              type="text"
              placeholder="Strategy Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full text-sm"
            />
            <button
              type="submit"
              className={`w-full py-2 rounded bg-blue-600 text-white font-semibold transition ${loading || !name || !file ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              disabled={loading || !name || !file}
            >
              {loading ? 'Uploading...' : 'Upload Strategy'}
            </button>
          </form>
        </div>
        {/* Strategy Library Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <i className="fas fa-scroll"></i>
              <span>Strategy Library</span>
            </div>
            <button
              className="p-2 rounded hover:bg-blue-100 text-blue-600"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh strategies"
            >
              {refreshing ? <i className="fas fa-sync-alt animate-spin"></i> : <i className="fas fa-sync-alt"></i>}
            </button>
          </div>
          <hr className="mb-4" />
          <div className="overflow-x-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStrategies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-400 py-6">No strategies uploaded yet</TableCell>
                  </TableRow>
                ) : (
                  currentStrategies.map((strategy) => (
                    <TableRow key={strategy.id}>
                      <TableCell className="flex items-center gap-2">
                        <span className="text-blue-500"><i className="fas fa-scroll"></i></span>
                        {strategy.name}
                      </TableCell>
                      <TableCell>{new Date(strategy.uploaded_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{strategy.file_size}</TableCell>
                      <TableCell className="text-right">
                        <button
                          className="p-1 rounded hover:bg-blue-100 text-blue-600 mr-2"
                          onClick={() => handleEdit(strategy)}
                          title="Edit strategy"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-100 text-red-600"
                          onClick={() => handleDelete(strategy.id)}
                          title="Delete strategy"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4 mt-6">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1}-{Math.min(endIndex, strategies.length)} of {strategies.length} results
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
      {editingStrategy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Strategy</h3>
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
                  Strategy Name
                </label>
                <Input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replace Script (Optional)
                </label>
                <div {...getEditRootProps()} className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                  <input {...getEditInputProps()} key={`edit-input-${editingStrategy?.id}`} />
                  {editFile ? (
                    <div>
                      <div className="text-sm text-blue-600 font-medium">{editFile.name}</div>
                      <div className="text-xs text-gray-500 mt-1">New file selected ({(editFile.size / 1024).toFixed(1)} KB)</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-gray-500">Click to select new script</div>
                      <div className="text-xs text-gray-400 mt-1">Current: {editingStrategy.script.split('/').pop()}</div>
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

export default StrategyManager;