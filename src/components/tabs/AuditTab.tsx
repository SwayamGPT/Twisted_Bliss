import React from 'react';
import { motion } from 'framer-motion';
import { AuditLog } from '../../types';

interface AuditTabProps {
  auditLogs: AuditLog[];
}

export const AuditTab: React.FC<AuditTabProps> = ({ auditLogs }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="mb-10">
        <h2 className="text-4xl font-sans font-extrabold text-slate-800 mb-2">System Audit Logs</h2>
        <p className="text-slate-600">Review all administrative actions performed across the system.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No activity logs found yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, index) => (
                  <tr key={log._id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-slate-500 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800">{log.userName}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-600 italic">
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
