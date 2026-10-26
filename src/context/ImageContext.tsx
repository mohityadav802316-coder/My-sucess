import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PortfolioImage,
  SiteSettings,
  ProjectItem,
  SkillItem,
  RoadmapMilestone
} from '../types';
import {
  db,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp
} from '../firebase';

export const defaultProjects: ProjectItem[] = [
  {
    id: 'pinchat',
    title: 'PinChat',
    titleHi: 'पिनचैट (PinChat)',
    subtitle: 'Social & Instant Chat Application Concept',
    subtitleHi: 'सोशल व इंस्टेंट मैसेजिंग आर्किटेक्चर',
    description: 'A modern, privacy-oriented social messaging and chat application concept designed for intuitive communication, channels, and responsive mobile-first messaging.',
    descriptionHi: 'आधुनिक और सुरक्षित रियल-टाइम मैसेजिंग एप्लिकेशन अवधारणा।',
    status: 'Active Development',
    statusHi: 'विकास में',
    tags: ['Chat Architecture', 'WebSockets / Realtime', 'UI/UX', 'Mobile Responsive'],
    features: [
      'Real-time messaging channels',
      'Direct message pinning & focus modes',
      'Minimalist dark cyberpunk theme',
      'Mobile-first responsive interface',
    ],
    featuresHi: [
      'रियल-टाइम मैसेजिंग चैनल',
      'मैसेज पिनिंग और फोकस मोड',
      'साइबरपंक डार्क थीम',
      'मोबाइल-अनुकूल इंटरफेस',
    ],
    targetOutcome: 'Full-featured real-time cross-platform chat platform.',
    targetOutcomeHi: 'क्रॉस-प्लेटफ़ॉर्म रियल-टाइम सोशल चैट प्लेटफ़ॉर्म।',
    isAvailable: false,
    accentColor: '#06b6d4',
  },
  {
    id: 'lifetracker',
    title: 'Life Tracker',
    titleHi: 'लाइफ ट्रैकर (Life Tracker)',
    subtitle: 'Productivity & Personal Habit Tracking System',
    subtitleHi: 'उत्पादकता व व्यक्तिगत आदत ट्रैकिंग सिस्टम',
    description: 'A comprehensive personal productivity, routine, habit, and daily metric tracker designed to optimize learning time, coding habits, and health goals.',
    descriptionHi: 'दैनिक उत्पादकता, पढ़ाई के समय और कोडिंग आदतों को ट्रैक करने वाला सिस्टम।',
    status: 'In Progress',
    statusHi: 'कार्य प्रगति पर',
    tags: ['Productivity', 'Habit Logic', 'Local Storage', 'Analytics'],
    features: [
      'Daily routine and study habit tracking',
      'Visual progress and consistency streaks',
      'Offline-first data retention',
      'Target goal reminders and timers',
    ],
    featuresHi: [
      'दैनिक दिनचर्या और अध्ययन ट्रैकिंग',
      'स्ट्रिक्स और विजुअल प्रोग्रेस चार्ट',
      'ऑफ़लाइन-प्रथम डेटा प्रतिधारण',
      'लक्ष्य अनुस्मारक और टाइमर',
    ],
    targetOutcome: 'Personal daily dashboard for continuous self-improvement.',
    targetOutcomeHi: 'निरंतर आत्म-सुधार के लिए दैनिक डैशबोर्ड।',
    isAvailable: false,
    accentColor: '#10b981',
  },
  {
    id: 'pornblocker',
    title: 'Porn Blocker',
    titleHi: 'पॉर्न ब्लॉकर (Porn Blocker)',
    subtitle: 'Android Digital Wellness & Distraction Filter',
    subtitleHi: 'एंड्रॉइड डिजिटल वेलनेस व फोकस रक्षक',
    description: 'A focused Android digital wellness utility concept aimed at filtering adult content, preventing compulsive device browsing, and safeguarding focus.',
    descriptionHi: 'एकाग्रता और डिजिटल स्वास्थ्य बनाए रखने के लिए सुरक्षा और फ़िल्टरिंग उपयोगिता।',
    status: 'Active Development',
    statusHi: 'विकास में',
    tags: ['Android', 'Content Filtering', 'Digital Wellness', 'Focus Guard'],
    features: [
      'Intelligent keyword and domain barrier logic',
      'Emergency streak lock to prevent unblocking impulses',
      'Distraction-free study session mode',
      'Local policy enforcement without cloud surveillance',
    ],
    featuresHi: [
      'कीवर्ड और डोमेन ब्लॉकिंग लॉजिक',
      'इमरजेंसी स्ट्रीक लॉक सुरक्षा',
      'अध्ययन फोकस सत्र मोड',
      'स्थानीय गोपनीयता सुरक्षा',
    ],
    targetOutcome: 'Clean, safe browsing shield for distraction-free learning.',
    targetOutcomeHi: 'ध्यान भटकाने वाले तत्वों से मुक्त स्वच्छ अध्ययन शील्ड।',
    isAvailable: false,
    accentColor: '#f43f5e',
  },
  {
    id: 'aicreation',
    title: 'AI Creation Lab',
    titleHi: 'AI क्रिएशन लैब (AI Creation)',
    subtitle: 'AI Generative Visuals & Prompt Engineering Suite',
    subtitleHi: 'AI जनरेटिव विजुअल्स व प्रॉम्प्ट इंजीनियरिंग',
    description: 'Practical exploration of cutting-edge multimodal generative AI, prompt optimization frameworks, and neural image/video generation workflows.',
    descriptionHi: 'मल्टीमॉडल जनरेटिव AI, प्रॉम्प्ट इंजीनियरिंग और विजुअल जेनरेशन वर्कफ़्लो।',
    status: 'Active Development',
    statusHi: 'विकास में',
    tags: ['Prompt Engineering', 'Generative AI', 'Diffusion Models', 'Creative Tech'],
    features: [
      'Systematic prompt formulation templates',
      'Consistent style preservation benchmarks',
      'AI image and cinematic video synthesis exploration',
      'Integration experiments with Python AI wrappers',
    ],
    featuresHi: [
      'व्यवस्थित प्रॉम्प्ट फॉर्मूलेशन टेम्प्लेट',
      'कंसिस्टेंट स्टाइल बेंचमार्क',
      'AI छवि और सिनेमैटिक वीडियो अन्वेषण',
      'पायथन AI रैपर्स के साथ प्रयोग',
    ],
    targetOutcome: 'High-fidelity generative asset generation pipeline.',
    targetOutcomeHi: 'उच्च-गुणवत्ता वाली AI जनरेटिव पाइपलाइन।',
    isAvailable: false,
    accentColor: '#a855f7',
  },
  {
    id: '3dgame',
    title: '3D Game Development',
    titleHi: '3D गेम डेवलपमेंट (3D Game)',
    subtitle: 'Three.js & WebGL Interactive Spatial Experience',
    subtitleHi: 'Three.js व WebGL इंटरैक्टिव 3D दुनिया',
    description: 'Interactive real-time 3D web experience experimenting with procedural shaders, dynamic orbital cameras, physical lighting, and spatial audio.',
    descriptionHi: 'Three.js और WebGL के साथ 3D शेडर्स और गतिशील कैमरों का अन्वेषण।',
    status: 'In Progress',
    statusHi: 'कार्य प्रगति पर',
    tags: ['Three.js', 'WebGL', '3D Graphics', 'Procedural Audio', 'Interactive Tech'],
    features: [
      'Real-time PBR material lighting pipeline',
      'Interactive rotational touch and pointer dynamics',
      'Procedural Web Audio sound synthesis',
      'Smooth 60 FPS mobile and desktop performance',
    ],
    featuresHi: [
      'रियल-टाइम PBR मैटेरियल लाइटिंग',
      'टच व पॉइंटर रोटेशनल इंटरेक्शन',
      'प्रोसीजरल वेब ऑडियो संश्लेषण',
      'स्मूथ 60 FPS मोबाइल प्रदर्शन',
    ],
    targetOutcome: 'Engaging cinematic 3D web environment accessible in browsers.',
    targetOutcomeHi: 'ब्राउज़र में सुलभ आकर्षक 3D वेब वातावरण।',
    isAvailable: false,
    accentColor: '#8b5cf6',
  },
  {
    id: 'portfolio',
    title: 'Cinematic 3D Portfolio Matrix',
    titleHi: 'सिनेमैटिक 3D पोर्टफोलियो',
    subtitle: 'Production Cyberpunk Showcase & Firebase Nexus',
    subtitleHi: 'साइबरपंक शोकेस और फायरबेस नेक्सस',
    description: 'This official portfolio: featuring interactive Three.js 3D Photo-Orbit, luxury cyberpunk UI, Firebase Authentication, Storage image pipeline, and Firestore visitor messaging.',
    descriptionHi: 'यह आधिकारिक 3D साइबरपंक पोर्टफोलियो वेबसाइट।',
    status: 'Live Showcase',
    statusHi: 'लाइव शोकेस',
    tags: ['React 19', 'Three.js', 'Firebase Auth', 'Firestore', 'Tailwind CSS'],
    features: [
      'Circular 3D Hero Photo-Orbit with Firebase synchronization',
      'Distinct scroll-based cinematic scene environments',
      'Authenticated Admin Control Center & Image Manager',
      'Full bilingual Hindi/English accessibility and Web Audio',
    ],
    featuresHi: [
      'सर्कुलर 3D हीरो फोटो-ऑर्बिट',
      'सिनेमैटिक मल्टीवर्स सीन नेविगेशन',
      'प्रमाणीकृत एडमिन कंट्रोल पैनल',
      'द्विभाषी हिंदी/अंग्रेजी और साउंड इफेक्ट्स',
    ],
    targetOutcome: 'A futuristic digital identity showcasing genuine skills and ambition.',
    targetOutcomeHi: 'भविष्योन्मुखी डिजिटल पहचान जो वास्तविक कौशल प्रदर्शित करती है।',
    isAvailable: true,
    accentColor: '#ec4899',
  },
];

