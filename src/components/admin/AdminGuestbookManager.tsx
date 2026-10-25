import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import { VisitorMessage, GuestbookEntry } from '../../types';
import {
  db,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from '../../firebase';
import {
  MessageSquare,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Clock,
  Search,
  Filter,
  AlertCircle,
  ShieldCheck,
  Send
} from 'lucide-react';

export const AdminGuestbookManager: React.FC = () => {
  const { mode } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'contact_messages' | 'guestbook'>('contact_messages');

  // Contact Inquiries state (collection 'messages' + legacy fallback 'visitor_messages')
  const [messages, setMessages] = useState<VisitorMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchMsgQuery, setSearchMsgQuery] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [msgToDelete, setMsgToDelete] = useState<VisitorMessage | null>(null);

  // Guestbook Wall entries state (collection 'guestbook')
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [loadingGuestbook, setLoadingGuestbook] = useState(false);
  const [searchGuestbookQuery, setSearchGuestbookQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [entryToDelete, setEntryToDelete] = useState<GuestbookEntry | null>(null);

  useEffect(() => {
    loadContactMessages();
    loadGuestbookEntries();
  }, []);

  // 1. Load Contact Messages from 'messages' collection (with fallback to preserve legacy 'visitor_messages')
  const loadContactMessages = async () => {
    setLoadingMessages(true);
    try {
      const loaded: VisitorMessage[] = [];
      const seenIds = new Set<string>();

      // Primary collection: messages
      try {
        const qMessages = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(qMessages);
        snap.forEach((d) => {
          seenIds.add(d.id);
          const data = d.data();
          loaded.push({
            id: d.id,
            name: data.name || 'Anonymous',
            email: data.email || '',
            message: data.message || '',
            read: data.read ?? false,
            archived: data.archived ?? false,
            source: data.source || 'portfolio_contact_form',
            createdAt: data.createdAt,
          });
        });
      } catch (err) {
        console.warn('Load messages notice:', err);
      }

      // Legacy fallback: visitor_messages (to preserve any existing older messages)
      try {
        const qLegacy = query(collection(db, 'visitor_messages'), orderBy('createdAt', 'desc'));
        const legacySnap = await getDocs(qLegacy);
        legacySnap.forEach((d) => {
          if (!seenIds.has(d.id)) {
            const data = d.data();
            loaded.push({
              id: d.id,
              name: data.name || 'Anonymous',
              email: data.email || '',
              message: data.message || '',
              read: data.read ?? false,
              archived: data.archived ?? false,
              source: 'visitor_messages_legacy',
              createdAt: data.createdAt,
            });
          }
        });
      } catch (err) {
        // Legacy collection may not exist or be empty
      }

      setMessages(loaded);
    } catch (err) {
      console.warn('Error loading contact messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 2. Load Guestbook Submissions from 'guestbook' collection
  const loadGuestbookEntries = async () => {
    setLoadingGuestbook(true);
    try {
      const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const loaded: GuestbookEntry[] = [];
      snap.forEach((d) => {
        const data = d.data();
        loaded.push({
          id: d.id,
          name: data.name || 'Anonymous',
          message: data.message || '',
          status: (data.status as 'pending' | 'approved' | 'rejected') || 'pending',
          deviceToken: data.deviceToken || '',
          createdAt: data.createdAt,
          reviewedAt: data.reviewedAt,
        });
      });
      setGuestbookEntries(loaded);
    } catch (err) {
      console.warn('Error loading guestbook entries:', err);
    } finally {
      setLoadingGuestbook(false);
    }
  };

  // Message Actions
  const handleToggleRead = async (msg: VisitorMessage) => {
    sound.playClick();
    try {
      const targetCol = msg.source === 'visitor_messages_legacy' ? 'visitor_messages' : 'messages';
      const nextRead = !msg.read;
      await updateDoc(doc(db, targetCol, msg.id), {
        read: nextRead,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: nextRead } : m))
      );
    } catch (err) {
      sound.playAlert();
    }
  };

  const handleDeleteMessage = async () => {
    if (!msgToDelete) return;
    try {
      const targetCol = msgToDelete.source === 'visitor_messages_legacy' ? 'visitor_messages' : 'messages';
      await deleteDoc(doc(db, targetCol, msgToDelete.id));
      sound.playTrash();
      setMessages((prev) => prev.filter((m) => m.id !== msgToDelete.id));
      setMsgToDelete(null);
    } catch (err) {
      sound.playAlert();
    }
  };

  // Guestbook Moderation Actions
  const handleUpdateGuestbookStatus = async (entryId: string, newStatus: 'approved' | 'rejected') => {
    sound.playClick();
    try {
      await updateDoc(doc(db, 'guestbook', entryId), {
        status: newStatus,
        reviewedAt: serverTimestamp(),
      });
      sound.playSuccess();
      setGuestbookEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      sound.playAlert();
      console.error('Error updating guestbook status:', err);
    }
  };

  const handleDeleteGuestbookEntry = async () => {
    if (!entryToDelete) return;
    try {
      await deleteDoc(doc(db, 'guestbook', entryToDelete.id));
      sound.playTrash();
      setGuestbookEntries((prev) => prev.filter((e) => e.id !== entryToDelete.id));
      setEntryToDelete(null);
    } catch (err) {
      sound.playAlert();
    }
  };

  // Filtered views
  const filteredMessages = messages.filter((m) => {
    const matchRead =
      filterRead === 'all' ||
      (filterRead === 'unread' && !m.read) ||
      (filterRead === 'read' && m.read);
    const matchQuery =
      m.name.toLowerCase().includes(searchMsgQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchMsgQuery.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchMsgQuery.toLowerCase()));
    return matchRead && matchQuery;
  });

  const filteredGuestbook = guestbookEntries.filter((e) => {
    const matchStatus =
      filterStatus === 'all' || e.status === filterStatus;
    const matchQuery =
      e.name.toLowerCase().includes(searchGuestbookQuery.toLowerCase()) ||
      e.message.toLowerCase().includes(searchGuestbookQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header with collection tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20">
        <div>
          <h2 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            Communications & Guestbook Console
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Manage visitor contact inquiries ('messages' collection) and moderate public notes ('guestbook' collection).
          </p>
        </div>

        {/* Collection Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveSubTab('contact_messages');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs cursor-pointer transition ${
              activeSubTab === 'contact_messages'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Contact Form ({messages.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveSubTab('guestbook');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs cursor-pointer transition ${
              activeSubTab === 'guestbook'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guestbook Wall ({guestbookEntries.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CONTACT MESSAGES */}
      {activeSubTab === 'contact_messages' && (
        <div className="space-y-4">
          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search contact messages..."
                value={searchMsgQuery}
                onChange={(e) => setSearchMsgQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'unread', 'read'] as const).map((modeKey) => (
                <button
                  key={modeKey}
                  onClick={() => {
                    sound.playClick();
                    setFilterRead(modeKey);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs cursor-pointer capitalize ${
                    filterRead === modeKey
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {modeKey}
                </button>
              ))}
              <button
                onClick={loadContactMessages}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-800 cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* List */}
          {loadingMessages ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs animate-pulse">
              Loading contact transmissions...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 font-mono text-xs">
              No contact transmissions found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    msg.read
                      ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                      : 'bg-slate-900/80 border-amber-500/40 text-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-cyber font-bold text-white text-sm">
                        {msg.name}
                      </span>
                      {!msg.read && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">
                          NEW
                        </span>
                      )}
                      {msg.email && (
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {msg.email}
                        </span>
                      )}
                      {msg.source === 'visitor_messages_legacy' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          Legacy Archive
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-mono text-slate-300 leading-relaxed break-words">
                      "{msg.message}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleRead(msg)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition ${
                        msg.read
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {msg.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={() => setMsgToDelete(msg)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Delete transmission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: GUESTBOOK MODERATION */}
      {activeSubTab === 'guestbook' && (
        <div className="space-y-4">
          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search guestbook entries..."
                value={searchGuestbookQuery}
                onChange={(e) => setSearchGuestbookQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => {
                    sound.playClick();
                    setFilterStatus(statusKey);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs cursor-pointer capitalize ${
                    filterStatus === statusKey
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {statusKey}
                </button>
              ))}
              <button
                onClick={loadGuestbookEntries}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-800 cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* List */}
          {loadingGuestbook ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs animate-pulse">
              Loading guestbook submissions...
            </div>
          ) : filteredGuestbook.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 font-mono text-xs">
              No guestbook submissions match current filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGuestbook.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    entry.status === 'approved'
                      ? 'bg-slate-950/60 border-emerald-500/30 text-slate-300'
                      : entry.status === 'rejected'
                      ? 'bg-slate-950/60 border-rose-500/30 text-slate-400 opacity-70'
                      : 'bg-slate-900/90 border-amber-500/50 text-white shadow-md shadow-amber-500/10'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-cyber font-bold text-white text-sm">
                        {entry.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          entry.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : entry.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-200 leading-relaxed break-words">
                      "{entry.message}"
                    </p>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {entry.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateGuestbookStatus(entry.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono cursor-pointer transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {entry.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateGuestbookStatus(entry.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono cursor-pointer transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      onClick={() => setEntryToDelete(entry)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal for Contact Message */}
      {msgToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-950 border border-rose-500/50 space-y-4">
            <h3 className="font-cyber font-bold text-base text-white">Delete Contact Transmission?</h3>
            <p className="text-xs font-mono text-slate-300">
              Are you sure you want to permanently delete message from "{msgToDelete.name}"?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMsgToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessage}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-cyber uppercase cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Guestbook Entry */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-950 border border-rose-500/50 space-y-4">
            <h3 className="font-cyber font-bold text-base text-white">Delete Guestbook Entry?</h3>
            <p className="text-xs font-mono text-slate-300">
              Are you sure you want to delete note by "{entryToDelete.name}"?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEntryToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGuestbookEntry}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-cyber uppercase cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
