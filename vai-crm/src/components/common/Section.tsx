import React from "react";

type SectionProps = {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

export const Section: React.FC<SectionProps> = ({ title, right, children }) => (
  <div className="bg-white rounded-2xl shadow border p-4">
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-semibold text-slate-800">{title}</h2>
      {right}
    </div>
    {children}
  </div>
);