export const defaultSkills: SkillItem[] = [
  {
    name: 'Python',
    nameHi: 'पायथन',
    category: 'current',
    icon: 'Terminal',
    description: 'Core programming syntax, automation scripts, algorithms, data structures, and procedural problem-solving.',
    descriptionHi: 'कोर सिंटैक्स, स्क्रिप्टिंग, ऑटोमेशन और समस्या समाधान।',
    highlights: ['Core Syntax & Logic', 'Script Automation', 'File Handling', 'Data Analysis Basics'],
    proficiency: 94,
  },
  {
    name: 'Prompt Engineering',
    nameHi: 'प्रॉम्प्ट इंजीनियरिंग',
    category: 'current',
    icon: 'BrainCircuit',
    description: 'Systematic structure formulation, zero/few-shot framing, reasoning chains, and domain-grounded LLM guidance.',
    descriptionHi: 'संरचित प्रॉम्प्ट डिज़ाइन और AI मॉडल नियंत्रण।',
    highlights: ['Chain of Thought', 'System Directives', 'Output Formatting', 'Role Prompting'],
    proficiency: 90,
  },
  {
    name: 'AI Image & Video Generation',
    nameHi: 'AI इमेज व वीडियो',
    category: 'current',
    icon: 'Sparkles',
    description: 'Creation of high-fidelity visual assets, cinematic cyberpunk concepts, and iterative style synthesis.',
    descriptionHi: 'उच्च-गुणवत्ता वाली डिजिटल कला और वीडियो निर्माण।',
    highlights: ['Photorealistic Diffusion', 'Cinematic Cyberpunk Styles', 'Video Latent Framing', 'Asset Crafting'],
    proficiency: 88,
  },
  {
    name: 'GitHub & Version Control',
    nameHi: 'गिटहब और गिट',
    category: 'tools',
    icon: 'Code2',
    description: 'Repository management, branching, commit discipline, and collaborative open-source workflows.',
    descriptionHi: 'रिपॉजिटरी प्रबंधन और कोड संस्करण नियंत्रण।',
    highlights: ['Git CLI Operations', 'Branch Management', 'Repo Synchronization', 'Release Tags'],
    proficiency: 85,
  },
  {
    name: 'Render Deployment & Hosting',
    nameHi: 'रेंडर होस्टिंग व डिप्लॉय',
    category: 'tools',
    icon: 'Globe',
    description: 'Deploying full-stack applications, containerized services, webhooks, and cloud environment configuration.',
    descriptionHi: 'फुल-स्टैक ऐप्स और वेब सेवाओं की क्लाउड तैनाती।',
    highlights: ['Web Service Hosting', 'Static Site Hosting', 'Environment Configs', 'Continuous Delivery'],
    proficiency: 82,
  },
  {
    name: 'App & Website Builders',
    nameHi: 'वेब व ऐप बिल्डर्स',
    category: 'tools',
    icon: 'Layers',
    description: 'Modern component-driven application scaffolding with React, Vite, Tailwind CSS, and mobile toolchains.',
    descriptionHi: 'रिएक्ट, टेलविंड और आधुनिक वेब टूल्स के साथ निर्माण।',
    highlights: ['Component Architecture', 'Tailwind CSS Styling', 'Responsive Mobile-First', 'Modern React'],
    proficiency: 89,
  },
  {
    name: 'Advanced Python & OOP',
    nameHi: 'एडवांस्ड पायथन व OOP',
    category: 'learning',
    icon: 'Cpu',
    description: 'Object-oriented patterns, decorators, generators, dunder protocols, and robust modular software architecture.',
    descriptionHi: 'ऑब्जेक्ट-ओरिएंटेड प्रोग्रामिंग, डेकोरेटर्स और क्लीन आर्किटेक्चर।',
    highlights: ['Classes & Inheritance', 'Dunder Methods', 'Decorators & Generators', 'Clean Architecture'],
    proficiency: 80,
  },
  {
    name: 'Machine Learning & Deep Learning',
    nameHi: 'मशीन लर्निंग व डीप लर्निंग',
    category: 'learning',
    icon: 'Brain',
    description: 'Mathematical foundations, gradient descent, neural network architectures, PyTorch/TensorFlow concepts, and supervised learning.',
    descriptionHi: 'गणितीय आधार, न्यूरल नेटवर्क और मॉडल प्रशिक्षण।',
    highlights: ['Math & Linear Algebra', 'Tensor Operations', 'Neural Architectures', 'Model Evaluation'],
    proficiency: 78,
  },
  {
    name: 'LLMs & AI Agentic Systems',
    nameHi: 'LLMs व AI एजेंट्स',
    category: 'learning',
    icon: 'Sparkles',
    description: 'Building autonomous tool-calling AI agents, vector embeddings, RAG pipelines, and API integrations.',
    descriptionHi: 'स्वायत्त AI एजेंट्स और RAG पाइपलाइन्स का निर्माण।',
    highlights: ['Function Calling', 'RAG Pipelines', 'Vector Stores', 'Autonomous Loops'],
    proficiency: 82,
  },
];

