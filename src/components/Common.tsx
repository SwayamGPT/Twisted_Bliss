import React from 'react';

export const YarnBall = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20" />
    <path d="M2 12a14.5 14.5 0 0 0 20 0" />
    <path d="M6 6a14.5 14.5 0 0 0 12 12" />
    <path d="M6 18a14.5 14.5 0 0 0 12-12" />
  </svg>
);

export const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
  <div className="bg-sky-100 p-6 rounded-3xl shadow-lg border border-sky-200 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${bgColor}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);
