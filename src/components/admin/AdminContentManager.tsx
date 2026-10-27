import React, { useState, useEffect } from 'react';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { ProfileSettings, SectionTexts } from '../../types';
import {
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Target,
  User,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const AdminContentManager: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useImages();
  const profile = siteSettings.profile;
  const sectionTexts = siteSettings.sectionTexts || {};

  const [activeTab, setActiveTab] = useState<'profile' | 'sections'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form
  const [profileData, setProfileData] = useState<ProfileSettings>({
    name: profile?.name || 'Mohit Yadav',
    title: profile?.title || 'Class 12 Science Student & Future AI Engineer',
    titleHi: profile?.titleHi || 'कक्षा 12 विज्ञान छात्र एवं भविष्य के AI इंजीनियर',
    bioEn: profile?.bioEn || 'Passionate student technologist focused on AI engineering, Python architectures, and defensive cybersecurity.',
    bioHi: profile?.bioHi || 'AI इंजीनियरिंग, पायथन आर्किटेक्चर और साइबर सुरक्षा में समर्पित छात्र प्रौद्योगिकीविद।',
    education: profile?.education || 'Class 12 Science (PCM)',
    educationHi: profile?.educationHi || 'कक्षा 12 विज्ञान (PCM)',
    academicBoard: profile?.academicBoard || 'Bihar School Examination Board (BSEB)',
    targetRole: profile?.targetRole || 'AI Engineer & Full-Stack Systems Architect',
    targetRoleHi: profile?.targetRoleHi || 'AI इंजीनियर एवं फुल-स्टैक सिस्टम आर्किटेक्ट',
    careerGoalsEn: profile?.careerGoalsEn || [
      'Master advanced deep learning & agentic LLM systems',
      'Architect production-grade defensive cybersecurity software',
      'Build scalable web and native platforms for India and beyond'
    ],
    careerGoalsHi: profile?.careerGoalsHi || [
      'उन्नत डीप लर्निंग और AI सिस्टम्स में महारत हासिल करना',
      'मजबूत और सुरक्षित साइबर सुरक्षा सॉफ्टवेयर तैयार करना',
      'भारत और विश्व के लिए तकनीकी प्लेटफॉर्म्स का निर्माण करना'
    ]
  });

  // Section Copy Form
  const [texts, setTexts] = useState<SectionTexts>({
    aboutTitle: sectionTexts.aboutTitle || 'ACADEMIC & TECH ODYSSEY',
    aboutTitleHi: sectionTexts.aboutTitleHi || 'शैक्षणिक व तकनीकी सफर',
    aboutSubtitle: sectionTexts.aboutSubtitle || 'Class 12 Science Student at BSEB • Future AI Engineer & Developer',
    aboutSubtitleHi: sectionTexts.aboutSubtitleHi || 'बिहार बोर्ड 12वीं विज्ञान छात्र • भावी AI इंजीनियर व डेवलपर',
    cyberTitle: sectionTexts.cyberTitle || 'ETHICAL CYBER DEFENSE & SHIELD',
    cyberTitleHi: sectionTexts.cyberTitleHi || 'एथिकल साइबर सुरक्षा एवं रक्षा प्रणाली',
    cyberSubtitle: sectionTexts.cyberSubtitle || 'Securing architectures with zero-trust protocols & automated defense',
    cyberSubtitleHi: sectionTexts.cyberSubtitleHi || 'ज़ीरो-ट्रस्ट प्रोटोकॉल और ऑटोमेटेड सुरक्षा प्रणाली',
    skillsTitle: sectionTexts.skillsTitle || 'CORE CAPABILITIES & STACK',
    skillsTitleHi: sectionTexts.skillsTitleHi || 'कौशल व तकनीकी दक्षता',
    skillsSubtitle: sectionTexts.skillsSubtitle || 'Specialized in Python architectures, AI automation, and interactive systems',
    skillsSubtitleHi: sectionTexts.skillsSubtitleHi || 'पायथन, AI ऑटोमेशन और इंटरएक्टिव सिस्टम्स में विशेषज्ञता',
    roadmapTitle: sectionTexts.roadmapTitle || 'THE JOURNEY & ROADMAP',
    roadmapTitleHi: sectionTexts.roadmapTitleHi || 'सफरनामा व भविष्य की योजनाएं',
    roadmapSubtitle: sectionTexts.roadmapSubtitle || 'From foundations in science to AI engineering mastery',
    roadmapSubtitleHi: sectionTexts.roadmapSubtitleHi || 'विज्ञान के मूल से लेकर AI इंजीनियरिंग की महारत तक',
    projectsTitle: sectionTexts.projectsTitle || 'INNOVATION MATRIX & LAB',
    projectsTitleHi: sectionTexts.projectsTitleHi || 'प्रोजेक्ट्स व तकनीकी उपलब्धियां',
    projectsSubtitle: sectionTexts.projectsSubtitle || 'Interactive showcase of production applications and AI workflows',
    projectsSubtitleHi: sectionTexts.projectsSubtitleHi || 'वास्तविक प्रोजेक्ट्स और AI एप्लिकेशन्स की श्रृंखला',
    galleryTitle: sectionTexts.galleryTitle || 'MULTIVERSE 3D PORTFOLIO GALLERY',
    galleryTitleHi: sectionTexts.galleryTitleHi || '3D मल्टीवर्स फोटो गैलरी',
    gallerySubtitle: sectionTexts.gallerySubtitle || 'Interactive visual journey across science, code, and camaraderie',
    gallerySubtitleHi: sectionTexts.gallerySubtitleHi || 'विज्ञान, कोडिंग और यादों का 3D विजुअल सफर',
    visionTitle: sectionTexts.visionTitle || 'FUTURE HORIZON & ASPIRATIONS',
    visionTitleHi: sectionTexts.visionTitleHi || 'भविष्य की दृष्टि व संकल्प',
    contactTitle: sectionTexts.contactTitle || 'ESTABLISH SECURE LINK',
    contactTitleHi: sectionTexts.contactTitleHi || 'संपर्क सूत्र व संवाद',
  });

  useEffect(() => {
    if (siteSettings.profile) {
      setProfileData({
        name: siteSettings.profile.name || 'Mohit Yadav',
        title: siteSettings.profile.title || 'Class 12 Science Student & Future AI Engineer',
        titleHi: siteSettings.profile.titleHi || 'कक्षा 12 विज्ञान छात्र एवं भविष्य के AI इंजीनियर',
        bioEn: siteSettings.profile.bioEn || 'Passionate student technologist focused on AI engineering, Python architectures, and defensive cybersecurity.',
        bioHi: siteSettings.profile.bioHi || 'AI इंजीनियरिंग, पायथन आर्किटेक्चर और साइबर सुरक्षा में समर्पित छात्र प्रौद्योगिकीविद।',
        education: siteSettings.profile.education || 'Class 12 Science (PCM)',
        educationHi: siteSettings.profile.educationHi || 'कक्षा 12 विज्ञान (PCM)',
        academicBoard: siteSettings.profile.academicBoard || 'Bihar School Examination Board (BSEB)',
        targetRole: siteSettings.profile.targetRole || 'AI Engineer & Full-Stack Systems Architect',
        targetRoleHi: siteSettings.profile.targetRoleHi || 'AI इंजीनियर एवं फुल-स्टैक सिस्टम आर्किटेक्ट',
        careerGoalsEn: siteSettings.profile.careerGoalsEn || [
          'Master advanced deep learning & agentic LLM systems',
          'Architect production-grade defensive cybersecurity software',
          'Build scalable web and native platforms for India and beyond'
        ],
        careerGoalsHi: siteSettings.profile.careerGoalsHi || [
          'उन्नत डीप लर्निंग और AI सिस्टम्स में महारत हासिल करना',
          'मजबूत और सुरक्षित साइबर सुरक्षा सॉफ्टवेयर तैयार करना',
          'भारत और विश्व के लिए तकनीकी प्लेटफॉर्म्स का निर्माण करना'
        ]
      });
    }
    if (siteSettings.sectionTexts) {
      setTexts((prev) => ({
        ...prev,
        ...siteSettings.sectionTexts,
      }));
    }
  }, [siteSettings.profile, siteSettings.sectionTexts]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await updateSiteSettings({
        profile: profileData,
      });
      sound.playSuccess();
      setStatusMessage({ type: 'success', text: 'Profile & academic records updated!' });
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Save error: ${err.message}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleSaveSections = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await updateSiteSettings({
        sectionTexts: texts,
      });
      sound.playSuccess();
      setStatusMessage({ type: 'success', text: 'All section titles and subtitles saved!' });
    } catch (err: any) {
      sound.playAlert();
      setStatusMessage({ type: 'error', text: `Save error: ${err.message}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20">
        <div>
          <h2 className="font-cyber font-bold text-xl text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Content, Academic Bio & Section Texts
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Manage personal biography, Class 12 board credentials, target roles, and bilingual section headings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs cursor-pointer transition ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Profile & Academics
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs cursor-pointer transition ${
              activeTab === 'sections'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Section Titles (EN / HI)
          </button>
        </div>
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

      {/* TAB 1: PROFILE & ACADEMICS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="font-cyber font-bold text-base text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              Basic Profile & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Academic Board</label>
                <input
                  type="text"
                  value={profileData.academicBoard}
                  onChange={(e) => setProfileData({ ...profileData, academicBoard: e.target.value })}
                  placeholder="BSEB Bihar Board"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Title (EN)</label>
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Title (HI)</label>
                <input
                  type="text"
                  value={profileData.titleHi}
                  onChange={(e) => setProfileData({ ...profileData, titleHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Current Class / Education (EN)</label>
                <input
                  type="text"
                  value={profileData.education}
                  onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                  placeholder="Class 12 Science (PCM)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Current Class / Education (HI)</label>
                <input
                  type="text"
                  value={profileData.educationHi}
                  onChange={(e) => setProfileData({ ...profileData, educationHi: e.target.value })}
                  placeholder="कक्षा 12 विज्ञान (PCM)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Target Professional Role (EN)</label>
                <input
                  type="text"
                  value={profileData.targetRole}
                  onChange={(e) => setProfileData({ ...profileData, targetRole: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Target Professional Role (HI)</label>
                <input
                  type="text"
                  value={profileData.targetRoleHi}
                  onChange={(e) => setProfileData({ ...profileData, targetRoleHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">Full Biography (EN)</label>
              <textarea
                rows={3}
                value={profileData.bioEn}
                onChange={(e) => setProfileData({ ...profileData, bioEn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-300 mb-1">Full Biography (HI)</label>
              <textarea
                rows={3}
                value={profileData.bioHi}
                onChange={(e) => setProfileData({ ...profileData, bioHi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      )}

      {/* TAB 2: SECTIONS TEXT */}
      {activeTab === 'sections' && (
        <form onSubmit={handleSaveSections} className="space-y-6 max-w-3xl">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="font-cyber font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Dynamic Section Copy
            </h3>

            {/* About */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">About Title (EN)</label>
                <input
                  type="text"
                  value={texts.aboutTitle}
                  onChange={(e) => setTexts({ ...texts, aboutTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">About Title (HI)</label>
                <input
                  type="text"
                  value={texts.aboutTitleHi}
                  onChange={(e) => setTexts({ ...texts, aboutTitleHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Cyber Defense */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Cyber Title (EN)</label>
                <input
                  type="text"
                  value={texts.cyberTitle}
                  onChange={(e) => setTexts({ ...texts, cyberTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Cyber Title (HI)</label>
                <input
                  type="text"
                  value={texts.cyberTitleHi}
                  onChange={(e) => setTexts({ ...texts, cyberTitleHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Skills Title (EN)</label>
                <input
                  type="text"
                  value={texts.skillsTitle}
                  onChange={(e) => setTexts({ ...texts, skillsTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Skills Title (HI)</label>
                <input
                  type="text"
                  value={texts.skillsTitleHi}
                  onChange={(e) => setTexts({ ...texts, skillsTitleHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Projects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Projects Title (EN)</label>
                <input
                  type="text"
                  value={texts.projectsTitle}
                  onChange={(e) => setTexts({ ...texts, projectsTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Projects Title (HI)</label>
                <input
                  type="text"
                  value={texts.projectsTitleHi}
                  onChange={(e) => setTexts({ ...texts, projectsTitleHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Gallery Title (EN)</label>
                <input
                  type="text"
                  value={texts.galleryTitle}
                  onChange={(e) => setTexts({ ...texts, galleryTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">Gallery Title (HI)</label>
                <input
                  type="text"
                  value={texts.galleryTitleHi}
                  onChange={(e) => setTexts({ ...texts, galleryTitleHi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Section Headings'}
          </button>
        </form>
      )}
    </div>
  );
};