export const defaultMilestones: RoadmapMilestone[] = [
  {
    id: 'm1',
    phase: 'PHASE 01 // FOUNDATION',
    title: 'Python Core Foundations',
    titleHi: 'पायथन कोर फाउंडेशन',
    status: 'completed',
    statusText: 'Mastered',
    statusTextHi: 'महारत हासिल',
    description: 'Deep understanding of Python language syntax, control structures, functions, and data structures.',
    descriptionHi: 'पायथन सिंटैक्स, नियंत्रण संरचनाएं और डेटा संरचनाओं की मजबूत नींव।',
    topics: ['Variables & Primitive Types', 'Lists, Dictionaries & Sets', 'Control Loops & Logic', 'File I/O & Exception Handling'],
    yearMonth: '2024 - Foundation',
    order: 1,
  },
  {
    id: 'm2',
    phase: 'PHASE 02 // INTERMEDIATE & DEV',
    title: 'Data Handling & Real Projects',
    titleHi: 'डेटा हैंडलिंग व वास्तविक प्रोजेक्ट्स',
    status: 'in-progress',
    statusText: 'In Progress (Active)',
    statusTextHi: 'प्रगति पर (सक्रिय)',
    description: 'Building practical apps, modular scripting, API integration, and database connectivity.',
    descriptionHi: 'व्यावहारिक ऐप्स निर्माण, API एकीकरण और डेटाबेस प्रबंधन।',
    topics: ['NumPy & Pandas Concepts', 'REST APIs & JSON Pipelines', 'Firebase & Firestore SDK', 'Modular Script Packages'],
    yearMonth: '2025 - Active Dev',
    order: 2,
  },
  {
    id: 'm3',
    phase: 'PHASE 03 // ADVANCED AI HORIZON',
    title: 'AI, ML & Deep Learning',
    titleHi: 'AI, ML और डीप लर्निंग',
    status: 'future',
    statusText: 'Upcoming Focus',
    statusTextHi: 'आगामी लक्ष्य',
    description: 'Mastering machine learning algorithms, neural network mathematics, and generative architectures.',
    descriptionHi: 'मशीन लर्निंग एल्गोरिदम, न्यूरल नेटवर्क गणित और जनरेटिव आर्किटेक्चर।',
    topics: ['Supervised & Unsupervised Learning', 'Neural Network Training', 'PyTorch / TensorFlow Pipelines', 'Computer Vision & NLP Basics'],
    yearMonth: '2026 - AI Horizon',
    order: 3,
  },
  {
    id: 'm4',
    phase: 'PHASE 04 // MASTER LEVEL',
    title: 'Autonomous AI Systems & Deployment',
    titleHi: 'स्वायत्त AI सिस्टम और परिनियोजन',
    status: 'future',
    statusText: 'Long-Term Vision',
    statusTextHi: 'दीर्घकालिक विज़न',
    description: 'Architecting intelligent autonomous agents, production cloud scaling, and real-world AI applications.',
    descriptionHi: 'बुद्धिमान स्वायत्त एजेंट्स और वास्तविक दुनिया के AI समाधान।',
    topics: ['Multi-Agent Orchestration', 'Scalable Cloud Microservices', 'Production AI Pipelines', 'Continuous Innovation'],
    yearMonth: '2026+ Master Level',
    order: 4,
  },
];

