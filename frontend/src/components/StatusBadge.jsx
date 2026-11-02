import React from 'react';

const StatusBadge = ({ status }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'Pending':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-300';
      break;
    case 'Verified':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-300';
      break;
    case 'In-Progress':
    case 'Assigned':
    case 'Dispatched':
    case 'In-Transit':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-300';
      break;
    case 'Completed':
    case 'Fulfilled':
    case 'Delivered':
    case 'Active':
    case 'In-Stock':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      break;
    case 'Low-Stock':
    case 'Near Full':
      colorClasses = 'bg-orange-50 text-orange-700 border-orange-300';
      break;
    case 'Out-of-Stock':
    case 'Full':
    case 'Rejected':
    case 'Cancelled':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-300';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
