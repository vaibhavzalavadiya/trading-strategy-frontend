import React from "react";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { numericIndicators, paramIndicators, operators, joiners, paramIndicatorMeta } from "./constants";

function getParamMeta(type) {
  return paramIndicatorMeta.find(meta => meta.name === type);
}

const ConditionRow = ({ condition, onChange, onDelete, disableJoiner }) => {
  // Handlers for left side
  const handleLeftChange = (value) => {
    onChange({ ...condition, left: value, leftParams: undefined });
  };
  const handleLeftParamChange = (name, value) => {
    onChange({ ...condition, leftParams: { ...condition.leftParams, [name]: value } });
  };
  // Operator
  const handleOperatorChange = (value) => {
    onChange({ ...condition, operator: value });
  };
  // Value type
  const handleValueTypeChange = (value) => {
    onChange({ ...condition, valueType: value });
  };
  // Right side
  const handleRightNumberChange = (e) => {
    onChange({ ...condition, rightNumber: Number(e.target.value), valueType: "number" });
  };
  const handleRightFieldChange = (value) => {
    onChange({ ...condition, rightField: value, valueType: "field" });
  };
  const handleRightIndicatorTypeChange = (value) => {
    onChange({ ...condition, rightIndicator: { type: value, params: {} }, valueType: "indicator" });
  };
  const handleRightIndicatorParamChange = (name, value) => {
    onChange({
      ...condition,
      rightIndicator: {
        ...condition.rightIndicator,
        params: { ...condition.rightIndicator?.params, [name]: value },
      },
      valueType: "indicator",
    });
  };
  // Joiner
  const handleJoinerChange = (value) => {
    onChange({ ...condition, joiner: value });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4">
      {/* Header with joiner */}
      {!disableJoiner && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <select
            value={condition.joiner || "AND"}
            onChange={(e) => handleJoinerChange(e.target.value)}
            className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {joiners.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">condition</span>
        </div>
      )}
      
      {/* Main condition content */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
          {/* Left Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
            <select
              value={condition.left}
              onChange={(e) => handleLeftChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select field...</option>
              <optgroup label="Price Data">
                {numericIndicators.slice(0, 6).map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </optgroup>
              <optgroup label="Technical Indicators">
                {paramIndicators.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </optgroup>
            </select>
          </div>
          {/* Operator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <select
              value={condition.operator}
              onChange={(e) => handleOperatorChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <optgroup label="Comparison">
                <option value=">">&gt; Greater than</option>
                <option value="<">&lt; Less than</option>
                <option value=">=">&gt;= Greater or equal</option>
                <option value="<=">&lt;= Less or equal</option>
                <option value="=">= Equal to</option>
                <option value="!=">!= Not equal</option>
              </optgroup>
              <optgroup label="Crossover">
                <option value="crossed above">Crossed above</option>
                <option value="crossed below">Crossed below</option>
              </optgroup>
              <optgroup label="Change">
                <option value="increased by">Increased by</option>
                <option value="decreased by">Decreased by</option>
              </optgroup>
            </select>
          </div>
          {/* Value Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compare to</label>
            <select
              value={condition.valueType}
              onChange={(e) => handleValueTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="number">📊 Number</option>
              <option value="field">📈 Another Field</option>
              <option value="indicator">🔧 Indicator</option>
            </select>
          </div>
          {/* Value Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
            {condition.valueType === "number" && (
              <input
                type="number"
                value={condition.rightNumber ?? ""}
                onChange={handleRightNumberChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter value..."
              />
            )}
            {condition.valueType === "field" && (
              <select
                value={condition.rightField ?? ""}
                onChange={(e) => handleRightFieldChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select field...</option>
                {numericIndicators.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            )}
            {condition.valueType === "indicator" && (
              <div className="space-y-2">
                <select
                  value={condition.rightIndicator?.type ?? "EMA"}
                  onChange={(e) => handleRightIndicatorTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {paramIndicators.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  {getParamMeta(condition.rightIndicator?.type)?.params.map(param => (
                    <input
                      key={param.name}
                      type="number"
                      value={condition.rightIndicator?.params?.[param.name] || ""}
                      onChange={(e) => handleRightIndicatorParamChange(param.name, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={param.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Remove condition"
            >
              <i className="fas fa-trash text-sm"></i>
            </button>
          </div>
        </div>
        
        {/* Parameters section for left field if needed */}
        {paramIndicators.includes(condition.left) && getParamMeta(condition.left)?.params.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                ⚙️ {condition.left} Parameters
              </span>
            </div>
            <div className="flex gap-3">
              {getParamMeta(condition.left)?.params.map(param => (
                <div key={param.name} className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">{param.name}</label>
                  {param.type === "select" ? (
                    <select
                      value={condition.leftParams?.[param.name] || ""}
                      onChange={(e) => handleLeftParamChange(param.name, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">{param.name}</option>
                      {param.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={condition.leftParams?.[param.name] || ""}
                      onChange={(e) => handleLeftParamChange(param.name, e.target.value)}
                      placeholder={param.name}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionRow; 