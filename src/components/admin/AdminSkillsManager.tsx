import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { SkillItem } from '../../types';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Gauge,
  ArrowUp,
  ArrowDown,
  Terminal,
  Code,
  Layers,
  Cpu,
  BrainCircuit,
  Cloud,
  Database,
  GitBranch
} from 'lucide-react';

export const AdminSkillsManager: React.FC = () => {
  const { mode } = useLanguage();
  const { skills, siteSettings, updateSiteSettings } = useImages();
  const [skillsList, setSkillsList] = useState<SkillItem[]>(skills || []);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNameHi, setFormNameHi] = useState('');
  const [formCategory, setFormCategory] = useState<'current' | 'tools' | 'learning'>('current');
  const [formIcon, setFormIcon] = useState('Terminal');
  const [formProficiency, setFormProficiency] = useState(90);
  const [formDesc, setFormDesc] = useState('');
  const [formDescHi, setFormDescHi] = useState('');
  const [formHighlights, setFormHighlights] = useState('');

  // Delete Confirmation State
  const [skillToDelete, setSkillToDelete] = useState<{ idx: number; name: string } | null>(null);

  const handleOpenAdd = () => {
    sound.playClick();
    setEditingIdx(null);
    setFormName('');
    setFormNameHi('');
    setFormCategory('current');
    setFormIcon('Terminal');
    setFormProficiency(85);
    setFormDesc('');
    setFormDescHi('');
    setFormHighlights('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (idx: number, skill: SkillItem) => {
    sound.playClick();
    setEditingIdx(idx);
    setFormName(skill.name);
    setFormNameHi(skill.nameHi || '');
    setFormCategory(skill.category);
    setFormIcon(skill.icon || 'Terminal');
    setFormProficiency(skill.proficiency ?? 85);
    setFormDesc(skill.description);
    setFormDescHi(skill.descriptionHi || '');
    setFormHighlights((skill.highlights || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setStatusMessage({ type: 'error', text: 'Skill name is required.' });
      return;
    }

    sound.playClick();
    setIsSaving(true);
    setStatusMessage(null);

    const highlightsArr = formHighlights
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedSkill: SkillItem = {
      name: formName.trim(),
      nameHi: formNameHi.trim() || formName.trim(),
      category: formCategory,
      icon: formIcon,
      proficiency: Number(formProficiency),
      description: formDesc.trim(),
      descriptionHi: formDescHi.trim() || formDesc.trim(),
      highlights: highlightsArr,
    };

    let nextList: SkillItem[] = [];
    if (editingIdx !== null) {
      nextList = skillsList.map((item, i) => (i === editingIdx ? updatedSkill : item));
    } else {
      nextList = [...skillsList, updatedSkill];
    }

    try {
      await updateSiteSettings({ skills: nextList }, true);
      setSkillsList(nextList);
      sound.playSuccess();
      setStatusMessage({
        type: 'success',
        text: `Skill "${formName}" and 3D meter saved to Firebase Firestore!`,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving skills:', err);
      setStatusMessage({ type: 'error', text: 'Failed to save skills: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async () => {
    if (skillToDelete === null) return;
    sound.playClick();
    setIsSaving(true);
    const nextList = skillsList.filter((_, i) => i !== skillToDelete.idx);
    try {
      await updateSiteSettings({ skills: nextList }, true);
      setSkillsList(nextList);
      sound.playSuccess();
      setStatusMessage({ type: 'success', text: `Skill "${skillToDelete.name}" deleted.` });
      setSkillToDelete(null);
    } catch (err: any) {
      console.error('Error deleting skill:', err);
      setStatusMessage({ type: 'error', text: 'Delete failed: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShiftOrder = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= skillsList.length) return;
    sound.playClick();
    const copy = [...skillsList];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setSkillsList(copy);
    try {
      await updateSiteSettings({ skills: copy }, true);
      sound.playSuccess();
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-amber-400" />
            <span>3D Skills &amp; Proficiency Meters Manager</span>
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Add, update, or reorder technical skills, descriptions, and 3D glowing circular gauge percentages (0-100%).
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Skill</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-mono border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Skills Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="p-3.5">Order</th>
              <th className="p-3.5">Skill Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">3D Ring Meter</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {skillsList.map((skill, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition">
                <td className="p-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShiftOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3 text-slate-300" />
                    </button>
                    <span className="w-5 text-center font-bold text-slate-400">#{idx + 1}</span>
                    <button
                      onClick={() => handleShiftOrder(idx, 'down')}
                      disabled={idx === skillsList.length - 1}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3 text-slate-300" />
                    </button>
                  </div>
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{skill.name}</div>
                      {skill.nameHi && <div className="text-[10px] text-slate-400">{skill.nameHi}</div>}
                    </div>
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300 text-[10px]">
                    {skill.category}
                  </span>
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                        style={{ width: `${skill.proficiency || 85}%` }}
                      />
                    </div>
                    <span className="font-bold text-amber-300 text-xs">{skill.proficiency || 85}%</span>
                  </div>
                </td>
                <td className="p-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(idx, skill)}
                      className="p-1.5 rounded-lg bg-slate-900 text-amber-300 hover:bg-slate-800 border border-slate-800 cursor-pointer"
                      title="Edit Skill & Percentage"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSkillToDelete({ idx, name: skill.name })}
                      className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:bg-slate-800 border border-slate-800 cursor-pointer"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 bg-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-amber-400" />
                <span>{editingIdx !== null ? 'Edit Skill & 3D Meter' : 'Add New Skill'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">Skill Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Python, Docker, AI"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">Skill Name (Hindi)</label>
                  <input
                    type="text"
                    value={formNameHi}
                    onChange={(e) => setFormNameHi(e.target.value)}
                    placeholder="कौशल का नाम हिंदी में"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 3D Meter Percentage Slider */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>3D Glowing Meter Proficiency (%)</span>
                  </label>
                  <span className="font-cyber font-black text-amber-400 text-lg">{formProficiency}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formProficiency}
                  onChange={(e) => setFormProficiency(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="current">Core Development (मुख्य विकास)</option>
                    <option value="tools">Dev Tools &amp; Deploy (टूल्स)</option>
                    <option value="learning">Advanced Study (उन्नत अध्ययन)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">Icon Type</label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Terminal">Terminal</option>
                    <option value="BrainCircuit">BrainCircuit</option>
                    <option value="Cpu">Cpu</option>
                    <option value="Layers">Layers</option>
                    <option value="Sparkles">Sparkles</option>
                    <option value="Code2">Code2</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Database">Database</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Summary of practical proficiency..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">Description (Hindi)</label>
                <textarea
                  rows={2}
                  value={formDescHi}
                  onChange={(e) => setFormDescHi(e.target.value)}
                  placeholder="कौशल का विवरण हिंदी में..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  Highlights / Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  placeholder="e.g. OOP, Fast Scripting, Clean Architecture"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Skill & Meter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {skillToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="max-w-md w-full bg-slate-950 border border-rose-500/40 rounded-3xl p-6 space-y-4">
            <h4 className="font-cyber font-bold text-white text-lg">Confirm Delete Skill</h4>
            <p className="text-xs font-mono text-slate-300">
              Are you sure you want to delete <span className="text-amber-300 font-bold">"{skillToDelete.name}"</span>?
              This will remove its 3D meter from the live site.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSkillToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSkill}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
