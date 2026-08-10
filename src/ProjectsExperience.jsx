import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- INLINE NEON SVG ICONS ---
const ScaleIcon = () => (
  <svg className="neon-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3v18M3 7h18M6 7l-3 7a3 3 0 006 0L6 7zm12 0l-3 7a3 3 0 006 0l-3-7zM8 21h8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CartIcon = () => (
  <svg className="neon-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CameraIcon = () => (
  <svg className="neon-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChartIcon = () => (
  <svg className="neon-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BankIcon = () => (
  <svg className="neon-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BrainIcon = () => (
  <svg className="neon-card-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9.5 2A2.5 2.5 0 007 4.5v.5A2.5 2.5 0 004.5 7.5v.5A2.5 2.5 0 002 10.5v3A2.5 2.5 0 004.5 16v.5A2.5 2.5 0 007 19v.5A2.5 2.5 0 009.5 22h5a2.5 2.5 0 002.5-2.5v-.5a2.5 2.5 0 002.5-2.5v-.5a2.5 2.5 0 002.5-2.5v-3a2.5 2.5 0 00-2.5-2.5v-.5a2.5 2.5 0 00-2.5-2.5v-.5A2.5 2.5 0 0014.5 2h-5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- 6 PROJECT DATA ITEMS - UNIFORM MASTER TEMPLATE DATA ---
const PROJECTS = [
  {
    id: 'legal-ai',
    step: '01',
    topBadge: '⭐ Featured',
    IconComponent: ScaleIcon,
    title: 'The Legal AI Companion',
    subtitle: 'AI Powered Personal Legal Assistant',
    desc: 'RAG based legal assistant delivering accurate Indian legal insights with 87% context relevance and 94% voice accuracy.',
    tech: ['Python', 'BERT', 'RAG', 'ChromaDB', 'LangChain'],
    themeColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.85)',
    borderGlow: '0 0 45px rgba(168, 85, 247, 0.7), inset 0 0 25px rgba(168, 85, 247, 0.45)',
    liquidGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.45) 0%, rgba(99, 102, 241, 0.3) 50%, rgba(59, 130, 246, 0.2) 100%)',
    github: 'https://github.com',
    demo: 'https://demo.com'
  },
  {
    id: 'ecommerce-rec',
    step: '02',
    topBadge: '✦ Recommendation',
    IconComponent: CartIcon,
    title: 'AI-Powered E-commerce Recommendation',
    subtitle: 'Hybrid AI Product Discovery Engine',
    desc: 'Hybrid recommendation engine achieving 88% accuracy while processing 50k+ products with <500ms latency.',
    tech: ['Python', 'Sklearn', 'Pandas', 'PyTorch', 'React'],
    themeColor: '#00f2fe',
    glowColor: 'rgba(0, 242, 254, 0.85)',
    borderGlow: '0 0 45px rgba(0, 242, 254, 0.7), inset 0 0 25px rgba(0, 242, 254, 0.45)',
    liquidGradient: 'linear-gradient(135deg, rgba(0, 242, 254, 0.45) 0%, rgba(37, 99, 235, 0.3) 50%, rgba(2, 132, 199, 0.2) 100%)',
    github: 'https://github.com',
    demo: 'https://demo.com'
  },
  {
    id: 'shelf-monitoring',
    step: '03',
    topBadge: '✦ Computer Vision',
    IconComponent: CameraIcon,
    title: 'AI-Powered Retail Shelf Monitoring',
    subtitle: 'Edge Vision Stock Compliance System',
    desc: 'YOLO + OpenCV solution with 92% accuracy, reducing inventory audit time by 80% with real-time detection.',
    tech: ['YOLO', 'OpenCV', 'Python', 'CUDA', 'PyTorch'],
    themeColor: '#ff7d00',
    glowColor: 'rgba(255, 125, 0, 0.85)',
    borderGlow: '0 0 45px rgba(255, 125, 0, 0.7), inset 0 0 25px rgba(255, 125, 0, 0.45)',
    liquidGradient: 'linear-gradient(135deg, rgba(255, 125, 0, 0.45) 0%, rgba(255, 183, 3, 0.3) 50%, rgba(245, 158, 11, 0.2) 100%)',
    github: 'https://github.com',
    demo: 'https://demo.com'
  },
  {
    id: 'sales-analytics',
    step: '04',
    topBadge: '✦ Analytics',
    IconComponent: ChartIcon,
    title: 'Amazon Sales Analytics Dashboard',
    subtitle: 'Interactive BI Sales Intelligence Engine',
    desc: 'Interactive Power BI dashboard tracking 100K+ transactions with 70% query time reduction.',
    tech: ['Power BI', 'SQL', 'DAX', 'Python', 'Pandas'],
    themeColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.85)',
    borderGlow: '0 0 45px rgba(16, 185, 129, 0.7), inset 0 0 25px rgba(16, 185, 129, 0.45)',
    liquidGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.45) 0%, rgba(34, 197, 94, 0.3) 50%, rgba(5, 150, 105, 0.2) 100%)',
    github: 'https://github.com',
    demo: 'https://demo.com'
  },
  {
    id: 'banking-system',
    step: '05',
    topBadge: '✦ Banking Systems',
    IconComponent: BankIcon,
    title: 'Banking Management System',
    subtitle: 'Digital Banking & Fraud Prevention Platform',
    desc: 'MySQL database for 750k+ daily transactions, 99.9% uptime, 40% query optimization.',
    tech: ['MySQL', 'SQL', 'Python', 'Express', 'React'],
    themeColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.85)',
    borderGlow: '0 0 45px rgba(6, 182, 212, 0.7), inset 0 0 25px rgba(6, 182, 212, 0.45)',
    liquidGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.45) 0%, rgba(8, 145, 178, 0.3) 50%, rgba(0, 242, 254, 0.2) 100%)',
    github: 'https://github.com',
    demo: 'https://demo.com'
  },
  {
    id: 'ml-predictions',
    step: '06',
    topBadge: '✦ Predictive ML',
    IconComponent: BrainIcon,
    title: 'ML Prediction Models',
    subtitle: 'Ensemble Predictive Modeling Suite',
    desc: 'Customer Churn (92%) & Loan Default (90%) prediction models using Python & Scikit-learn.',
    tech: ['Python', 'Sklearn', 'Pandas', 'XGBoost', 'Flask'],
    themeColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.85)',
    borderGlow: '0 0 45px rgba(236, 72, 153, 0.7), inset 0 0 25px rgba(236, 72, 153, 0.45)',
    liquidGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.45) 0%, rgba(255, 0, 127, 0.3) 50%, rgba(217, 70, 239, 0.2) 100%)',
    github: 'https://github.com',
    demo: 'https://demo.com'
  }
];

