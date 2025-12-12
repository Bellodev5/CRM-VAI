import React from "react";

export const Button: React.FC<any> = ({ children, className = "", ...rest }) => (
  <button
    {...rest}
    className={`px-3 py-2 rounded-xl border hover:bg-slate-50 ${className}`}
  >
    {children}
  </button>
);