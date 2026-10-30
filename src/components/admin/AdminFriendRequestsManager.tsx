import React, { useState, useMemo } from 'react';
import { Friend, FriendRequest, resolveImageUrl, DEFAULT_CATEGORIES } from '../../friends/data/friends';
import { friendsRepository, useFriendRequests, useFriendsConfig, useFriends } from '../../friends/data/repository';
import { sound } from '../audio/SoundEffects';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Gamepad2,
  MapPin,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  User,
  Phone,
  Link as LinkIcon,
} from 'lucide-react';
import { copyFriendShareUrl } from '../../friends/utils/shareUrl';

export const AdminFriendRequestsManager: React.FC = () => {
  const { requests, isLoading, refetch } = useFriendRequests();
  const { settings } = useFriendsConfig();
  const { friends, refetch: refetchFriends } = useFriends('all', { includeUnlisted: true });

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Approval config per request
  const [approvalCategoryType, setApprovalCategoryType] = useState<Record<string, 'normal' | 'hidden'>>({});
  const [approvalAssignedCats, setApprovalAssignedCats] = useState<Record<string, string[]>>({});
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});
  const [activeRejectingId, setActiveRejectingId] = useState<string | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const categoryOptions = useMemo(() => {
    return (settings.categories || DEFAULT_CATEGORIES).filter((c) => c.key !== 'all');
  }, [settings.categories]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      all: requests.length,
    };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    let list = [...requests];
    if (activeTab !== 'all') {
      list = list.filter((r) => r.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.applicantName.toLowerCase().includes(q) ||
          (r.applicantContact && r.applicantContact.includes(q))
      );
    }
    return list;
  }, [requests, activeTab, searchQuery]);

  const handleApprove = async (req: FriendRequest) => {
    setProcessingId(req.id);
    sound.playClick();

    try {
      const catType = approvalCategoryType[req.id] || 'normal';
      const assignedCats = approvalAssignedCats[req.id] || ['prefer'];

      await friendsRepository.approveRequest(req.id, catType, assignedCats);
      sound.playSuccess();
      showStatus(
        `अनुरोध ${req.id} सफलतापूर्वक स्वीकृत (Approved) किया गया! ${
          catType === 'hidden' ? '(Hidden / Unlisted Friend)' : '(Normal Friend)'
        }`
      );
      await refetch();
      await refetchFriends();
    } catch (err: any) {
      sound.playAlert();
      showStatus(`स्वीकृति में त्रुटि: ${err.message || err}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req: FriendRequest) => {
    setProcessingId(req.id);
    sound.playClick();

    try {
      const note = rejectionNotes[req.id] || 'Admin द्वारा अस्वीकृत';
      await friendsRepository.rejectRequest(req.id, note);
      sound.playAlert();
      showStatus(`अनुरोध ${req.id} अस्वीकृत (Rejected) कर दिया गया।`);
      setActiveRejectingId(null);
      await refetch();
    } catch (err: any) {
      showStatus(`अस्वीकार करने में त्रुटि: ${err.message || err}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (req: FriendRequest) => {
    if (!window.confirm(`क्या आप वाकई इस अनुरोध (${req.id}) को डिलीट करना चाहते हैं?`)) return;
    setProcessingId(req.id);
    sound.playClick();

    try {
      await friendsRepository.deleteRequest(req.id);
      showStatus(`अनुरोध ${req.id} डिलीट कर दिया गया।`);
      await refetch();
    } catch (err: any) {
      showStatus(`डिलीट करने में समस्या: ${err.message || err}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-slate-100 font-sans">
      {/* Status Toast */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-mono transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>पेंडिंग अनुरोध (Pending)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>स्वीकृत (Approved)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
              {counts.approved}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rejected'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>अस्वीकृत (Rejected)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-mono font-bold">
              {counts.rejected}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            सभी ({counts.all})
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाम या ID से खोजें..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Requests Listing */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-cyan-400" />
          <span>अनुरोध लोड हो रहे हैं...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-slate-400">
          <Users className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
          <p className="text-sm font-medium">कोई अनुरोध नहीं मिला।</p>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'pending'
              ? 'वर्तमान में कोई नया प्रोफाइल या अपडेट अनुरोध पेंडिंग नहीं है।'
              : 'इस फ़िल्टर में कोई रिकॉर्ड उपलब्ध नहीं है।'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';
            const isUpdate = req.type === 'profile_update';
            const isProcessing = processingId === req.id;

            // Target existing friend if this is an update request
            const targetFriend = isUpdate
              ? req.originalData || friends.find((f) => f.id === req.profileId)
              : null;

            const p = req.profileData || {};
            const proposedAvatarUrl = resolveImageUrl(p.avatar);
            const currentAvatarUrl = targetFriend ? resolveImageUrl(targetFriend.avatar) : '';
            const isPhotoChanged = isUpdate && proposedAvatarUrl && proposedAvatarUrl !== currentAvatarUrl;

            // WhatsApp link to applicant
            const cleanDigits = (req.applicantContact || p.whatsapp || '').replace(/\D/g, '');
            const applicantWaNum = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
            const applicantWaUrl = applicantWaNum
              ? `https://wa.me/${applicantWaNum}?text=${encodeURIComponent(
                  `नमस्ते ${req.applicantName}! आपके Friends Universe अनुरोध (${req.id}) के संदर्भ में:`
                )}`
              : null;

            // Selection state for this request
            const currentCatType = approvalCategoryType[req.id] || 'normal';
            const currentAssigned = approvalAssignedCats[req.id] || ['prefer'];

            return (
              <div
                key={req.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-[#0a0f1d] border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                    : isApproved
                    ? 'bg-[#091512] border-emerald-500/30'
                    : 'bg-[#150a0f] border-rose-500/30 opacity-80'
                }`}
              >
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Type Badge */}
                    <span
                      className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                        isUpdate
                          ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                          : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                      }`}
                    >
                      {isUpdate ? '🔄 Profile Update Request' : '🔥 New Profile Request'}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                        isPending
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 animate-pulse'
                          : isApproved
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                      }`}
                    >
                      {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />}
                      <span>{req.status}</span>
                    </span>

                    <span className="font-mono text-xs text-slate-400 font-bold">
                      ID: {req.id}
                    </span>
                  </div>

                  {/* Submission date & WhatsApp button */}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="text-[11px] font-mono">
                      {req.submittedAt
                        ? typeof req.submittedAt === 'string'
                          ? new Date(req.submittedAt).toLocaleString('hi-IN')
                          : 'Recently'
                        : ''}
                    </span>

                    {applicantWaUrl && (
                      <a
                        href={applicantWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-all"
                        title="आवेदक को WhatsApp पर मैसेज करें"
                      >
                        <MessageCircle className="w-3 h-3 fill-current" />
                        <span>Chat</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="py-4 space-y-4">
                  {/* UPDATE REQUEST: SIDE-BY-SIDE DIFF VIEW */}
                  {isUpdate ? (
                    <div className="space-y-4">
                      {/* Photo Diff (If Changed) */}
                      {isPhotoChanged && (
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-around gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] font-mono text-slate-400 uppercase">
                              वर्तमान फोटो (Current Photo)
                            </span>
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-950">
                              <img
                                src={currentAvatarUrl}
                                alt="Current avatar"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <ArrowRight className="w-5 h-5 text-amber-400 hidden sm:block" />

                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] font-mono text-amber-300 uppercase font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>प्रस्तावित नई फोटो (Proposed Photo)</span>
                            </span>
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] bg-slate-950">
                              <img
                                src={proposedAvatarUrl}
                                alt="Proposed avatar"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Field Diff Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                        <table className="w-full text-left text-xs font-sans">
                          <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                            <tr>
                              <th className="py-2 px-3">फ़ील्ड (Field)</th>
                              <th className="py-2 px-3">वर्तमान जानकारी (Current)</th>
                              <th className="py-2 px-3 text-amber-300">प्रस्तावित जानकारी (Proposed)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {[
                              { label: 'नाम (Name)', oldVal: targetFriend?.name, newVal: p.name },
                              { label: 'निकनेम (Nickname)', oldVal: targetFriend?.nickname, newVal: p.nickname },
                              { label: 'यूज़रनेम (Username)', oldVal: targetFriend?.username || targetFriend?.user, newVal: p.username },
                              { label: 'टैगलाइन / Role', oldVal: targetFriend?.tagline || targetFriend?.role, newVal: p.tagline },
                              { label: 'बायो (Bio)', oldVal: targetFriend?.bio, newVal: p.bio },
                              { label: 'WhatsApp / Phone', oldVal: targetFriend?.whatsapp || targetFriend?.phone, newVal: p.whatsapp },
                              { label: 'शहर (City)', oldVal: targetFriend?.city, newVal: p.city },
                              { label: 'राज्य (State)', oldVal: targetFriend?.state, newVal: p.state },
                              { label: 'Free Fire Name', oldVal: targetFriend?.ffName, newVal: p.ffName },
                              { label: 'Free Fire UID', oldVal: targetFriend?.ffUid, newVal: p.ffUid },
                              { label: 'Instagram', oldVal: targetFriend?.instagram, newVal: p.instagram },
                              { label: 'शौक (Hobbies)', oldVal: targetFriend?.hobbies || targetFriend?.hobby, newVal: p.hobbies },
                              { label: 'सपना (Dream)', oldVal: targetFriend?.dream || targetFriend?.goal, newVal: p.dream },
                            ].map((row, idx) => {
                              const isDiff =
                                (row.newVal || '') !== (row.oldVal || '') &&
                                (row.newVal !== undefined && row.newVal !== null && row.newVal !== '');

                              return (
                                <tr
                                  key={idx}
                                  className={isDiff ? 'bg-amber-950/20 font-medium' : 'text-slate-400'}
                                >
                                  <td className="py-2 px-3 font-mono text-slate-300 text-[11px]">
                                    {row.label}
                                    {isDiff && (
                                      <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                        CHANGED
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-slate-400">
                                    {row.oldVal || <span className="text-slate-600 italic">—</span>}
                                  </td>
                                  <td className={`py-2 px-3 ${isDiff ? 'text-amber-200 font-bold' : 'text-slate-400'}`}>
                                    {row.newVal || <span className="text-slate-600 italic">—</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* NEW PROFILE REQUEST: FULL APPLICATION VIEW */
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                      {/* Photo preview */}
                      <div className="sm:col-span-3 flex flex-col items-center text-center">
                        <div
                          className="w-24 h-24 rounded-full p-[2px] mb-2"
                          style={{
                            background: `linear-gradient(135deg, ${p.accent || '#00F2FE'}, #9B5CFF)`,
                            boxShadow: `0 0 15px ${p.accent || '#00F2FE'}40`,
                          }}
                        >
                          <img
                            src={proposedAvatarUrl || '/images/default-avatar.png'}
                            alt={p.name || 'Friend'}
                            className="w-full h-full rounded-full object-cover bg-slate-950"
                          />
                        </div>
                        <span className="font-bold text-sm text-white">{p.name}</span>
                        {p.nickname && <span className="text-xs text-slate-400">({p.nickname})</span>}
                        {p.username && <span className="text-xs text-cyan-400 font-mono">@{p.username}</span>}
                      </div>

                      {/* Fields overview */}
                      <div className="sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">टैगलाइन / Role:</span>
                          <span className="text-slate-200 font-semibold">{p.tagline || '—'}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">संपर्क (Phone):</span>
                          <span className="text-emerald-400 font-mono font-semibold">{p.whatsapp || req.applicantContact || '—'}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">स्थान (Location):</span>
                          <span className="text-slate-200 font-semibold">
                            {p.city ? `${p.city}${p.state ? ', ' + p.state : ''}` : '—'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">Free Fire IGN & UID:</span>
                          <span className="text-amber-300 font-mono font-semibold">
                            {p.ffName || p.ffUid ? `${p.ffName || 'Player'} (${p.ffUid || '—'})` : '—'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 sm:col-span-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">बायो (Bio):</span>
                          <p className="text-slate-300 mt-0.5 leading-relaxed">{p.bio || '—'}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">शौक (Hobbies):</span>
                          <span className="text-slate-200">{p.hobbies || '—'}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">सपना (Dream):</span>
                          <span className="text-purple-300">{p.dream || '—'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADMIN APPROVAL CONFIGURATION CONTROLS (Only visible when pending) */}
                  {isPending && (
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col gap-3">
                      <span className="text-[11px] font-mono font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>स्वीकृति विकल्प (Approval Configuration):</span>
                      </span>

                      {/* 1. Normal vs Hidden Friend selection */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="text-xs text-slate-300 font-semibold">दृश्यता (Visibility):</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                            <input
                              type="radio"
                              name={`vis_${req.id}`}
                              checked={currentCatType === 'normal'}
                              onChange={() =>
                                setApprovalCategoryType({ ...approvalCategoryType, [req.id]: 'normal' })
                              }
                              className="text-cyan-500 focus:ring-0"
                            />
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="font-semibold text-cyan-200">Normal Friend</span>
                            <span className="text-[10px] text-slate-400">(पब्लिक लिस्ट व सर्च में दिखेगा)</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                            <input
                              type="radio"
                              name={`vis_${req.id}`}
                              checked={currentCatType === 'hidden'}
                              onChange={() =>
                                setApprovalCategoryType({ ...approvalCategoryType, [req.id]: 'hidden' })
                              }
                              className="text-purple-500 focus:ring-0"
                            />
                            <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-semibold text-purple-300">Hidden / Unlisted Friend</span>
                            <span className="text-[10px] text-slate-400">(केवल डायरेक्ट लिंक से खुलेगा)</span>
                          </label>
                        </div>
                      </div>

                      {/* 2. Assign Categories */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs text-slate-300 font-semibold">श्रेणियाँ (Categories):</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {categoryOptions.map((c) => {
                            const isSelected = currentAssigned.includes(c.key);
                            return (
                              <button
                                key={c.key}
                                type="button"
                                onClick={() => {
                                  const updated = isSelected
                                    ? currentAssigned.filter((k) => k !== c.key)
                                    : [...currentAssigned, c.key];
                                  setApprovalAssignedCats({
                                    ...approvalAssignedCats,
                                    [req.id]: updated.length > 0 ? updated : ['prefer'],
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.2)]'
                                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                                }`}
                              >
                                {c.emoji} {c.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rejection Note prompt */}
                  {activeRejectingId === req.id && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex flex-col gap-2">
                      <label className="text-xs text-rose-300 font-mono font-bold">
                        अस्वीकार करने का कारण (Rejection Note):
                      </label>
                      <input
                        type="text"
                        value={rejectionNotes[req.id] || ''}
                        onChange={(e) =>
                          setRejectionNotes({ ...rejectionNotes, [req.id]: e.target.value })
                        }
                        placeholder="उदा. फोटो साफ़ नहीं है, या विवरण अपूर्ण है..."
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setActiveRejectingId(null)}
                          className="px-3 py-1 rounded bg-slate-800 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleReject(req)}
                          className="px-4 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                        >
                          अस्वीकार पक्का करें (Confirm Reject)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500">
                    {req.adminCategory && (
                      <span className="text-purple-300 font-semibold mr-2">
                        [{req.adminCategory === 'hidden' ? 'Hidden Friend' : 'Normal Friend'}]
                      </span>
                    )}
                    {req.adminNotes && <span>नोट: {req.adminNotes}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setActiveRejectingId(req.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5 text-rose-400" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleApprove(req)}
                          className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                          <span>
                            {isUpdate ? 'स्वीकार करें (Approve Update)' : 'स्वीकार करें (Approve Profile)'}
                          </span>
                        </button>
                      </>
                    )}

                    {!isPending && (
                      <>
                        {req.status === 'approved' && req.profileId && (
                          <button
                            type="button"
                            onClick={async () => {
                              sound.playClick();
                              const res = await copyFriendShareUrl(req.profileId!, settings.publicSiteUrl);
                              if (res.success) {
                                sound.playSuccess();
                                showStatus(`प्रोफाइल लिंक कॉपी किया गया: ${res.url}`);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800 text-xs font-mono transition-colors cursor-pointer"
                            title="पब्लिक शेयर लिंक कॉपी करें"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>लिंक कॉपी करें</span>
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleDelete(req)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                          title="रिकॉर्ड हटाएं (Delete Request)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
