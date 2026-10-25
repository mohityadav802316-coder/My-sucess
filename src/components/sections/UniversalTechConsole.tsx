import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import {
  UNIVERSAL_TECH_REGISTRY,
  UNIVERSAL_TECH_CATEGORIES,
  UniversalTechItem,
  UniversalTechCategory,
} from '../../data/universalTechRegistry';
import { PremiumBrandLogo } from '../vfx/PremiumBrandLogo';
import { Lens3DViewer } from '../three/Lens3DViewer';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import {
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  Database,
  Cloud,
  Code,
  Shield,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const UniversalTechConsole: React.FC = () => {
  const { mode } = useLanguage();

  // Active state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechId, setSelectedTechId] = useState<string>('python');
  const [isCopied, setIsCopied] = useState(false);

  // Active selected item lookup
  const selectedItem = useMemo(() => {
    return (
      UNIVERSAL_TECH_REGISTRY.find((item) => item.id === selectedTechId) ||
      UNIVERSAL_TECH_REGISTRY[0]
    );
  }, [selectedTechId]);

  // Filtered tech list
  const filteredTechList = useMemo(() => {
    return UNIVERSAL_TECH_REGISTRY.filter((tech) => {
      const matchesCategory =
        selectedCategory === 'all' || tech.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        tech.name.toLowerCase().includes(query) ||
        (tech.nameHi && tech.nameHi.toLowerCase().includes(query)) ||
        tech.categoryLabel.toLowerCase().includes(query) ||
        tech.features.some((f) => f.toLowerCase().includes(query)) ||
        tech.compatibility.platforms.some((p) => p.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyCode = () => {
    if (selectedItem?.sampleCodeSnippet) {
      navigator.clipboard.writeText(selectedItem.sampleCodeSnippet);
      sound.playClick();
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'languages':
        return <Code className="w-3.5 h-3.5" />;
      case 'frameworks':
        return <Layers className="w-3.5 h-3.5" />;
      case 'databases':
        return <Database className="w-3.5 h-3.5" />;
      case 'cloud_devops':
        return <Cloud className="w-3.5 h-3.5" />;
      case 'ai_ml':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'tools':
        return <Shield className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section
      id="tech-console"
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-[radial-gradient(circle,rgba(254,249,240,0.06)_0%,rgba(212,175,55,0.03)_40%,transparent_70%)] blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full space-y-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] font-mono tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>UNIVERSAL 3D TECH CONSOLE // PRODUCTION ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
              <MysticTextReveal
                text={mode === 'hi' ? 'यूनिवर्सल 3D टेक कंसोल' : 'Universal 3D Tech Console'}
                magicTheme="gold"
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-stone-100 to-amber-300"
              />
            </h2>
            <p className="text-xs sm:text-sm font-mono text-stone-300 max-w-2xl leading-relaxed">
              {mode === 'hi'
                ? 'आधुनिक रिलेशनल SQL, नोएसक्यूएल, AI मॉडल, 3D इंजन और क्लाउड परिनियोजन आर्किटेक्चर।'
                : 'Curated luxury architectural console exploring live frameworks, databases, platforms, and AI engines.'}
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-3 font-mono text-xs text-stone-400">
            <div className="px-3.5 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800 backdrop-blur-md">
              <span className="text-amber-300 font-bold mr-1">
                {UNIVERSAL_TECH_REGISTRY.length}
              </span>
              <span>Supported Technologies</span>
            </div>
          </div>
        </div>

        {/* Master Console Chassis */}
        <div className="rounded-3xl border border-stone-200/20 bg-gradient-to-b from-[#fbfbfa]/95 via-[#f5f5f3]/95 to-[#edece8]/95 text-stone-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl overflow-hidden">
          {/* Top Bar of the Luxury Console */}
          <div className="px-6 py-4 border-b border-stone-300/60 bg-gradient-to-r from-stone-100/90 via-stone-50/90 to-stone-100/90 flex flex-wrap items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  mode === 'hi'
                    ? 'तकनीक, डेटाबेस या भाषा खोजें...'
                    : 'Search technology, database, framework...'
                }
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/90 border border-stone-300 text-stone-900 placeholder:text-stone-400 font-mono text-xs focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono text-stone-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-stone-800">
                {selectedItem.name}
              </span>
              <span className="text-stone-400">|</span>
              <span className="text-stone-500 text-[11px]">
                {selectedItem.compatibility.architecture}
              </span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="px-6 py-2.5 bg-stone-100/60 border-b border-stone-300/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {UNIVERSAL_TECH_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count =
                cat.id === 'all'
                  ? UNIVERSAL_TECH_REGISTRY.length
                  : UNIVERSAL_TECH_REGISTRY.filter((t) => t.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-stone-950 font-bold shadow-sm border border-stone-300/90 ring-1 ring-amber-500/20'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{mode === 'hi' ? cat.labelHi : cat.labelEn}</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200/70 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Stage: Left 3D Circular Lens + Right Deep Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-300/60">
            {/* Left Column: Large Central 3D Circular Optical Lens */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-stone-50/70 to-stone-100/70">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-[320px] h-[320px] rounded-full border border-stone-300/60" />
                <div className="absolute w-[380px] h-[380px] rounded-full border border-dashed border-stone-300/40" />
              </div>

              {/* Central 3D Lens Container */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4 group">
                <div className="absolute inset-0 z-0">
                  <Lens3DViewer
                    brandColor={selectedItem.svgBrandColor}
                    accentGlow={selectedItem.accentGlow}
                    isInteractive={true}
                  />
                </div>

                <motion.div
                  key={selectedItem.id}
                  initial={{ scale: 0.75, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                  className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                >
                  <PremiumBrandLogo
                    iconName={selectedItem.iconName}
                    className="w-full h-full object-contain"
                    brandColor={selectedItem.svgBrandColor}
                  />
                </motion.div>

                {selectedItem.badge && (
                  <div className="absolute -bottom-2 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-mono text-[10px] font-bold tracking-wider shadow-md uppercase">
                    {selectedItem.badge}
                  </div>
                )}
              </div>

              {/* Central Lens Caption */}
              <div className="text-center mt-3 space-y-1 relative z-10">
                <h3 className="font-cyber font-black text-2xl text-stone-900 tracking-tight">
                  {mode === 'hi' && selectedItem.nameHi
                    ? selectedItem.nameHi
                    : selectedItem.name}
                </h3>
                <p className="text-xs font-mono font-medium text-stone-500">
                  {mode === 'hi'
                    ? selectedItem.categoryLabelHi
                    : selectedItem.categoryLabel}{' '}
                  • {selectedItem.versionOrLevel}
                </p>
              </div>

              {/* Proficiency Gauge Bar */}
              <div className="w-full max-w-xs mt-5 space-y-1.5 relative z-10">
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-600">
                  <span>Proficiency & Readiness</span>
                  <span className="font-bold text-stone-900">
                    {selectedItem.proficiency}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-300/80 overflow-hidden p-0.5">
                  <motion.div
                    key={`gauge-${selectedItem.id}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedItem.proficiency}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-stone-800 via-amber-700 to-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Spec Sheet */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 bg-white/70">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-700 font-bold">
                    SPECIFICATION DOSSIER
                  </span>
                </div>
                <p className="text-sm sm:text-base font-sans text-stone-700 leading-relaxed">
                  {mode === 'hi'
                    ? selectedItem.shortSummaryHi
                    : selectedItem.shortSummary}
                </p>
              </div>

              {/* Compatibility Matrix Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-stone-400 block uppercase font-medium">
                    PLATFORM COMPATIBILITY
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-800 block">
                    {selectedItem.compatibility.platforms.join(', ')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-stone-400 block uppercase font-medium">
                    TIER &amp; ARCHITECTURE
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-800 block truncate">
                    {selectedItem.compatibility.architecture}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-mono text-stone-400 block uppercase font-medium">
                    CORE RUNTIME
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-800 block truncate">
                    {selectedItem.compatibility.runtime}
                  </span>
                </div>
              </div>

              {/* Core Features Pillars */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold text-stone-800 block uppercase tracking-wide">
                  {mode === 'hi' ? 'प्रमुख विशेषताएं' : 'Engineered Architectural Features'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(mode === 'hi' ? selectedItem.featuresHi : selectedItem.features).map(
                    (feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-100/70 border border-stone-200/60 text-xs font-sans text-stone-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Live Code Snippet */}
              {selectedItem.sampleCodeSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-500 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-stone-700" />
                      <span>{mode === 'hi' ? 'कोड नमूना' : 'Verified Code Implementation'}</span>
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-600 hover:text-stone-900 transition cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-900 text-stone-100 font-mono text-xs overflow-x-auto shadow-inner border border-stone-800">
                    <pre className="leading-relaxed whitespace-pre font-mono text-[11px] text-amber-200/90">
                      <code>{selectedItem.sampleCodeSnippet}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {selectedItem.documentationUrl && (
                  <a
                    href={selectedItem.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playClick()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <span>{mode === 'hi' ? 'दस्तावेज़ देखें' : 'Official Documentation'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => {
                    sound.playClick();
                    const el = document.getElementById('projects');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-xs font-semibold border border-stone-300 transition cursor-pointer"
                >
                  <span>{mode === 'hi' ? 'प्रोजेक्ट्स में उपयोग देखें' : 'View In Active Projects'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Technology Carousel */}
          <div className="p-6 bg-stone-100/90 border-t border-stone-300/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-stone-600">
              <span className="uppercase tracking-wider font-semibold">
                {mode === 'hi' ? 'सभी तकनीक कैटलॉग' : 'Universal Technology Catalogue'} ({filteredTechList.length})
              </span>
              <span className="text-[11px] text-stone-500 hidden sm:inline">
                Click any brand to project into 3D lens
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
              {filteredTechList.map((item) => {
                const isSelected = item.id === selectedTechId;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedTechId(item.id);
                    }}
                    className={`shrink-0 flex items-center gap-3 p-2.5 pr-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-amber-600 shadow-md ring-2 ring-amber-500/30 scale-[1.03]'
                        : 'bg-white/70 hover:bg-white border-stone-300/80 hover:border-stone-400 shadow-sm'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 p-1 flex items-center justify-center shrink-0">
                      <PremiumBrandLogo
                        iconName={item.iconName}
                        className="w-full h-full object-contain"
                        brandColor={item.svgBrandColor}
                      />
                    </div>
                    <div className="text-left">
                      <span className="font-cyber font-bold text-xs text-stone-900 block whitespace-nowrap">
                        {mode === 'hi' && item.nameHi ? item.nameHi : item.name}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500 block">
                        {item.categoryLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