export const defaultSiteSettings: SiteSettings = {
  profile: {
    name: 'Mohit Yadav',
    title: 'Future AI Engineer | Python Developer | Web & App Creator',
    titleHi: 'भावी AI इंजीनियर | पायथन डेवलपर | वेब व ऐप निर्माता',
    bioEn: "I'm an aspiring AI Engineer and Python developer passionate about building applications, websites, AI-powered tools, and futuristic digital experiences. My focus is turning curiosity into practical, real-world technology.",
    bioHi: 'मैं एक उत्साही AI इंजीनियर और पायथन डेवलपर हूँ जो उपयोगी ऐप्स, वेबसाइट्स, AI उपकरण और भविष्य के डिजिटल अनुभव बनाने के लिए प्रतिबद्ध हूँ।',
    education: 'Class 12 Science Student',
    educationHi: 'कक्षा 12 विज्ञान छात्र',
    academicBoard: 'Bihar Board (BSEB)',
    targetRole: 'Future AI Engineer & Tech Innovator',
    targetRoleHi: 'भावी AI इंजीनियर और नवप्रवर्तक',
    careerGoalsEn: [
      'Master Advanced Python and foundational mathematics for AI and Machine Learning.',
      'Build practical AI solutions, intelligent automation tools, and real-time apps.',
      'Pursue higher university education in Computer Science and Artificial Intelligence.',
      'Contribute to open-source software and develop products that positively impact people.',
    ],
    careerGoalsHi: [
      'AI और मशीन लर्निंग के लिए उन्नत पायथन और गणितीय नींव में महारत।',
      'वास्तविक AI समाधान और बुद्धिमान ऑटोमेशन उपकरण विकसित करना।',
      'कंप्यूटर विज्ञान और कृत्रिम बुद्धिमत्ता में उच्च शिक्षा।',
      'ओपन-सोर्स सॉफ़्टवेयर में योगदान देना।',
    ],
  },
  hero: {
    heroTitle: 'MOHIT YADAV',
    heroSubtitle: 'Future AI Engineer | Python Developer | Web & App Creator',
    heroBioEn: "I'm an aspiring AI Engineer and Python developer passionate about building applications, websites, AI-powered tools, and futuristic digital experiences.",
    heroBioHi: 'मैं एक उत्साही AI इंजीनियर और पायथन डेवलपर हूँ जो उपयोगी ऐप्स, वेबसाइट्स और AI उपकरण बनाने के लिए समर्पित हूँ।',
    orbitCycleInterval: 2.5,
    autoRotateSpeed: 0.45,
    enable3DPhotoOrbit: true,
    enableQuantumCore: true,
    orbitImageIds: [],
    particlesEnabled: true,
  },
  theme: {
    neonColor: 'cyan',
    glowIntensity: 'balanced',
    fontFamily: 'rajdhani',
    backgroundStyle: 'particles',
    soundEnabledByDefault: false,
  },
  scenes: {
    activeScenes: {
      hero: true,
      techConsole: true,
      about: true,
      skills: true,
      roadmap: true,
      projects: true,
      guestbook: true,
      gallery: true,
      vision: true,
      contact: true,
    },
    sceneOrder: ['hero', 'about', 'techConsole', 'skills', 'roadmap', 'projects', 'gallery', 'guestbook', 'contact'],
  },
  contact: {
    email: 'mohityadav802316@gmail.com',
    githubUrl: 'https://github.com',
    telegramUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    location: 'Bihar, India',
    locationHi: 'बिहार, भारत',
    responseAvailability: 'Open for learning collaborations and tech discussions',
    responseAvailabilityHi: 'तकनीकी सहयोग और चर्चा के लिए हमेशा उपलब्ध',
    whatsappNumber: '+918023160000',
    instagramUrl: 'https://instagram.com/mohityadav',
    phoneNumber: '',
    isPhonePublic: false,
  },
  seo: {
    metaTitle: 'Mohit Yadav | Future AI Engineer & Python Developer',
    metaDescription: 'Official cinematic 3D Cyberpunk portfolio of Mohit Yadav - Future AI Engineer, Python Developer, and Web & App Creator.',
    ogImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80',
  },
  music: {
    enabled: true,
    audioUrl: '/audio/ambient-cyberpunk.mp3',
    volume: 0.35,
    title: 'Cyberpunk Ambient Dream',
    loop: true,
    fadeInSeconds: 2,
  },
  magicSmoke: {
    enabled: true,
    intensity: 'medium',
    colors: ['#ef4444', '#a855f7', '#f59e0b', '#06b6d4'],
  },
  explodedIntro: {
    enabled: true,
  },
  familyVault: {
    hasPasswordSet: false,
  },
  lowDataMode: false,
  projects: defaultProjects,
  skills: defaultSkills,
  milestones: defaultMilestones,
  // Backward compatibility
  heroTitle: 'MOHIT YADAV',
  heroSubtitle: 'Future AI Engineer | Python Developer | Web & App Creator',
  heroBioEn: "I'm an aspiring AI Engineer and Python developer passionate about building applications, websites, AI-powered tools, and futuristic digital experiences.",
  heroBioHi: 'मैं एक उत्साही AI इंजीनियर और पायथन डेवलपर हूँ जो उपयोगी ऐप्स और AI उपकरण बनाने के लिए समर्पित हूँ।',
  orbitCycleInterval: 2.5,
  themeColor: 'cyan',
  activeScenes: {
    hero: true,
    about: true,
    skills: true,
    projects: true,
    gallery: true,
    vision: true,
    contact: true,
  },
};

