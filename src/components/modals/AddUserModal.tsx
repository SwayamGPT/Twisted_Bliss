import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X, User } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  newUserName: string;
  setNewUserName: (s: string) => void;
  newUserEmail: string;
  setNewUserEmail: (s: string) => void;
  newUserPassword: string;
  setNewUserPassword: (s: string) => void;
  newUserPhotoUrl: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, isNewUser: boolean) => void;
  handleCreateUser: (e: React.FormEvent) => void;
  isCreatingUser: boolean;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen, onClose, newUserName, setNewUserName, newUserEmail, setNewUserEmail,
  newUserPassword, setNewUserPassword, newUserPhotoUrl, handleFileUpload,
  handleCreateUser, isCreatingUser
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="bg-sky-500 p-4 sm:p-6 text-white flex justify-between items-center shrink-0">
          <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" /> Add New Admin
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleCreateUser} className="p-6 sm:p-8 space-y-4 sm:space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
            <input
              type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
            <input
              type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Initial Password</label>
            <input
              type="password" required value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Profile Photo (Optional)</label>
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-sky-100 flex-shrink-0 border border-sky-200">
                {newUserPhotoUrl ? (
                  <img src={newUserPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-2 text-sky-300" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, true)}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-all cursor-pointer"
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isCreatingUser}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isCreatingUser ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
