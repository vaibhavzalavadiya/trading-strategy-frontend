import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

// Create a simple implementation of ShadCN UI Select
const Select = forwardRef(({ children, value, onValueChange, className, ...props }, ref) => {
  // Store the children in a ref to access them later
  const childrenArray = React.Children.toArray(children);
  const flattenedChildren = [];
  
  // Flatten children to find all SelectItem components
  const flattenChildren = (children) => {
    React.Children.forEach(children, child => {
      if (child && child.type === SelectItem) {
        flattenedChildren.push(child);
      } else if (child && child.type === SelectContent) {
        flattenChildren(child.props.children);
      }
    });
  };
  
  flattenChildren(childrenArray);
  
  const handleChange = (e) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };
  
  return (
    <div className={cn("relative w-full", className)} ref={ref} {...props}>
      <select
        value={value || ''}
        onChange={handleChange}
        className="flex h-10 w-full appearance-none items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {flattenedChildren.map((child, index) => (
          <option key={index} value={child.props.value} disabled={child.props.disabled}>
            {child.props.children}
          </option>
        ))}
      </select>
    </div>
  );
});

// These components are kept for compatibility with ShadCN UI
const SelectTrigger = forwardRef(({ className, children, ...props }, ref) => {
  return null; // Not used in our implementation but kept for API compatibility
});

const SelectValue = forwardRef(({ className, ...props }, ref) => {
  return null; // Not used in our implementation but kept for API compatibility
});

const SelectContent = forwardRef(({ className, children, ...props }, ref) => {
  return <>{children}</>; // Just pass children through
});

const SelectItem = forwardRef(({ className, children, value, ...props }, ref) => {
  return null; // This is just a placeholder, actual rendering happens in Select
});

Select.displayName = "Select";
SelectTrigger.displayName = "SelectTrigger";
SelectValue.displayName = "SelectValue";
SelectContent.displayName = "SelectContent";
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }; 