interface ImageContextType {
  publishedImages: PortfolioImage[];
  allImages: PortfolioImage[];
  mainProfileImage: PortfolioImage | null;
  heroOrbitImages: PortfolioImage[];
  galleryImages: PortfolioImage[];
  aboutImages: PortfolioImage[];
  roadmapImages: PortfolioImage[];
  siteSettings: SiteSettings;
  projects: ProjectItem[];
  skills: SkillItem[];
  milestones: RoadmapMilestone[];
  isLoading: boolean;
  refreshImages: () => Promise<void>;
  updateSiteSettings: (settings: Partial<SiteSettings>, publishImmediately?: boolean) => Promise<void>;
}

const ImageContext = createContext<ImageContextType>({
  publishedImages: [],
  allImages: [],
  mainProfileImage: null,
  heroOrbitImages: [],
  galleryImages: [],
  aboutImages: [],
  roadmapImages: [],
  siteSettings: defaultSiteSettings,
  projects: defaultProjects,
  skills: defaultSkills,
  milestones: defaultMilestones,
  isLoading: true,
  refreshImages: async () => {},
  updateSiteSettings: async () => {},
});

// Instant local cache helpers to avoid any visual delay on initial boot
const getCachedPublishedImages = (): PortfolioImage[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('mohit_cached_images');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const getCachedSiteSettings = (): SiteSettings => {
  if (typeof window === 'undefined') return defaultSiteSettings;
  try {
    const raw = localStorage.getItem('mohit_cached_settings');
    if (raw) return { ...defaultSiteSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSiteSettings;
};

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publishedImages, setPublishedImages] = useState<PortfolioImage[]>(getCachedPublishedImages);
  const [allImages, setAllImages] = useState<PortfolioImage[]>(getCachedPublishedImages);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getCachedSiteSettings);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPublishedImages = async () => {
    try {
      const imagesRef = collection(db, 'images');
      let snapshot;
      try {
        const q = query(imagesRef, where('isPublished', '==', true));
        snapshot = await getDocs(q);
      } catch (err) {
        console.warn('Query on images failed, fallback to collection:', err);
        snapshot = await getDocs(imagesRef);
      }

      const pubItems: PortfolioImage[] = [];
      const allItems: PortfolioImage[] = [];

      snapshot.forEach((d) => {
        const data = d.data();
        const img: PortfolioImage = {
          id: d.id,
          title: data.title || '',
          caption: data.caption || '',
          captionHi: data.captionHi || '',
          downloadUrl: data.downloadUrl || '',
          storagePath: data.storagePath || '',
          section: data.section || 'gallery',
          category: data.category || 'personal',
          displayOrder: data.displayOrder ?? 0,
          isPublished: data.isPublished ?? true,
          isMainProfile: data.isMainProfile ?? false,
          isHeroOrbit: data.isHeroOrbit ?? false,
          orbitIndex: data.orbitIndex ?? 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        allItems.push(img);
        if (img.isPublished) {
          pubItems.push(img);
        }
      });

      const sortImages = (list: PortfolioImage[]) => {
        return list.sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
          const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
          const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
          return tB - tA;
        });
      };

      setPublishedImages(sortImages(pubItems));
      setAllImages(sortImages(allItems));
    } catch (err) {
      console.warn('Error fetching published images from Firestore:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time synchronization for images and settings
  useEffect(() => {
    fetchPublishedImages();

    // 1. Listen for images changes
    let unsubImages = () => {};
    try {
      const imagesRef = collection(db, 'images');
      unsubImages = onSnapshot(
        imagesRef,
        (snapshot) => {
          const pubItems: PortfolioImage[] = [];
          const allItems: PortfolioImage[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            const img: PortfolioImage = {
              id: d.id,
              title: data.title || '',
              caption: data.caption || '',
              captionHi: data.captionHi || '',
              downloadUrl: data.downloadUrl || '',
              storagePath: data.storagePath || '',
              section: data.section || 'gallery',
              category: data.category || 'personal',
              displayOrder: data.displayOrder ?? 0,
              isPublished: data.isPublished ?? true,
              isMainProfile: data.isMainProfile ?? false,
              isHeroOrbit: data.isHeroOrbit ?? false,
              orbitIndex: data.orbitIndex ?? 0,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
            allItems.push(img);
            if (img.isPublished) {
              pubItems.push(img);
            }
          });

          const sortImages = (list: PortfolioImage[]) => {
            return list.sort((a, b) => {
              if (a.displayOrder !== b.displayOrder) {
                return a.displayOrder - b.displayOrder;
              }
              const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
              const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
              return tB - tA;
            });
          };

          setPublishedImages(sortImages(pubItems));
          setAllImages(sortImages(allItems));
          setIsLoading(false);
        },
        (error) => {
          console.warn('Images snapshot error:', error);
          setIsLoading(false);
        }
      );
    } catch {}

    // 2. Listen for settings doc
    let unsubSettings = () => {};
    try {
      const settingsRef = doc(db, 'settings', 'general');
      unsubSettings = onSnapshot(
        settingsRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSiteSettings((prev) => {
              return {
                ...defaultSiteSettings,
                ...prev,
                ...data,
                profile: {
                  ...defaultSiteSettings.profile,
                  ...prev.profile,
                  ...(data.profile || {}),
                },
                hero: {
                  ...defaultSiteSettings.hero,
                  ...prev.hero,
                  ...(data.hero || {}),
                },
                theme: {
                  ...defaultSiteSettings.theme,
                  ...prev.theme,
                  ...(data.theme || {}),
                },
                scenes: {
                  ...defaultSiteSettings.scenes,
                  ...prev.scenes,
                  ...(data.scenes || {}),
                  activeScenes: {
                    ...defaultSiteSettings.scenes.activeScenes,
                    ...(data.scenes?.activeScenes || {}),
                  },
                },
                contact: {
                  ...defaultSiteSettings.contact,
                  ...prev.contact,
                  ...(data.contact || {}),
                },
                seo: {
                  ...defaultSiteSettings.seo,
                  ...prev.seo,
                  ...(data.seo || {}),
                },
                music: {
                  ...defaultSiteSettings.music,
                  ...(prev.music || {}),
                  ...(data.music || {}),
                },
                magicSmoke: {
                  ...defaultSiteSettings.magicSmoke,
                  ...(prev.magicSmoke || {}),
                  ...(data.magicSmoke || {}),
                },
                familyVault: {
                  ...defaultSiteSettings.familyVault,
                  ...(prev.familyVault || {}),
                  ...(data.familyVault || {}),
                },
                lowDataMode: data.lowDataMode !== undefined ? data.lowDataMode : (prev.lowDataMode || false),
                projects: data.projects || prev.projects || defaultProjects,
                skills: data.skills || prev.skills || defaultSkills,
                milestones: data.milestones || prev.milestones || defaultMilestones,
              };
            });
          }
        },
        (err) => {
          console.warn('Settings listener note:', err);
        }
      );
    } catch {}

    return () => {
      unsubImages();
      unsubSettings();
    };
  }, []);

  const updateSiteSettings = async (
    newSettings: Partial<SiteSettings>,
    publishImmediately = true
  ) => {
    try {
      const settingsRef = doc(db, 'settings', 'general');
      const merged: SiteSettings = {
        ...siteSettings,
        ...newSettings,
        isDraft: !publishImmediately,
        lastPublishedAt: publishImmediately ? serverTimestamp() : siteSettings.lastPublishedAt,
        updatedAt: serverTimestamp(),
      };
      await setDoc(settingsRef, merged, { merge: true });
      setSiteSettings((prev) => ({
        ...prev,
        ...newSettings,
        isDraft: !publishImmediately,
      }));
    } catch (err) {
      console.error('Error saving site settings:', err);
      throw err;
    }
  };

  // 1. Resolve Primary Profile Image
  // Priority 1: Specifically selected via primaryPhotoId in siteSettings.hero
  // Priority 2: Newest photo marked isMainProfile in profile section
  // Priority 3: Newest photo marked isMainProfile
  // Priority 4: Any published profile photo
  // Priority 5: First published image
  let mainProfileImage: PortfolioImage | null = null;
  if (siteSettings.hero?.primaryPhotoId) {
    mainProfileImage = publishedImages.find((img) => img.id === siteSettings.hero.primaryPhotoId) || null;
  }
  if (!mainProfileImage) {
    mainProfileImage =
      publishedImages.find((img) => img.isMainProfile && img.section === 'profile') ||
      publishedImages.find((img) => img.isMainProfile) ||
      publishedImages.find((img) => img.section === 'profile') ||
      publishedImages[0] ||
      null;
  }

  // Instant local sync for zero-delay boot
  if (typeof window !== 'undefined' && mainProfileImage?.downloadUrl) {
    try {
      localStorage.setItem('mohit_profile_photo', mainProfileImage.downloadUrl);
    } catch {}
  }

  // 2. Resolve 3D Hero Orbit Images
  // Priority 1: Specifically selected in siteSettings.hero.orbitImageIds
  // Priority 2: Any images marked isHeroOrbit
  // Priority 3: All published images
  let heroOrbitImages: PortfolioImage[] = [];
  const configuredOrbitIds = siteSettings.hero?.orbitImageIds || [];
  if (configuredOrbitIds.length > 0) {
    const fromConfig = configuredOrbitIds
      .map((id) => publishedImages.find((img) => img.id === id))
      .filter((img): img is PortfolioImage => Boolean(img));
    if (fromConfig.length > 0) {
      heroOrbitImages = fromConfig;
    }
  }
  if (heroOrbitImages.length === 0) {
    const explicitOrbit = publishedImages.filter((img) => img.isHeroOrbit);
    if (explicitOrbit.length > 0) {
      heroOrbitImages = explicitOrbit.slice(0, 6);
    } else {
      heroOrbitImages = publishedImages.slice(0, 6);
    }
  }

  const galleryImages = publishedImages.filter((img) => img.section === 'gallery');
  const aboutImages = publishedImages.filter((img) => img.section === 'about');
  const roadmapImages = publishedImages.filter((img) => img.section === 'roadmap');

  const activeProjects = siteSettings.projects && siteSettings.projects.length > 0
    ? siteSettings.projects
    : defaultProjects;
  const activeSkills = siteSettings.skills && siteSettings.skills.length > 0
    ? siteSettings.skills
    : defaultSkills;
  const activeMilestones = siteSettings.milestones && siteSettings.milestones.length > 0
    ? siteSettings.milestones
    : defaultMilestones;

  return (
    <ImageContext.Provider
      value={{
        publishedImages,
        allImages,
        mainProfileImage,
        heroOrbitImages,
        galleryImages,
        aboutImages,
        roadmapImages,
        siteSettings,
        projects: activeProjects,
        skills: activeSkills,
        milestones: activeMilestones,
        isLoading,
        refreshImages: fetchPublishedImages,
        updateSiteSettings,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImages = () => useContext(ImageContext);
