import React, { useState } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { RoadmapMilestone } from '../../types';
import {
  Compass,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export const AdminJourneyManager: React.FC = () => {
  const { milestones, updateSiteSettings } = useImages();
  const [journeyList, setJourneyList] = useState<RoadmapMilestone[]>(milestones);
  const [editingMilestone, setEditingMilestone] = useState<RoadmapMilestone | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleOpenEdit = (m: RoadmapMilestone) => {
    sound.playClick();
    setEditingMilestone({ ...m });
  };

  const handleSaveModal = () => {
    if (!editingMilestone) return;
    sound.playSuccess();
    setJourneyList((prev) =>
      prev.map((item) => (item.id === editingMilestone.id ? editingMilestone : item))
    );
    setEditingMilestone(null);
  };

  const handleAddNew = () => {
    sound.playClick();
    const newM: RoadmapMilestone = {
      id: `milestone-${Date.now()}`,
      phase: `STEP 0${journeyList.length + 1}`,
      yearMonth: '2024 – Current',
      title: 'New Milestone Milestone',
      titleHi: 'नया मील का पत्थर',
      status: 'in-progress',
      statusText: 'In Progress',
      statusTextHi: 'प्रगति पर',
      description: 'One-line summary of this milestone step.',
      descriptionHi: 'इस चरण का एक पंक्ति का विवरण।',
      topics: ['Python', 'Foundation'],
      order: journeyList.length + 1,
    };
    setJourneyList([...journeyList, newM]);
    setEditingMilestone(newM);
  };

  const handleDelete = (id: string) => {
    sound.playClick();
    if (window.confirm('Delete this journey milestone?')) {
      setJourneyList(journeyList.filter((m) => m.id !== id));
      sound.playSuccess();
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    sound.playClick();
    const updated = [...journeyList];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setJourneyList(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === journeyList.length - 1) return;
    sound.playClick();
    const updated = [...journeyList];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setJourneyList(updated);
  };

  const handleSaveAll = async () => {
    sound.playClick();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await updateSiteSettings({
        milestones: journeyList,
      });
      sound.playSuccess();
      setSaveStatus('Journey milestones successfully saved to live website!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      sound.playAlert();
      setSaveStatus(`Failed to save: ${err.message || 'Error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h3 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>Journey Timeline Manager / यात्रा मील के पत्थर</span>
          </h3>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Add, update, reorder, or delete timeline milestones, dates, and 1-line descriptions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNew}
            className="px-3.5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-emerald-300 border border-emerald-500/40 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-gray-950 font-cyber font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Synchronizing...' : 'Save & Publish Timeline'}</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
          saveStatus.includes('Failed')
            ? 'bg-red-950/80 border border-red-500/50 text-red-300'
            : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
        }`}>
          {saveStatus.includes('Failed') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-3">
        {journeyList.map((m, idx) => (
          <div
            key={m.id || idx}
            className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 hover:border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                  {m.yearMonth || m.phase}
                </span>
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  {m.status}
                </span>
              </div>
              <h4 className="font-cyber font-bold text-white text-base">{m.title}</h4>
              <p className="text-xs text-gray-300 line-clamp-1">{m.description}</p>
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-1 rounded bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleMoveDown(idx)}
                disabled={idx === journeyList.length - 1}
                className="p-1 rounded bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleOpenEdit(m)}
                className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-cyan-400 border border-gray-800 text-xs ml-1"
                title="Edit Milestone"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              {journeyList.length > 1 && (
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 rounded-lg bg-gray-900 hover:bg-red-950 text-gray-500 hover:text-red-400 border border-gray-800 text-xs"
                  title="Delete Milestone"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="relative max-w-xl w-full bg-gray-950 border border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h4 className="font-cyber font-bold text-lg text-white">
                Edit Journey Milestone
              </h4>
              <button
                onClick={() => setEditingMilestone(null)}
                className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-400 uppercase">Year / Month (तारीख / माह)</label>
                <input
                  type="text"
                  value={editingMilestone.yearMonth || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, yearMonth: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-emerald-300 outline-none"
                  placeholder="2024 – JAN"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-400 uppercase">Status</label>
                <select
                  value={editingMilestone.status}
                  onChange={(e) => setEditingMilestone({
                    ...editingMilestone,
                    status: e.target.value as any,
                    statusText: e.target.value === 'completed' ? 'Mastered' : e.target.value === 'in-progress' ? 'In Progress' : 'Upcoming'
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-white outline-none"
                >
                  <option value="completed">Completed (पूर्ण)</option>
                  <option value="in-progress">In Progress (प्रगति पर)</option>
                  <option value="future">Upcoming (आगामी)</option>
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-mono text-gray-400 uppercase">Title (EN)</label>
                <input
                  type="text"
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs font-cyber text-white outline-none"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-mono text-gray-400 uppercase">Title in Hindi (शीर्षक हिंदी)</label>
                <input
                  type="text"
                  value={editingMilestone.titleHi || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, titleHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white outline-none font-sans"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-mono text-gray-400 uppercase">1-Line Description (EN)</label>
                <input
                  type="text"
                  value={editingMilestone.description}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-200 outline-none"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-mono text-gray-400 uppercase">1-Line Description in Hindi (हिंदी)</label>
                <input
                  type="text"
                  value={editingMilestone.descriptionHi || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, descriptionHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-200 outline-none font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                onClick={() => setEditingMilestone(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-xs font-mono text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-cyber font-bold text-xs"
              >
                Apply Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