// 3D Particles
function FloatingParticles() {
  const pointsRef = useRef();

  const { positions, colors } = React.useMemo(() => {
    const count = 1600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#a855f7'),
      new THREE.Color('#00f2fe'),
      new THREE.Color('#ff7d00'),
      new THREE.Color('#10b981'),
      new THREE.Color('#ec4899')
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 24;

      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.06;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={0.75}
      />
    </points>
  );
}

// Normalize offset for circular infinite loop
function getLoopOffset(index, activeIndex, total) {
  let diff = index - activeIndex;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

export default function ProjectsExperience({ onBack }) {
  const total = PROJECTS.length;
  
  // ACTIVE CARD STATE INDEX
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeProjectDetail, setActiveProjectDetail] = useState(null);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  // Swipe & Drag Gesture Handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const endX = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX) || startXRef.current;
    const deltaX = endX - startXRef.current;

    const threshold = 40;
    if (deltaX < -threshold) {
      // Swipe left -> Next card
      setActiveIndex((prev) => (prev + 1) % total);
    } else if (deltaX > threshold) {
      // Swipe right -> Previous card
      setActiveIndex((prev) => (prev - 1 + total) % total);
    }
  };

  const handleWheel = (e) => {
    const delta = e.deltaY || e.deltaX;
    if (window.wheelDebounceTimer) return;
    window.wheelDebounceTimer = setTimeout(() => {
      window.wheelDebounceTimer = null;
    }, 250);

    if (delta > 0) {
      setActiveIndex((prev) => (prev + 1) % total);
    } else if (delta < 0) {
      setActiveIndex((prev) => (prev - 1 + total) % total);
    }
  };

  const handleCardClick = (index, project) => {
    if (index === activeIndex) {
      // ACTIVE CENTER CARD CLICKED -> Open Detail View
      setActiveProjectDetail(project);
    } else {
      // INACTIVE SIDE CARD CLICKED -> Immediately make it active center
      setActiveIndex(index);
    }
  };

  // RENDER ORDER:
  // 1. All inactive cards (sorted from furthest to closest to center)
  // 2. Active card LAST (rendered at the bottom of the DOM tree to guarantee top layer paint)
  const inactiveProjects = PROJECTS.map((proj, idx) => ({ proj, idx })).filter(item => item.idx !== activeIndex);
  inactiveProjects.sort((a, b) => {
    const distA = Math.abs(getLoopOffset(a.idx, activeIndex, total));
    const distB = Math.abs(getLoopOffset(b.idx, activeIndex, total));
    return distB - distA; // Furthest cards first, closer cards later
  });

  const activeProjectItem = { proj: PROJECTS[activeIndex], idx: activeIndex };

  const renderSlabCard = (project, idx, isActive) => {
    const offset = getLoopOffset(idx, activeIndex, total);

    // TRANSFORMS
    let translateX = 0;
    let translateZ = -500;
    let rotateY = 0;
    let scale = 0.82;
    let opacity = 0;

    if (offset === 0) {
      // Center Active Card
      translateX = 0;
      translateZ = 220;
      rotateY = 0;
      scale = 1;
      opacity = 1;
    } else if (offset === -1 || (offset < 0 && offset >= -1.5)) {
      // Left Adjacent Card
      translateX = -290;
      translateZ = -100;
      rotateY = 30;
      scale = 0.82;
      opacity = 0.75;
    } else if (offset === 1 || (offset > 0 && offset <= 1.5)) {
      // Right Adjacent Card
      translateX = 290;
      translateZ = -100;
      rotateY = -30;
      scale = 0.82;
      opacity = 0.75;
    } else {
      // Outer Cards
      translateX = offset > 0 ? 500 : -500;
      translateZ = -500;
      rotateY = offset > 0 ? -45 : 45;
      scale = 0.6;
      opacity = 0;
    }

    const IconComponent = project.IconComponent;

    return (
      <div
        key={project.id}
        className={`apple-liquid-slab-card ${isActive ? 'is-active-center' : 'is-side-card'}`}
        style={{
          transform: `perspective(1200px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
          opacity: opacity,
          pointerEvents: opacity > 0.1 ? 'auto' : 'none',
          boxShadow: isActive 
            ? `0 35px 95px ${project.glowColor}, ${project.borderGlow}`
            : `0 25px 60px rgba(0,0,0,0.7)`
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick(idx, project);
        }}
      >
        <div 
          className="slab-liquid-caustics" 
          style={{ background: project.liquidGradient }}
        ></div>

        <div className="slab-water-shine"></div>
        <div className="slab-neon-border" style={{ borderColor: project.themeColor }}></div>

        <div className="slab-header-row">
          <span className="slab-badge" style={{ backgroundColor: `${project.themeColor}25`, borderColor: `${project.themeColor}50`, color: project.themeColor }}>
            {project.topBadge}
          </span>
          <span className="slab-step-num" style={{ color: project.themeColor }}>
            {project.step}
          </span>
        </div>

        <div className="slab-icon-container" style={{ color: project.themeColor, filter: `drop-shadow(0 0 15px ${project.themeColor})` }}>
          <IconComponent />
        </div>

        <div className="slab-mockup-screen">
          <div className="mockup-header-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="mockup-content-preview" style={{ background: `radial-gradient(circle at 50% 50%, ${project.themeColor}20 0%, #080915 100%)` }}>
            <div className="mockup-icon-glow" style={{ color: project.themeColor }}>
              <IconComponent />
            </div>
            <span className="mockup-text-tag">{project.subtitle}</span>
          </div>
        </div>

        <div className="slab-info-body">
          <h2 className="slab-project-title">{project.title}</h2>
          <p className="slab-project-subtitle">{project.subtitle}</p>
          <p className="slab-project-desc">{project.desc}</p>

          <div className="slab-tech-chips">
            {project.tech.map((t, i) => (
              <span key={i} className="slab-tech-chip">
                {t}
              </span>
            ))}
          </div>

          <div className="slab-action-row">
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="slab-btn slab-btn-github"
            >
              <svg className="slab-btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </a>
            
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="slab-btn slab-btn-demo"
              style={{ background: `linear-gradient(135deg, ${project.themeColor} 0%, #6366f1 100%)` }}
            >
              <svg className="slab-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Live Demo
            </a>
          </div>

        </div>

      </div>
    );
  };

  return (
    <div 
      className="about-experience-fullscreen apple-keynote-projects-page"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onWheel={handleWheel}
    >
      <div className="apple-glow-orb orb-1"></div>
      <div className="apple-glow-orb orb-2"></div>
      <div className="apple-glow-orb orb-3"></div>

      {/* R3F Canvas Particle Backdrop */}
      <div className="liquid-canvas-backdrop">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={1.1} />
          <pointLight position={[6, 6, 6]} intensity={1.8} color="#00f2fe" />
          <pointLight position={[-6, -6, -6]} intensity={1.8} color="#ec4899" />
          <FloatingParticles />
          <EffectComposer>
            <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.8} intensity={1.1} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Top Navigation Bar with TOP LEFT "← Go Back" Button */}
      <header className="keynote-top-nav">
        <div className="top-nav-brand">
          <button 
            onClick={onBack}
            className="about-experience-btn-back top-left-go-back-btn"
          >
            <span className="btn-icon">←</span> Go Back
          </button>
        </div>



        <div className="top-nav-actions">
          <button className="nav-circle-btn" title="Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </button>
          <button className="nav-circle-btn" title="Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
            </svg>
          </button>
          <button className="nav-circle-btn" title="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </header>

      {/* 1. TOP CENTER TITLE SECTION */}
      <div className="keynote-title-section">
        <h1 className="keynote-rainbow-title">PROJECTS</h1>
      </div>

      {/* 2. 3D COVER FLOW SLIDER VIEWPORT (CENTERED) */}
      <div className="liquid-coverflow-viewport">
        <div className="liquid-coverflow-track">
          {/* RENDER INACTIVE CARDS FIRST, ACTIVE CARD LAST */}
          {inactiveProjects.map(({ proj, idx }) => renderSlabCard(proj, idx, false))}
          {renderSlabCard(activeProjectItem.proj, activeProjectItem.idx, true)}
        </div>
      </div>

      {/* 3. BOTTOM CONTROLS SECTION BELOW CAROUSEL */}
      <div className="mockup-bottom-controls">
        {/* 👋 Drag / Swipe to Explore Pill (28px below carousel) */}
        <div className="drag-instruction-pill">
          <span className="pill-arrow" onClick={() => setActiveIndex((prev) => (prev - 1 + total) % total)} style={{ cursor: 'pointer' }}>‹</span>
          <span className="pill-text">👋 Drag / Swipe to Explore</span>
          <span className="pill-arrow" onClick={() => setActiveIndex((prev) => (prev + 1) % total)} style={{ cursor: 'pointer' }}>›</span>
        </div>

        {/* Carousel Indicators Dots (16px below drag pill) */}
        <div className="pagination-dots">
          {PROJECTS.map((_, i) => (
            <span 
              key={i} 
              className={`dot-item ${i === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(i)}
              style={{ cursor: 'pointer' }}
            ></span>
          ))}
        </div>
      </div>

      {/* FULL SCREEN PROJECT DETAILS MODAL */}
      {activeProjectDetail && (
        <div className="project-detail-modal-overlay">
          <div className="project-detail-modal-backdrop" onClick={() => setActiveProjectDetail(null)}></div>
          
          <div className="project-detail-modal-card" style={{ borderColor: activeProjectDetail.themeColor }}>
            <div className="project-detail-header">
              <span className="project-detail-badge" style={{ color: activeProjectDetail.themeColor, borderColor: `${activeProjectDetail.themeColor}50`, backgroundColor: `${activeProjectDetail.themeColor}20` }}>
                {activeProjectDetail.topBadge}
              </span>
              <h2 className="project-detail-title">{activeProjectDetail.title}</h2>
              <button 
                onClick={() => setActiveProjectDetail(null)} 
                className="project-detail-close-btn"
              >
                ✕ Close
              </button>
            </div>

            <div className="project-detail-banner" style={{ background: `radial-gradient(circle at 50% 50%, ${activeProjectDetail.themeColor}40 0%, #0a0b16 100%)` }}>
              <div className="banner-glow" style={{ background: activeProjectDetail.themeColor }}></div>
              <div className="modal-banner-icon" style={{ color: activeProjectDetail.themeColor }}>
                <activeProjectDetail.IconComponent />
              </div>
              <span className="banner-title">{activeProjectDetail.title}</span>
            </div>

            <div className="project-detail-body">
              <h3>Project Overview</h3>
              <p>{activeProjectDetail.desc}</p>

              <h3>Technologies &amp; Architecture</h3>
              <div className="project-detail-tech">
                {activeProjectDetail.tech.map((t, idx) => (
                  <span key={idx} className="tech-chip-item" style={{ borderColor: `${activeProjectDetail.themeColor}60`, color: activeProjectDetail.themeColor }}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="project-detail-actions">
                <a 
                  href={activeProjectDetail.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-view-resume btn-github-modal"
                >
                  GitHub Repository
                </a>
                <a 
                  href={activeProjectDetail.demo} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-download-resume btn-demo-modal"
                  style={{ background: `linear-gradient(135deg, ${activeProjectDetail.themeColor} 0%, #6366f1 100%)` }}
                >
                  Launch Live Demo
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
