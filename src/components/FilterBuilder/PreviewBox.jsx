import React from "react";

const PreviewBox = ({ title, children }) => (
  <div className="border rounded p-4 bg-gray-50 mb-2">
    <div className="font-semibold mb-2">{title}</div>
    <div>{children}</div>
  </div>
);

export default PreviewBox; 