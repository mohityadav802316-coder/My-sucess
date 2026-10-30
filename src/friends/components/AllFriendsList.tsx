import React, { useState, useMemo } from 'react';
import { Friend, resolveImageUrl, isFriendPublic } from '../data/friends';
import { Search, MessageCircle, Plus } from 'lucide-react';

interface AllFriendsListProps {
  friends: Friend[];
  onOpenProfile: (id: string) => void;
  onOpenCreateProfile?: () => void;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export const AllFriendsList: React.FC<AllFriendsListProps> = ({
  friends,
  onOpenProfile,
  onOpenCreateProfile,
  isAdmin = false,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Public friends only (defense in depth against hidden/unlisted profiles)
  const publicFriends = useMemo(() => {
    if (!friends) return [];
    return friends.filter((f) => isFriendPublic(f));
  }, [friends]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return publicFriends;
    const q = searchQuery.toLowerCase().trim();
    return publicFriends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.fullName && f.fullName.toLowerCase().includes(q)) ||
        (f.username && f.username.toLowerCase().includes(q)) ||
        (f.user && f.user.toLowerCase().includes(q)) ||
        (f.nickname && f.nickname.toLowerCase().includes(q)) ||
        (f.role && f.role.toLowerCase().includes(q))
    );
  }, [publicFriends, searchQuery]);

  return (
    <div className="w-full max-w-xl mx-auto my-2 px-2 flex flex-col gap-3">
      {/* Search Friends Input */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8fa3bf]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="दोस्त खोजें (Search Friends)..."
          className="w-full bg-[#111726]/80 border border-[#1f2b46] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#e8f4ff] placeholder-[#8fa3bf]/60 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe]/40 transition-all font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8fa3bf] hover:text-[#00f2fe] px-1.5 py-0.5 rounded bg-[#1f2b46]/50"
          >
            ✕
          </button>
        )}
      </div>

      {isLoading && friends.length === 0 ? (
        <div className="flex flex-col gap-3 my-2 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="w-full h-20 rounded-2xl bg-[#111726]/60 border border-[#1f2b46]/50 flex items-center px-4 gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-500/20" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="w-32 h-4 rounded bg-cyan-950/40" />
                <div className="w-20 h-3 rounded bg-slate-800/40" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#1f2b46] bg-[#111726]/40 text-[#8fa3bf] my-4">
          <p className="text-base font-medium">
            {searchQuery ? 'कोई दोस्त नहीं मिला' : 'अभी कोई दोस्त नहीं है।'}
          </p>
          {searchQuery ? (
            <p className="text-xs text-[#8fa3bf]/70 mt-1">
              अलग नाम या कीवर्ड लिखकर खोजें।
            </p>
          ) : isAdmin ? (
            <p className="text-xs text-[#ffb53d] mt-2 font-mono">
              💡 Admin Panel खोलकर "+ नया दोस्त" जोड़ें।
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 w-full" role="list">
          {/* Quick Create Your Profile Card */}
          {onOpenCreateProfile && !searchQuery && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                (window as any).__startBackgroundMusic?.();
                onOpenCreateProfile();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenCreateProfile();
                }
              }}
              className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-pink-950/20 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/60 transition-all duration-200 cursor-pointer text-left group select-none shadow-[0_0_15px_rgba(0,242,254,0.1)] hover:shadow-[0_0_20px_rgba(0,242,254,0.25)]"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-cyan-400/80 bg-cyan-950/60 flex items-center justify-center text-cyan-300 group-hover:scale-105 group-hover:bg-cyan-500/20 transition-all shrink-0">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col flex-grow min-w-0">
                <span className="font-bold text-sm text-cyan-200 group-hover:text-white flex items-center gap-2">
                  <span>+ Create Your Profile</span>
                  <span className="text-[10px] bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold uppercase">
                    Join
                  </span>
                </span>
                <span className="text-xs text-slate-400 truncate">
                  नेटवर्क में जुड़ें • अपनी 3D Cyberpunk प्रोफ़ाइल बनाएं
                </span>
              </div>
              <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform text-sm font-bold pr-1">
                →
              </span>
            </div>
          )}

          {filteredFriends.map((friend) => {
            const isSquadMember = (friend.cats || friend.categories || []).includes('squad');
            const accent = friend.accent || (isSquadMember ? '#FFB53D' : '#00F2FE');

            return (
              <div
                key={friend.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenProfile(friend.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenProfile(friend.id);
                  }
                }}
                className={`
                  row-press w-full flex items-center gap-3.5 p-3 rounded-2xl
                  bg-[#111726]/80 backdrop-blur-sm border border-[#1f2b46]
                  hover:border-[#00f2fe]/60 hover:bg-[#161f33]
                  transition-all duration-200 cursor-pointer text-left
                  group relative overflow-hidden focus-visible:outline-2 focus-visible:outline-[#ffb53d] select-none
                `}
              >
                {/* Subtle glow hover bar on left with friend's accent color */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: accent }}
                />

                {/* Circular 48px Profile Photo */}
                <div
                  className="relative flex-shrink-0 w-12 h-12 rounded-full p-[2px] transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, #9B5CFF)`,
                    boxShadow: `0 0 10px ${accent}40`,
                  }}
                >
                  <img
                    src={resolveImageUrl(friend.avatar)}
                    alt={friend.name}
                    loading="lazy"
                    className="w-full h-full rounded-full object-cover bg-[#0a0d14]"
                  />
                  {isSquadMember && (
                    <span
                      title="Squad Member"
                      className="absolute -top-1 -right-1 text-[12px] bg-[#0a0d14] rounded-full border border-[#ffb53d] px-0.5 leading-none"
                    >
                      👑
                    </span>
                  )}
                </div>

                {/* Friend Details: Name & Username */}
                <div className="flex flex-col flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold text-[15px] text-[#e8f4ff] truncate transition-colors"
                      style={{
                        color: undefined,
                      }}
                    >
                      {friend.name}
                    </span>
                    {friend.nickname && (
                      <span className="text-xs text-[#8fa3bf]/70 truncate">
                        ({friend.nickname})
                      </span>
                    )}
                    {friend.isDemo && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#1f2b46]/70 text-[#8fa3bf]">
                        Demo
                      </span>
                    )}
                    {!friend.isVisible && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800">
                        Hidden
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#8fa3bf] truncate">
                    {friend.username || friend.user || friend.role || 'Digital Friend'}
                  </span>
                </div>

                {/* Real Online Status Dot (ONLY when authenticated online === true) */}
                {friend.online === true && (
                  <div className="flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold text-[#3dff9a] pr-1">
                    <span className="w-2 h-2 rounded-full bg-[#3dff9a] inline-block shadow-[0_0_8px_#3dff9a]" />
                    <span>Online</span>
                  </div>
                )}

                {/* 1-Click WhatsApp Quick Action */}
                {friend.whatsapp && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const digits = (friend.whatsapp || '').replace(/\D/g, '');
                      if (!digits) return;
                      const fullNum = digits.length === 10 ? `91${digits}` : digits;
                      const msg = encodeURIComponent(`Hi ${friend.name}, saw your profile on Mohit's Friends Universe 3D!`);
                      window.open(`https://wa.me/${fullNum}?text=${msg}`, '_blank');
                    }}
                    title={`${friend.name} को WhatsApp पर मैसेज भेजें`}
                    className="p-2 rounded-full bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 transition-all border border-[#25D366]/40 cursor-pointer shrink-0 z-10 active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}

                {/* Right arrow subtle chevron */}
                <span className="text-[#8fa3bf] group-hover:text-[#00f2fe] text-sm pr-1 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Friends Count Footer */}
      {filteredFriends.length > 0 && (
        <div className="text-center pt-2 pb-1 text-xs text-[#8fa3bf]/70 font-mono">
          कुल दोस्त: {filteredFriends.length}
        </div>
      )}
    </div>
  );
};
