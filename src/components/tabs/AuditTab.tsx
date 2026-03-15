import React from 'react';
import { motion } from 'framer-motion';
import { AuditLog } from '../../types';

interface AuditTabProps {
  auditLogs: AuditLog[];
}

export const AuditTab: React.FC<AuditTabProps> = ({ auditLogs }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-10">
        <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-slate-800 mb-2">Audit Logs</h2>
        <p className="text-sm sm:text-base text-slate-600">Review all administrative actions performed.</p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Timestamp</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">User</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Action</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No logs found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, index) => (
                  <tr key={log._id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-slate-500 text-[10px] sm:text-xs">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="font-bold text-slate-800 truncate max-w-[80px] sm:max-w-none">{log.userName}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-slate-600 italic text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
