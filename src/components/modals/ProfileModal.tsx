import React from 'react';
import { motion } from 'framer-motion';
import { User, X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  setProfileName: (s: string) => void;
  profileEmail: string;
  setProfileEmail: (s: string) => void;
  profilePhotoUrl: string;
  setProfilePhotoUrl: (s: string) => void;
  profilePassword: string;
  setProfilePassword: (s: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, isNewUser?: boolean) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  isUpdatingProfile: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen, onClose, profileName, setProfileName, profileEmail, setProfileEmail,
  profilePhotoUrl, setProfilePhotoUrl, profilePassword, setProfilePassword,
  handleFileUpload, handleUpdateProfile, isUpdatingProfile
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-sky-100 overflow-hidden"
      >
        <div className="bg-sky-500 p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" /> Profile Settings
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-sky-100 overflow-hidden shadow-inner">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-sky-50 flex items-center justify-center text-sky-300 font-bold text-3xl">
                    {profileName?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={e => setProfileEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Profile Photo</label>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-all cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setProfilePhotoUrl('')}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-semibold text-slate-600 mb-1">New Password (optional)</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={profilePassword}
                onChange={e => setProfilePassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
