import React, { useState } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import {
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  FileCode,
  ShieldAlert
} from 'lucide-react';

export const AdminBackupManager: React.FC = () => {
  const { siteSettings, updateSiteSettings, projects, skills, milestones } = useImages();
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportBackup = () => {
    sound.playClick();
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        siteSettings,
        projects,
        skills,
        milestones,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `cybermohit_backup_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      sound.playSuccess();
      setStatusMessage({ type: 'success', text: 'Backup JSON generated and downloaded!' });
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Export failed: ${err.message}` });
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setStatusMessage(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.siteSettings) {
        throw new Error('Invalid backup file format: missing siteSettings.');
      }

      await updateSiteSettings(parsed.siteSettings);
      sound.playSuccess();
      setStatusMessage({ type: 'success', text: 'Backup restored and settings applied successfully!' });
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Import failed: ${err.message}` });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-2xl">
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20">
        <h2 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          Data Backup, Export & Disaster Recovery
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Export your complete portfolio configuration as a portable JSON file, or restore from a previous snapshot.
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

      {/* Export Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="font-cyber font-bold text-base text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400" />
          Export Complete JSON Snapshot
        </h3>
        <p className="text-xs font-mono text-slate-400 leading-relaxed">
          Downloads all current themes, academic bio, skills matrix, projects catalog, roadmap milestones, and contact channels in one clean JSON structure.
        </p>
        <button
          onClick={handleExportBackup}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-xs uppercase cursor-pointer transition shadow-lg shadow-cyan-500/20"
        >
          <Download className="w-4 h-4" /> Download Backup JSON
        </button>
      </div>

      {/* Import Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="font-cyber font-bold text-base text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-400" />
          Restore From Backup File
        </h3>
        <p className="text-xs font-mono text-slate-400 leading-relaxed">
          Upload a previously exported `.json` file to restore settings immediately.
        </p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-bold text-xs uppercase cursor-pointer transition shadow-lg shadow-amber-500/20">
          <Upload className="w-4 h-4" />
          <span>{importing ? 'Restoring...' : 'Upload & Restore File'}</span>
          <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" disabled={importing} />
        </label>
      </div>
    </div>
  );
};
