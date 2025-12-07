import React from "react";
import ConditionRow from "./ConditionRow";

const FilterBuilder = ({ conditions, onChange, onAdd, onDelete, onApply, disableJoiner }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-filter text-blue-600 text-sm"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Strategy Conditions</h3>
              <p className="text-sm text-gray-600">Define your trading entry and exit rules</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm">
              {conditions.length} {conditions.length === 1 ? 'Rule' : 'Rules'}
            </span>
            {conditions.length > 0 && (
              <button
                onClick={onAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <i className="fas fa-plus mr-2"></i>Add Rule
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="lg:p-6 p-4">
        {conditions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-chart-line text-gray-400 text-xl"></i>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No trading rules defined</h4>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first trading condition to start building your strategy
            </p>
            <button
              onClick={onAdd}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <i className="fas fa-plus mr-2"></i>Create First Rule
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conditions.map((condition, idx) => (
              <div key={idx} className="relative">
                {idx > 0 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-full text-xs font-medium">
                      {conditions[idx-1]?.joiner || 'AND'}
                    </span>
                  </div>
                )}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <ConditionRow
                    condition={condition}
                    onChange={updated => onChange(idx, updated)}
                    onDelete={() => onDelete(idx)}
                    disableJoiner={disableJoiner && idx === 0}
                  />
                </div>
              </div>
            ))}
            
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={onAdd}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors shadow-sm"
              >
                <i className="fas fa-plus mr-2"></i>Add Another Rule
              </button>
              <button
                onClick={onApply}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <i className="fas fa-check mr-2"></i>Apply Filter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBuilder; 