import React, { useState } from 'react';
import { sound } from '../audio/SoundEffects';
import {
  auth,
  updatePassword,
  sendPasswordResetEmail
} from '../../firebase';
import {
  Shield,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Fingerprint,
  Mail,
  UserCheck
} from 'lucide-react';

export const AdminSecurityManager: React.FC = () => {
  const currentUser = auth.currentUser;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setStatusMessage({ type: 'error', text: 'No active administrator session found.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsUpdating(true);
    setStatusMessage(null);
    try {
      await updatePassword(currentUser, newPassword);
      sound.playSuccess();
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage({
        type: 'success',
        text: 'Administrator password has been successfully updated and secured!'
      });
    } catch (err: any) {
      sound.playAlert();
      if (err.code === 'auth/requires-recent-login') {
        setStatusMessage({
          type: 'error',
          text: 'This operation is sensitive and requires recent authentication. Please log out and log back in, then retry.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `Password update failed: ${err.message || 'Error occurred.'}`
        });
      }
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleSendResetEmail = async () => {
    if (!currentUser?.email) return;
    setIsSendingReset(true);
    setStatusMessage(null);
    sound.playClick();
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      sound.playSuccess();
      setStatusMessage({
        type: 'success',
        text: `Password reset link dispatched to ${currentUser.email}. Check your inbox/spam.`
      });
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({
        type: 'error',
        text: `Failed to send reset email: ${err.message || 'Error occurred.'}`
      });
    } finally {
      setIsSendingReset(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl">
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20">
        <h2 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Administrator Security & Credentials
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Manage your Firebase Authentication account credentials, update your password, or request an official reset link.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 font-mono text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-cyber font-bold text-sm text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Authenticated Administrator
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[10px]">
            FIREBASE AUTH SESSION ACTIVE
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-500">Registered Admin Email:</div>
            <div className="text-sm font-mono text-amber-300 font-semibold">{currentUser?.email || 'N/A'}</div>
          </div>
          <button
            type="button"
            onClick={handleSendResetEmail}
            disabled={isSendingReset || !currentUser?.email}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 cursor-pointer disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSendingReset ? 'Sending Link...' : 'Send Reset Link'}</span>
          </button>
        </div>

        <ul className="space-y-2 text-xs font-mono text-slate-400">
          <li className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            Strict server-side validation via Firebase Authentication tokens
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            Firestore Security Rules enforce zero write permissions without authenticated admin claims
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            Zero client-side hardcoded PINs or credentials stored in JavaScript bundles
          </li>
        </ul>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handleUpdatePassword} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="font-cyber font-bold text-base text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Update Administrator Password
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-300 mb-1">
              New Password (minimum 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password..."
                className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          <span>{isUpdating ? 'Updating in Firebase...' : 'Update Password'}</span>
        </button>
      </form>
    </div>
  );
};
