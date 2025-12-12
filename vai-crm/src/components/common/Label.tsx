import React from "react";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className = "" }) => (
  <label className={`block text-sm text-slate-600 mb-1 ${className}`}>
    {children}
  </label>
);