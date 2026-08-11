import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './index.css';

import AboutExperience from './AboutExperience.jsx';
import ProjectsExperience from './ProjectsExperience.jsx';
import SkillsExperience from './SkillsExperience.jsx';

// Import local profile image and data
import profileImg from './image/Arikaran_profile.jpeg';

// --- INLINE ICON SVG COMPONENTS ---

const GithubIcon = () => (
  <svg className="loader-icon-svg" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="loader-icon-svg" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const LeetcodeIcon = () => (
  <svg className="loader-icon-svg" viewBox="0 0 24 24">
    <path d="M16.102 17.93l-2.69 2.607c-.466.451-1.211.451-1.677 0l-4.51-4.37c-.467-.453-.467-1.188 0-1.64l8.88-8.586c.467-.452 1.212-.452 1.678 0l2.69 2.606c.466.451.466 1.188 0 1.64l-4.37 4.226 4.37 4.226c.466.452.466 1.188 0 1.64zM11.238 6.776L9.626 5.176c-.452-.44-1.184-.44-1.637 0L2.348 10.66c-.452.44-.452 1.155 0 1.595l8.89 8.625c.452.44 1.185.44 1.637 0l1.611-1.6c.453-.44.453-1.155 0-1.596L6.541 11.458l4.697-4.57c.452-.44.452-1.155 0-1.596z" />
  </svg>
);

const PythonIcon = () => (
  <svg className="loader-icon-svg" viewBox="0 0 24 24">
    <path d="M11.954 0C5.365 0 5.684 5.713 5.684 5.713l.033 1.953h5.922v.831H3.619S0 8.016 0 14.545c0 6.531 3.167 6.273 3.167 6.273h1.888v-2.646s-.063-3.15 3.093-3.15h5.98s3.03 0 3.03-2.992V6.155S17.65 0 11.954 0zm-2.99 1.76a.94.94 0 110 1.882.94.94 0 010-1.882zm8.99 7.695v2.645s.063 3.15-3.092 3.15H8.88s-3.03 0-3.03 2.993v5.897s-.492 6.155 5.204 6.155c5.685 0 5.366-5.713 5.366-5.713l-.033-1.954H9.505v-.831h8.02s3.619.48 3.619-6.049c0-6.53-3.167-6.272-3.167-6.272H16.08a1.32 1.32 0 011.874 1.134zM15.02 20.358a.94.94 0 110 1.88.94.94 0 010-1.88z" />
  </svg>
);

// --- 3D PARTICLE & SHOCKWAVE EXPLOSION ---

const ShockwaveShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uProgress;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      float dist = distance(vUv, vec2(0.5));
      float ringRadius = uProgress * 0.5;
      float ringThickness = 0.08;
      float ring = smoothstep(ringRadius - ringThickness, ringRadius, dist) - smoothstep(ringRadius, ringRadius + ringThickness, dist);
      float opacity = ring * (1.0 - uProgress * 0.4);
      gl_FragColor = vec4(uColor * 2.5, opacity);
    }
  `
};

function ExplosionEffect({ progress, active, origin }) {
  const pointsRef = useRef();
  const streaksRef = useRef();
  const shockwaveRef = useRef();
  const shockwaveRef2 = useRef();
  const glowRef = useRef();

  const { particlePositions, velocities, colors, streakPositions, streakColors } = useMemo(() => {
    const particleCount = 6000;
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const streakCount = 400;
    const sPos = new Float32Array(streakCount * 6);
    const sCol = new Float32Array(streakCount * 6);

    const colorPalette = [
      new THREE.Color('#00f2fe'), // Cyan
      new THREE.Color('#3b82f6'), // Blue
      new THREE.Color('#a855f7'), // Purple
      new THREE.Color('#ec4899'), // Pink
      new THREE.Color('#ff00aa'), // Bright Magenta
      new THREE.Color('#6366f1')  // Indigo
    ];

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI;
      const speed = 14.0 + Math.random() * 26.0;

      vel[i * 3] = Math.cos(angle) * Math.cos(pitch) * speed;
      vel[i * 3 + 1] = Math.sin(angle) * Math.cos(pitch) * speed;
      vel[i * 3 + 2] = Math.sin(pitch) * speed;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    for (let i = 0; i < streakCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI * 0.5;
      const speed = 20.0 + Math.random() * 32.0;
      const c = colorPalette[i % colorPalette.length];

      sPos[i * 6] = 0;
      sPos[i * 6 + 1] = 0;
      sPos[i * 6 + 2] = 0;
      sCol[i * 6] = c.r;
      sCol[i * 6 + 1] = c.g;
      sCol[i * 6 + 2] = c.b;

      sPos[i * 6 + 3] = Math.cos(angle) * Math.cos(pitch) * speed;
      sPos[i * 6 + 4] = Math.sin(angle) * Math.cos(pitch) * speed;
      sPos[i * 6 + 5] = Math.sin(pitch) * speed;
      sCol[i * 6 + 3] = c.r * 1.6;
      sCol[i * 6 + 4] = c.g * 1.6;
      sCol[i * 6 + 5] = c.b * 1.6;
    }

    return { particlePositions: pos, velocities: vel, colors: col, streakPositions: sPos, streakColors: sCol };
  }, []);

  useFrame(() => {
    if (!active) return;
    const t = progress.current;
    const ox = origin.x;
    const oy = origin.y;
    const oz = origin.z;

    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < 6000; i++) {
        posAttr.array[i * 3] = ox + velocities[i * 3] * t * 1.5;
        posAttr.array[i * 3 + 1] = oy + velocities[i * 3 + 1] * t * 1.5;
        posAttr.array[i * 3 + 2] = oz + velocities[i * 3 + 2] * t * 0.8;
      }
      posAttr.needsUpdate = true;
    }

    if (streaksRef.current) {
      const sAttr = streaksRef.current.geometry.attributes.position;
      for (let i = 0; i < 400; i++) {
        const vx = streakPositions[i * 6 + 3];
        const vy = streakPositions[i * 6 + 4];
        const vz = streakPositions[i * 6 + 5];

        sAttr.array[i * 6] = ox + vx * Math.max(0, t - 0.15);
        sAttr.array[i * 6 + 1] = oy + vy * Math.max(0, t - 0.15);
        sAttr.array[i * 6 + 2] = oz + vz * Math.max(0, t - 0.15);

        sAttr.array[i * 6 + 3] = ox + vx * t * 1.4;
        sAttr.array[i * 6 + 4] = oy + vy * t * 1.4;
        sAttr.array[i * 6 + 5] = oz + vz * t * 1.4;
      }
      sAttr.needsUpdate = true;
    }

    if (shockwaveRef.current) {
      const scale = t * 45.0;
      shockwaveRef.current.scale.set(scale, scale, 1);
      shockwaveRef.current.position.set(ox, oy, oz + 0.1);
      if (shockwaveRef.current.material.uniforms) {
        shockwaveRef.current.material.uniforms.uProgress.value = t;
      }
    }

    if (shockwaveRef2.current) {
      const scale = Math.max(0, (t - 0.1) * 55.0);
      shockwaveRef2.current.scale.set(scale, scale, 1);
      shockwaveRef2.current.position.set(ox, oy, oz + 0.2);
      if (shockwaveRef2.current.material.uniforms) {
        shockwaveRef2.current.material.uniforms.uProgress.value = Math.max(0, t - 0.1);
      }
    }

    if (glowRef.current) {
      const glowScale = t * 40.0;
      glowRef.current.scale.set(glowScale, glowScale, 1);
      glowRef.current.position.set(ox, oy, oz + 0.3);
      glowRef.current.material.opacity = Math.sin(t * Math.PI) * 0.95;
    }
  });

  if (!active) return null;

  return (
    <group>
      <mesh ref={shockwaveRef}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={ShockwaveShader.vertexShader}
          fragmentShader={ShockwaveShader.fragmentShader}
          uniforms={{
            uProgress: { value: 0 },
            uColor: { value: new THREE.Color('#00f2fe') }
          }}
        />
      </mesh>

      <mesh ref={shockwaveRef2}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={ShockwaveShader.vertexShader}
          fragmentShader={ShockwaveShader.fragmentShader}
          uniforms={{
            uProgress: { value: 0 },
            uColor: { value: new THREE.Color('#ec4899') }
          }}
        />
      </mesh>

      <mesh ref={glowRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#a855f7"
          opacity={0}
        />
      </mesh>

      <lineSegments ref={streaksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[streakPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[streakColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          opacity={Math.max(0, 1.0 - progress.current * 0.5)}
        />
      </lineSegments>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.45}
          vertexColors
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          opacity={Math.max(0, 1.0 - progress.current * 0.4)}
        />
      </points>
    </group>
  );
}

// --- CAMERACONTROLLER ---

function CameraController({ loadingState }) {
  const prevStateRef = useRef(loadingState);

  useFrame((state) => {
    const { camera, clock, size } = state;
    const time = clock.getElapsedTime();
    const aspect = size.height > 0 ? size.width / size.height : 1.5;

    // Calculate dynamic camera Z target to compensate for mobile portrait frustum compression
    const targetZ = size.width <= 480 || aspect < 0.65 
      ? 19.5 
      : size.width <= 768 || aspect < 0.85 
        ? 14.5 
        : 10.5;

    if (loadingState !== 'active') {
      const speed = 0.06;
      const angle = time * speed;
      const radius = size.width <= 480 || aspect < 0.65 ? 18.5 : 11.5;
      camera.position.x = Math.sin(angle) * radius;
      camera.position.y = Math.cos(time * 0.12) * 1.2;
      camera.position.z = Math.cos(angle) * radius;
      camera.lookAt(0, 0, 0);
    } else {
      if (prevStateRef.current !== 'active') {
        camera.position.set(0, 0, targetZ + 2.0);
        camera.lookAt(0, 0, 0);
        prevStateRef.current = 'active';
      }

      const idleTime = time;
      camera.position.x += (Math.sin(idleTime * 0.4) * 0.25 - camera.position.x) * 0.08;
      camera.position.y += (Math.cos(idleTime * 0.3) * 0.15 - camera.position.y) * 0.08;
      camera.position.z += (targetZ - camera.position.z) * 0.08;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

// --- 2-CARD 3D LAYERED EXPERIENCE HERO CAROUSEL (EXACT HERO CARD SIZE) ---

const EXPERIENCE_CARDS = [
  {
    id: 'exp-1',
    company: 'VCodez',
    role: 'Machine Learning Intern',
    period: '06.08.2024 – 06.09.2024',
    desc: 'Built a hybrid E-commerce Recommendation System using Python, Scikit-learn, Collaborative Filtering, and Content-Based Filtering, achieving 88% accuracy while processing 50K+ products with <500ms response latency.',
    descJsx: (
      <>
        Built a hybrid <span className="exp-highlight">E-commerce Recommendation System</span> using <span className="exp-highlight">Python</span>, <span className="exp-highlight">Scikit-learn</span>, <span className="exp-highlight">Collaborative Filtering</span>, and <span className="exp-highlight">Content-Based Filtering</span>, achieving <span className="exp-highlight">88% accuracy</span> while processing <span className="exp-highlight">50K+ products</span> with <span className="exp-highlight">&lt;500ms</span> response latency.
      </>
    ),
    skills: 'Python • Scikit-learn • Collaborative Filtering • Content-Based Filtering',
    color: '#00f2fe',
    glow: 'rgba(0, 242, 254, 0.45)'
  },
  {
    id: 'exp-2',
    company: 'Digitalytic Technologies',
    role: 'Data Science Intern',
    period: '06.08.2024 – 06.09.2024',
    desc: 'Performed EDA on 100K+ records using Python, Pandas, SQL; developed Customer Churn and Loan Default Prediction models with Scikit-learn; built Power BI dashboards, reducing reporting time by 60%.',
    descJsx: (
      <>
        Performed <span className="exp-highlight">EDA</span> on <span className="exp-highlight">100K+ records</span> using <span className="exp-highlight">Python</span>, <span className="exp-highlight">Pandas</span>, <span className="exp-highlight">SQL</span>; developed <span className="exp-highlight">Customer Churn</span> and <span className="exp-highlight">Loan Default Prediction</span> models with <span className="exp-highlight">Scikit-learn</span>; built <span className="exp-highlight">Power BI dashboards</span>, reducing reporting time by <span className="exp-highlight">60%</span>.
      </>
    ),
    skills: 'Python • Pandas • SQL • Scikit-learn • Power BI',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.45)'
  }
];

function Experience3DCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(null);
  const lastWheelTimeRef = useRef(0);

  const toggleCard = (e) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? 1 : 0));
  };

  const handlePointerDown = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    startXRef.current = clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handlePointerMove = (e) => {
    if (startXRef.current === null) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const diff = clientX - startXRef.current;
    setDragOffset(diff);
  };

  const handlePointerUp = (e) => {
    if (startXRef.current === null) return;
    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
    const diff = clientX - startXRef.current;
    if (diff < -35) {
      setActiveIndex(1);
    } else if (diff > 35) {
      setActiveIndex(0);
    }
    startXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleWheel = (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 450) return;

    if (e.deltaY > 15 || e.deltaX > 15) {
      lastWheelTimeRef.current = now;
      setActiveIndex(1);
    } else if (e.deltaY < -15 || e.deltaX < -15) {
      lastWheelTimeRef.current = now;
      setActiveIndex(0);
    }
  };

  // Base rotation angle (-90deg per index) plus interactive drag rotation
  const baseAngle = activeIndex * -90;
  const dragAngle = isDragging ? (dragOffset / 400) * 90 : 0;
  const currentRotation = baseAngle + dragAngle;

  return (
    <div 
      className="exp-hero-carousel-container exp-dice-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      onWheel={handleWheel}
    >
      <div 
        className="exp-cards-track exp-dice-track"
        style={{
          transform: `translateZ(-200px) rotateY(${currentRotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.65s cubic-bezier(0.2, 0.9, 0.3, 1.05)'
        }}
      >
        {EXPERIENCE_CARDS.map((card, i) => {
          const isCurrent = i === activeIndex;

          return (
            <div
              key={card.id}
              className={`experience-card card-3d exp-dice-face exp-face-${i} ${isCurrent ? 'exp-face-active' : 'exp-face-inactive'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isCurrent) toggleCard();
              }}
              style={{
                '--card-glow': card.glow,
                '--card-color': card.color
              }}
            >
              {/* Specular Shimmer Sweep & Neon Border */}
              <div className="exp-card-specular-shine"></div>
              <div className="exp-card-neon-border"></div>

              <h2 className="exp-role-title">
                <span className="exp-company-part">{card.company}</span>
                <span className="exp-title-sep"> | </span>
                <span className="exp-role-part">{card.role}</span>
              </h2>

              <div className="exp-period-pill">{card.period}</div>

              <p className="exp-description-text">{card.descJsx || card.desc}</p>

              <div className="exp-skills-block">
                <div className="exp-skills-label">Skills:</div>
                <div className="exp-skills-list">
                  {card.skills.split(' • ').map((s, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span className="exp-skill-text">{s}</span>
                      {idx < arr.length - 1 && <span className="exp-skill-bullet"> • </span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Tap to switch hint for active card */}
              <div className="exp-card-footer-controls">
                <div className="exp-dots-indicator">
                  <span 
                    className={`exp-dot ${activeIndex === 0 ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(0); }}
                  />
                  <span 
                    className={`exp-dot ${activeIndex === 1 ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(1); }}
                  />
                </div>
                <span className="exp-tap-hint" onClick={toggleCard}>
                  <span className="exp-hint-text">{isCurrent ? 'Swipe or Tap to Roll Dice' : 'Tap to View'}</span>
                  <span className="exp-hint-icon">🎲</span>
                </span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- KIRA AI ASSISTANT CARD (CARD 5 HERO UI SYSTEM) ---
const KIRA_LANGUAGES = [
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' }, // ALWAYS FIRST!
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' }
];

const INITIAL_KIRA_WELCOME = [
  { 
    sender: 'kira', 
    text: "Hi! How can I help you today?", 
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
  }
];

const KIRA_API_BASE = import.meta.env.VITE_KIRA_API_URL || (
  typeof window !== 'undefined' 
    ? `http://${window.location.hostname}:5000` 
    : 'http://localhost:5000'
);

function KiraAssistantCard() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedLang, setSelectedLang] = useState(KIRA_LANGUAGES[0]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [orbState, setOrbState] = useState('idle');
  // Pure ephemeral in-memory state: zero persistence across page reload or visitor sessions
  const [messages, setMessages] = useState(INITIAL_KIRA_WELCOME);
  const chatHistoryRef = useRef(null);

  const [isVoiceLoopActive, setIsVoiceLoopActive] = useState(false);
  const voiceLoopRef = useRef(false);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    voiceLoopRef.current = isVoiceLoopActive;
  }, [isVoiceLoopActive]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, orbState]);

  // Clean up audio & mic streams on unmount
  useEffect(() => {
    return () => {
      stopVoiceLoop();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSTTLang = (code) => {
    switch (code) {
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ml': return 'ml-IN';
      case 'kn': return 'kn-IN';
      case 'fr': return 'fr-FR';
      case 'de': return 'de-DE';
      case 'es': return 'es-ES';
      case 'ja': return 'ja-JP';
      case 'zh': return 'zh-CN';
      case 'ar': return 'ar-SA';
      case 'ru': return 'ru-RU';
      default: return 'en-US';
    }
  };

  const stopVoiceLoop = () => {
    setIsVoiceLoopActive(false);
    voiceLoopRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setOrbState('idle');
  };

  const isStopCommand = (text) => {
    if (!text) return false;
    const clean = text.toLowerCase().trim().replace(/[?!.,;:]/g, '');
    return /^(bye|bye kira|goodbye|goodbye kira|stop|exit|bye bye|see you later|stop listening|shut down|poi varen|poitu varen)$/i.test(clean) ||
           clean.includes('bye kira') || clean.includes('goodbye kira') || clean === 'bye' || clean === 'goodbye';
  };

  const isWakeCommand = (text) => {
    if (!text) return false;
    const clean = text.toLowerCase().trim().replace(/[?!.,;:]/g, '');
    return /^(hi kira|hey kira|hello kira|call kira|wake up kira|wake up|kira|kera)$/i.test(clean) ||
           clean.includes('hi kira') || clean.includes('hey kira') || clean.includes('hello kira') || clean.includes('wake up kira');
  };

  const triggerWakeGreeting = () => {
    if (isSpeakingRef.current) return;
    const greeting = "Hi! How can I help you today?";
    setIsVoiceLoopActive(true);
    voiceLoopRef.current = true;
    setMessages((prev) => [...prev, { sender: 'kira', text: greeting, time: getCurrentTime() }]);
    speakResponse(greeting, true);
  };

  const speakResponse = (text, keepListeningAfter = true) => {
    isSpeakingRef.current = true;
    setOrbState('speaking');

    // Pause recognition while KIRA is speaking to prevent self-looping
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    // Attempt backend TTS synthesis first
    fetch(`${KIRA_API_BASE}/api/kira/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: selectedLang.name })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.audio) {
        const audio = new Audio(data.audio);
        audio.onended = () => {
          isSpeakingRef.current = false;
          onSpeechFinished(keepListeningAfter);
        };
        audio.onerror = () => {
          isSpeakingRef.current = false;
          playSpeechSynthFallback(text, keepListeningAfter);
        };
        audio.play().catch(() => playSpeechSynthFallback(text, keepListeningAfter));
      } else {
        playSpeechSynthFallback(text, keepListeningAfter);
      }
    })
    .catch(() => {
      playSpeechSynthFallback(text, keepListeningAfter);
    });
  };

  const playSpeechSynthFallback = (text, keepListeningAfter = true) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = getSTTLang(selectedLang.code);
      utterance.lang = targetLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchedVoice = voices.find(v => v.lang.startsWith(selectedLang.code) || v.lang.replace('_', '-').startsWith(targetLang));
        if (matchedVoice) utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        isSpeakingRef.current = false;
        onSpeechFinished(keepListeningAfter);
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        onSpeechFinished(keepListeningAfter);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        isSpeakingRef.current = false;
        onSpeechFinished(keepListeningAfter);
      }, 3500);
    }
  };

  const onSpeechFinished = (keepListeningAfter) => {
    setIsProcessing(false);
    if (keepListeningAfter && voiceLoopRef.current) {
      setOrbState('listening');
      startRecognition();
    } else {
      setOrbState('idle');
      setIsListening(false);
    }
  };

  const handleStopConversation = () => {
    const goodbyeReply = selectedLang.code === 'ta' ? "போய் வருகிறேன்! உங்களுக்கு உதவி செய்ய நான் எப்போதும் தயாராக இருப்பேன்." : "Goodbye! Have a wonderful day ahead!";
    setMessages((prev) => [...prev, { sender: 'kira', text: goodbyeReply, time: getCurrentTime() }]);
    stopVoiceLoop();
    speakResponse(goodbyeReply, false);
  };

  const sendPromptToBackend = async (promptMsg) => {
    const query = (promptMsg || inputText).trim();
    if (!query || isProcessing) return;

    // Check for STOP commands: "Bye", "Bye KIRA", "Goodbye KIRA"
    if (isStopCommand(query)) {
      setMessages((prev) => [...prev, { sender: 'user', text: query, time: getCurrentTime() }]);
      handleStopConversation();
      return;
    }

    // Check for "HI KIRA" wake word inside speech
    if (isWakeCommand(query)) {
      setMessages((prev) => [...prev, { sender: 'user', text: query, time: getCurrentTime() }]);
      triggerWakeGreeting();
      return;
    }

    setIsProcessing(true);
    setInputText('');
    setMessages((prev) => [...prev, { sender: 'user', text: query, time: getCurrentTime() }]);
    setOrbState('thinking');

    try {
      const response = await fetch(`${KIRA_API_BASE}/api/kira/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, language: selectedLang.name })
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const replyText = data.reply || data.response || "I'm KIRA. How can I assist you today?";

      setMessages((prev) => [...prev, { sender: 'kira', text: replyText, time: getCurrentTime() }]);
      speakResponse(replyText, voiceLoopRef.current);
    } catch (err) {
      console.warn('KIRA backend error, falling back to local synthesis:', err);
      const fallbackReply = selectedLang.code === 'ta' ? "நான் KIRA, உங்களுக்கு உதவ எப்போதும் தயாராக இருக்கிறேன்." : "I am KIRA, your intelligent assistant. How can I help you?";
      setMessages((prev) => [...prev, { sender: 'kira', text: fallbackReply, time: getCurrentTime() }]);
      speakResponse(fallbackReply, voiceLoopRef.current);
    }
  };

  const startRecognition = () => {
    if (isSpeakingRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = getSTTLang(selectedLang.code);
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setOrbState('listening');
      };

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0].transcript.trim();

          // Instant Wake Detection on interim results
          if (isWakeCommand(transcript)) {
            try { recognition.abort(); } catch (_) {}
            setIsListening(false);
            setMessages((prev) => [...prev, { sender: 'user', text: transcript, time: getCurrentTime() }]);
            triggerWakeGreeting();
            return;
          }

          // Instant Stop Detection on interim results
          if (isStopCommand(transcript)) {
            try { recognition.abort(); } catch (_) {}
            setIsListening(false);
            setMessages((prev) => [...prev, { sender: 'user', text: transcript, time: getCurrentTime() }]);
            handleStopConversation();
            return;
          }

          // Process final speech query
          if (res.isFinal && transcript) {
            setInputText(transcript);
            sendPromptToBackend(transcript);
          }
        }
      };

      recognition.onerror = (err) => {
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('SpeechRecognition error:', err.error);
        }
        setIsListening(false);
        if (voiceLoopRef.current && err.error !== 'aborted' && !isSpeakingRef.current) {
          setTimeout(() => {
            if (voiceLoopRef.current && !isSpeakingRef.current) startRecognition();
          }, 800);
        } else {
          setOrbState('idle');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (voiceLoopRef.current && !isSpeakingRef.current && !isProcessing) {
          setTimeout(() => {
            if (voiceLoopRef.current && !isSpeakingRef.current) startRecognition();
          }, 400);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Recognition start exception:', err);
      setIsListening(false);
      setOrbState('idle');
    }
  };

  // 👏 Acoustic Clap Detection Engine via Web Audio AnalyserNode
  const initClapDetector = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      if (audioContextRef.current && audioContextRef.current.state === 'running') return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.2;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let lastClapTime = 0;
      let ambientNoise = 20;

      const detectClap = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        analyser.getByteFrequencyData(dataArray);

        // High-frequency energy analysis (1.5 kHz to 8 kHz for handclap signature)
        let highFreqSum = 0;
        let count = 0;
        for (let i = Math.floor(bufferLength * 0.25); i < bufferLength; i++) {
          highFreqSum += dataArray[i];
          count++;
        }
        const highFreqAvg = count > 0 ? highFreqSum / count : 0;
        ambientNoise = ambientNoise * 0.95 + highFreqAvg * 0.05;

        // Sharp acoustic spike characteristic of a handclap
        const now = Date.now();
        if ((highFreqAvg > 45 && highFreqAvg > ambientNoise * 2.2) && now - lastClapTime > 1600) {
          lastClapTime = now;
          if (!isSpeakingRef.current && !isProcessing) {
            console.log('👏 Handclap detected! Waking KIRA...');
            triggerWakeGreeting();
          }
        }

        requestAnimationFrame(detectClap);
      };

      detectClap();
    } catch (err) {
      console.warn('Clap detection initialization note:', err.message);
    }
  };

  const toggleMic = (e) => {
    if (e) e.stopPropagation();
    if (isProcessing) return;

    if (isListening || isVoiceLoopActive) {
      stopVoiceLoop();
    } else {
      setIsVoiceLoopActive(true);
      voiceLoopRef.current = true;
      startRecognition();
      if (!audioContextRef.current) {
        initClapDetector();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && inputText.trim()) {
      e.stopPropagation();
      e.preventDefault();
      sendPromptToBackend();
    }
  };

  return (
    <div className="voice-card card-3d kira-assistant-card">
      <div className="kira-header">
        <h2 className="kira-title">KIRA AI ASSISTANT</h2>
        <div className="kira-gold-divider">
          <span className="kira-divider-line" />
          <span className="kira-divider-sparkle">✦</span>
          <span className="kira-divider-line" />
        </div>
      </div>

      <div
        className={`kira-robot-avatar-container ${orbState === 'thinking' ? 'thinking-active' : orbState === 'speaking' || isListening ? 'listening-active' : orbState === 'error' ? 'error-active' : ''}`}
        onClick={toggleMic}
        title="Click to activate voice conversation, or clap 👏 / say 'Hi KIRA' to wake"
        style={{ cursor: 'pointer' }}
      >
        <div className="kira-robot-aura-ring" />
        <div className="kira-robot-metal-rim">
          <div className="kira-robot-ear left-ear" />
          <div className="kira-robot-ear right-ear" />
          <div className="kira-robot-face">
            <div className="kira-robot-gloss" />
            <div className="kira-robot-eye left-eye" />
            <div className="kira-robot-eye right-eye" />
          </div>
        </div>

        <div className="kira-audio-waves">
          <span className="kira-wave-bar" style={{ animationDelay: '0s' }} />
          <span className="kira-wave-bar" style={{ animationDelay: '0.15s' }} />
          <span className="kira-wave-bar" style={{ animationDelay: '0.3s' }} />
          <span className="kira-wave-bar" style={{ animationDelay: '0.45s' }} />
          <span className="kira-wave-bar" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>

      <div className="kira-chat-viewport">
        <div className="kira-chat-history" ref={chatHistoryRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`kira-chat-row ${msg.sender === 'user' ? 'user-row' : 'kira-row'}`}>
              {msg.sender === 'kira' && (
                <div className="kira-msg-avatar">
                  <span className="kira-avatar-sparkle">✦</span>
                </div>
              )}
              <div className={`kira-msg-bubble ${msg.sender === 'user' ? 'user-msg' : 'kira-msg'}`}>
                <div className="kira-msg-text">{msg.text}</div>
                <div className="kira-msg-meta">
                  <span className="kira-msg-time">{msg.time}</span>
                  {msg.sender === 'user' && <span className="kira-msg-ticks">✓✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kira-input-bar-pill">
        <div className="kira-lang-container">
          <button
            type="button"
            className="kira-lang-pill-btn"
            onClick={(e) => { e.stopPropagation(); setShowLangDropdown((prev) => !prev); }}
          >
            <svg className="kira-globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="kira-lang-name">{selectedLang.native}</span>
            <svg className="kira-chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showLangDropdown && (
            <div className="kira-lang-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="lang-dropdown-header">Select Language</div>
              <div className="lang-option-list">
                {KIRA_LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    className={`lang-option-item ${selectedLang.code === lang.code ? 'selected' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedLang(lang); setShowLangDropdown(false); }}
                  >
                    <span className="lang-name">{lang.name}</span>
                    <span className="lang-native">{lang.native}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          type="text"
          className="kira-pill-input"
          placeholder={`Ask KIRA in ${selectedLang.name}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="kira-pill-actions">
          <button
            type="button"
            className="kira-pill-btn kira-pill-send"
            onClick={(e) => { if (e) e.stopPropagation(); sendPromptToBackend(); }}
            disabled={isProcessing}
            title="Send Prompt"
          >
            <svg className="kira-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>

          <button
            type="button"
            className={`kira-pill-btn kira-pill-mic ${isListening ? 'listening' : ''}`}
            onClick={toggleMic}
            disabled={isProcessing}
            title={isListening ? 'Stop Mic' : 'Start Mic'}
          >
            <svg className="kira-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- CONTACT HERO CARD (CARD 6 HERO UI WITH REAL GMAIL SUBMISSION) ---
function ContactHeroCard() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [attachment, setAttachment] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', text: 'Attachment exceeds 5MB limit.' });
        return;
      }
      setAttachment(file);
      setStatus(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (e) e.stopPropagation();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', text: 'Please fill in Name, Email and Message.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('subject', formData.subject || 'Portfolio Contact Inquiry');
      data.append('message', formData.message);
      data.append('to_email', 'arikaranr2410@gmail.com');
      if (attachment) {
        data.append('attachment', attachment);
      }

      const response = await fetch('https://formspree.io/f/mvoeeovv', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStatus({ type: 'success', text: '✅ Message Sent Successfully to arikaranr2410@gmail.com!' });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setAttachment(null);
      } else {
        window.open(`mailto:arikaranr2410@gmail.com?subject=${encodeURIComponent(formData.subject || 'Portfolio Inquiry')}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`);
        setStatus({ type: 'success', text: '✅ Message Dispatch Prepared for arikaranr2410@gmail.com!' });
      }
    } catch (err) {
      window.open(`mailto:arikaranr2410@gmail.com?subject=${encodeURIComponent(formData.subject || 'Portfolio Inquiry')}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`);
      setStatus({ type: 'success', text: '✅ Message Dispatch Prepared for arikaranr2410@gmail.com!' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="contact-card card-3d contact-hero-card">
      {/* Specular Border Light Sweep & Neon Circuit Frame */}
      <div className="contact-neon-circuit-frame" />
      
      {/* Top Header matching reference */}
      <div className="contact-card-header">
        <h2 className="contact-title">CONTACT</h2>
        <div className="contact-title-divider">
          <span className="divider-line" />
          <span className="divider-diamond">✦ ◆ ✦</span>
          <span className="divider-line" />
        </div>
      </div>

      {/* Inner Rounded Form Container matching reference image structure */}
      <div className="contact-inner-container">
        {/* Main 2-Column Content Layout matching reference */}
        <div className="contact-card-body">
          
          {/* Left Column: GET IN TOUCH */}
          <div className="contact-left-col">
            <h3 className="contact-section-heading">GET IN TOUCH</h3>

            <div className="contact-item-row">
              <div className="contact-icon-circle cyan-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="contact-item-info">
                <span className="contact-item-label">Email</span>
                <a href="mailto:arikaranr2410@gmail.com" className="contact-item-val" onClick={(e) => e.stopPropagation()}>
                  arikaranr2410@gmail.com
                </a>
              </div>
            </div>

            <div className="contact-item-row">
              <div className="contact-icon-circle blue-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="contact-item-info">
                <span className="contact-item-label">Phone</span>
                <a href="tel:+918056543658" className="contact-item-val" onClick={(e) => e.stopPropagation()}>
                  +91 8056543658
                </a>
              </div>
            </div>

            <div className="contact-item-row">
              <div className="contact-icon-circle cyan-location-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="contact-item-info">
                <span className="contact-item-label">Location</span>
                <span className="contact-item-val">Tamil Nadu, India</span>
              </div>
            </div>

            {/* Embedded Social Media Quick Links */}
            <div className="contact-card-social-row">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="contact-social-mini-btn github" title="GitHub" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-social-mini-btn linkedin" title="LinkedIn" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="contact-social-mini-btn twitter" title="X / Twitter" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="contact-social-mini-btn instagram" title="Instagram" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
            </div>

            {/* 3D Colorful Holographic Earth Animation Graphic (Contact Card Background Only) */}
            <div className="contact-3d-earth-container">
              <div className="earth-3d-sphere-viewport">
                <div className="earth-3d-sphere-core">
                  <div className="earth-ring equator-ring" />
                  <div className="earth-ring meridian-ring" />
                  <div className="earth-ring tropic-ring-1" />
                  <div className="earth-ring tropic-ring-2" />
                  <div className="earth-ring polar-ring" />
                  <div className="earth-axis-beam" />
                  <div className="earth-satellite-dot dot-1" />
                  <div className="earth-satellite-dot dot-2" />
                  <div className="earth-satellite-dot dot-3" />
                  <div className="earth-glow-atmosphere" />
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="contact-vertical-divider" />

          {/* Right Column: Form Inputs */}
          <form className="contact-right-col" onSubmit={handleSend}>
            {/* Input 1: Your Name */}
            <div className="contact-field-group">
              <span className="field-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                className="contact-field-input"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                required
              />
            </div>

            {/* Input 2: Your Email */}
            <div className="contact-field-group">
              <span className="field-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="email"
                className="contact-field-input"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                required
              />
            </div>

            {/* Input 3: Subject */}
            <div className="contact-field-group">
              <span className="field-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </span>
              <input
                type="text"
                className="contact-field-input"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Input 4: Your Message */}
            <div className="contact-field-group textarea-group">
              <span className="field-icon icon-top">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <textarea
                className="contact-field-input contact-textarea-input"
                placeholder="Your Message"
                rows="2"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                required
              />
            </div>

            {/* Attachment Box with Clickable Paperclip Icon Button */}
            <div className="contact-attachment-box">
              <span className="attachment-left-info">
                <span className="attach-text">
                  {attachment ? attachment.name : 'Attachment (PDF, DOC, DOCX, etc.)'}
                </span>
              </span>
              <div className="attachment-right-actions">
                {attachment && (
                  <button
                    type="button"
                    className="remove-attach-btn"
                    title="Remove Attachment"
                    onClick={(e) => { e.stopPropagation(); setAttachment(null); }}
                  >
                    ✕
                  </button>
                )}
                <label
                  className="contact-attach-icon-btn"
                  title="Attach File (PDF, DOC, DOCX, etc.)"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {/* Status Feedback Banner */}
            {status && (
              <div className={`contact-status-banner ${status.type}`}>
                {status.text}
              </div>
            )}

            {/* Send Message Button matching reference */}
            <button
              type="submit"
              className={`contact-submit-btn-ref ${isSending ? 'sending' : ''}`}
              disabled={isSending}
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="send-paper-plane-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>{isSending ? 'SENDING...' : 'SEND MESSAGE'}</span>
            </button>

            {/* Bottom Security Note */}
            <div className="contact-security-note">
              <span className="lock-icon">🔒</span>
              <span>Your message is secure and private</span>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

// --- HERO CARD SOCIAL MEDIA ROW COMPONENT ---
function HeroSocialMediaRow() {
  const socialLinks = [
    {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      )
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    },
    {
      id: 'twitter',
      name: 'X / Twitter',
      url: 'https://x.com',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://instagram.com',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    }
  ];

  return (
    <div className="hero-social-footer-row">
      <div className="social-links-bar">
        {socialLinks.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`social-icon-btn ${item.id}-btn`}
            title={item.name}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="social-icon-glow" />
            <div className="social-icon-svg-wrapper">{item.icon}</div>
          </a>
        ))}
      </div>
    </div>
  );
}


// --- HERO PAGE END COPYRIGHT FOOTER WITH COLORFUL REFLECTION EFFECT ---
function HeroCopyrightFooter({ isVisible }) {
  return (
    <div className={`hero-copyright-footer ${isVisible ? 'visible' : ''}`}>
      <div className="mobile-footer-social-row">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="contact-social-mini-btn github" title="GitHub" onClick={(e) => e.stopPropagation()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-social-mini-btn linkedin" title="LinkedIn" onClick={(e) => e.stopPropagation()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
        </a>
        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="contact-social-mini-btn twitter" title="X / Twitter" onClick={(e) => e.stopPropagation()}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="contact-social-mini-btn instagram" title="Instagram" onClick={(e) => e.stopPropagation()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
        </a>
      </div>
      <div className="copyright-reflection-wrapper">
        <span className="copyright-colorful-text">
          © 2026 ARIKARAN R. ALL RIGHTS RESERVED.
        </span>
      </div>
    </div>
  );
}

// --- HELICALWORLD ---

function HelicalWorld({ scrollState, loadingState, onWarpTrigger, onProjectsWarpTrigger, onSkillsWarpTrigger, helixPositions, helixColors, spacePositions, spaceColors, particleTexture }) {
  const worldGroupRef = useRef();
  const pointsRef = useRef();
  const linesRef = useRef();

  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const distanceFactor = 6.2;

  useFrame((state, delta) => {
    if (worldGroupRef.current && loadingState === 'active') {
      const lambda = isMobileMedia ? 12 : 9;
      worldGroupRef.current.position.y = THREE.MathUtils.damp(worldGroupRef.current.position.y, scrollState.current.y, lambda, delta);
      worldGroupRef.current.rotation.y = THREE.MathUtils.damp(worldGroupRef.current.rotation.y, scrollState.current.rotationOffset, lambda, delta);
    }
  });

  const linePositions = useMemo(() => {
    const linePos = [];
    const pos = helixPositions;
    for (let i = 0; i < 1998; i++) {
      linePos.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      linePos.push(pos[(i + 2) * 3], pos[(i + 2) * 3 + 1], pos[(i + 2) * 3 + 2]);

      if (i % 10 === 0 && i + 12 < 2000) {
        const oppositeIndex = i + 1;
        linePos.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
        linePos.push(pos[oppositeIndex * 3], pos[oppositeIndex * 3 + 1], pos[oppositeIndex * 3 + 2]);
      }
    }
    return new Float32Array(linePos);
  }, [helixPositions]);

  const cardsRadius = 4.2;

  // Exact section structure:
  // Card 1 (id: hero): ABOUT Card
  // Card 2 (id: skills): SECOND Card -> PROJECTS ("🚀 Featured Work", "PROJECTS")
  // Card 3 (id: projects): THIRD Card -> "Warp Tunnel" card with "Explore Skills"
  // Card 4 (id: experience): FOURTH Card -> 4-Card Horizontal 3D Layered Carousel
  const sectionsData = [
    { id: 'hero', y: 18, theta: 0, badge: '✦ immersive 3D', title: 'ABOUT', desc: 'Click below to warp into my full profile experience.', isHero: true },
    { id: 'skills', y: 10, theta: (2 * Math.PI) / 5, badge: '🚀 Featured Work', title: 'PROJECTS', desc: 'Explore my AI, Machine Learning, Data Analytics, and Full Stack projects through an immersive cinematic experience.', isProjects: true },
    { id: 'projects', y: 2, theta: (4 * Math.PI) / 5, badge: '✦ Warp Tunnel', title: 'SKILLS', desc: 'Revolving 3D space transitions. Explore my full Artificial Intelligence, Deep Learning, Machine Learning, and Data Analytics skillset in 3D.', isSkillsWarp: true },
    { id: 'experience', y: -6, theta: (6 * Math.PI) / 5, badge: '⧫ chronology', title: 'EXPERIENCE', isExperienceCarousel: true },
    { id: 'voice', y: -14, theta: (8 * Math.PI) / 5, badge: '◉ KIRA voice', title: 'Pulse Sphere', desc: 'An interactive pulse waveform showing off voice assistant integrations.' },
    { id: 'contact', y: -22, theta: 2 * Math.PI, badge: '✧ connect', title: 'Gravity Vortex', desc: 'Spin into our orbital path. Click to connect via GitHub, LinkedIn, or Email.', isContact: true }
  ];

  return (
    <group ref={worldGroupRef} position={[0, -18, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[spacePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[spaceColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          map={particleTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          vertexColors
          sizeAttenuation
        />
      </points>

      {loadingState === 'active' && (
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[helixPositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[helixColors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.28}
            map={particleTexture}
            blending={THREE.NormalBlending}
            depthWrite={false}
            transparent
            vertexColors
            sizeAttenuation
          />
        </points>
      )}

      {loadingState === 'active' && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color="#c89d6c"
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {loadingState === 'active' && sectionsData.map((sec) => {
        const cx = Math.sin(sec.theta) * cardsRadius;
        const cz = Math.cos(sec.theta) * cardsRadius;

        return (
          <group 
            key={sec.id} 
            position={[cx, sec.y, cz]} 
            rotation={[0, sec.theta, 0]}
          >
            <Html 
              transform 
              center 
              distanceFactor={distanceFactor} 
              pointerEvents="auto"
            >
              {sec.isExperienceCarousel ? (
                <Experience3DCarousel />
              ) : sec.id === 'voice' ? (
                <KiraAssistantCard />
              ) : sec.isContact ? (
                <ContactHeroCard />
              ) : (
                <div className={`${sec.id}-card card-3d`}>
                  <span className="badge">{sec.badge}</span>
                  <h2>{sec.title}</h2>
                  <p>{sec.desc}</p>
                  {sec.isContact && (
                    <div className="links-container">
                      <span className="link-btn">GitHub</span>
                      <span className="link-btn">LinkedIn</span>
                      <span className="link-btn">Email</span>
                    </div>
                  )}
                  {sec.isHero && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onWarpTrigger(e);
                      }}
                      className="hero-click-btn"
                    >
                      Click Here
                    </button>
                  )}
                  {sec.isHero && (
                    <div className="hero-scroll-hint">
                      ⬇ scroll down to twist
                    </div>
                  )}
                  {sec.isProjects && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectsWarpTrigger(e);
                      }}
                      className="hero-click-btn"
                    >
                      Click Here
                    </button>
                  )}
                  {sec.isSkillsWarp && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSkillsWarpTrigger(e);
                      }}
                      className="hero-click-btn explore-skills-btn"
                    >
                      Explore Skills
                    </button>
                  )}
                </div>
              )}
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// --- MAIN PORTFOLIO ROOT ---

export default function App() {
  const [loadingState, setLoadingState] = useState('loading');
  const [progress, setProgress] = useState(0);

  const [currentPage, setCurrentPage] = useState('hero');

  // Saved scroll position for Hero page state restoration
  const savedHeroScrollY = useRef(0);

  const [explosionActive, setExplosionActive] = useState(false);
  const explosionProgress = useRef(0);
  const explosionOrigin = useRef(new THREE.Vector3(0, 0, 0));

  const scrollState = useRef({
    y: -18,
    rotationOffset: 0
  });

  const flashOverlayRef = useRef();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('loading-locked');

    const loaderObj = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setLoadingState('transitioning');
        
        gsap.to('.loader-profile-wrapper', {
          scale: 18,
          duration: 1.3,
          ease: 'power3.in',
          onStart: () => {
            const el = document.querySelector('.loader-profile-wrapper');
            if (el) el.style.animation = 'none';
          }
        });

        gsap.to(flashOverlayRef.current, {
          opacity: 1,
          duration: 1.0,
          delay: 0.4,
          ease: 'power3.in',
          onComplete: () => {
            setLoadingState('active');
            document.body.classList.remove('loading-locked');
            
            gsap.to(flashOverlayRef.current, {
              opacity: 0,
              duration: 1.5,
              ease: 'power2.out'
            });
          }
        });
      }
    });

    tl.to(loaderObj, {
      value: 100,
      duration: 6.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        setProgress(Math.floor(loaderObj.value));
      }
    }, 0);

    tl.to('.loader-profile-wrapper', {
      opacity: 1,
      scale: 1,
      duration: 1.3,
      ease: 'power2.out'
    }, 0);

    tl.to('.loader-title', {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power2.out'
    }, 1.3);

    tl.to('.icon-github', {
      opacity: 1,
      scale: 1,
      rotate: '5deg',
      duration: 0.6,
      ease: 'back.out(1.7)',
      onStart: () => document.querySelector('.icon-github')?.classList.add('active')
    }, 2.6);

    tl.to('.icon-linkedin', {
      opacity: 1,
      scale: 1,
      rotate: '-4deg',
      duration: 0.6,
      ease: 'back.out(1.7)',
      onStart: () => document.querySelector('.icon-linkedin')?.classList.add('active')
    }, 3.1);

    tl.to('.icon-leetcode', {
      opacity: 1,
      scale: 1,
      rotate: '6deg',
      duration: 0.6,
      ease: 'back.out(1.7)',
      onStart: () => document.querySelector('.icon-leetcode')?.classList.add('active')
    }, 3.6);

    tl.to('.icon-python', {
      opacity: 1,
      scale: 1,
      rotate: '-5deg',
      duration: 0.6,
      ease: 'back.out(1.7)',
      onStart: () => document.querySelector('.icon-python')?.classList.add('active')
    }, 4.1);

    tl.to('.loader-icon-box', {
      scale: 1.15,
      duration: 0.4,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    }, 4.8);

    tl.to('.loader-profile-wrapper', {
      borderColor: '#a5b4fc',
      duration: 0.8,
      ease: 'power2.inOut'
    }, 4.8);

    return () => {
      tl.kill();
    };
  }, []);

  const [showSocialFooter, setShowSocialFooter] = useState(false);

  // GSAP ScrollTrigger connection & exact scroll restoration
  useEffect(() => {
    if (loadingState !== 'active' || currentPage !== 'hero') return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const restoreY = savedHeroScrollY.current;

    // Helper to calculate 3D helical position from current scroll Y
    const sync3DHelicalPosition = (yPos) => {
      const contentEl = document.querySelector('.content');
      const maxScroll = contentEl ? contentEl.offsetHeight - window.innerHeight : 0;
      const p = maxScroll > 0 ? yPos / maxScroll : 0;
      if (scrollState.current) {
        scrollState.current.y = -18 + p * 40;
        scrollState.current.rotationOffset = -p * Math.PI * 2;
      }
      setShowSocialFooter(p >= 0.80);
    };

    let scrollTicking = false;
    const handleWindowScroll = () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (maxScroll > 0) {
            const p = window.scrollY / maxScroll;
            setShowSocialFooter(p >= 0.80);
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll();

    // If returning from Projects or About page, immediately set scroll and 3D orientation
    if (restoreY > 0) {
      window.scrollTo(0, restoreY);
      sync3DHelicalPosition(restoreY);
    }

    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;

    const trigger = ScrollTrigger.create({
      trigger: ".content",
      start: "top top",
      end: "bottom bottom",
      scrub: isMobileViewport ? 0.6 : 1.6,
      onUpdate: (self) => {
        const p = self.progress;
        scrollState.current.y = -18 + p * 40;
        scrollState.current.rotationOffset = -p * Math.PI * 2;
        setShowSocialFooter(p >= 0.80);
      }
    });

    if (restoreY > 0) {
      setTimeout(() => {
        window.scrollTo(0, restoreY);
        sync3DHelicalPosition(restoreY);
        trigger.update();
        ScrollTrigger.refresh();
      }, 30);
    }

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      trigger.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [loadingState, currentPage]);

  const playExplosion = (onCompleteCallback, event = null, isLeavingHero = false) => {
    if (explosionActive) return;

    // Save exact scroll position when opening Projects or About from Hero
    if (currentPage === 'hero' || isLeavingHero) {
      savedHeroScrollY.current = window.scrollY;
    }

    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      const screenX = rect.left + rect.width / 2;
      const screenY = rect.top + rect.height / 2;
      const x = (screenX / window.innerWidth) * 2 - 1;
      const y = -(screenY / window.innerHeight) * 2 + 1;

      const vFOV = (45 * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(vFOV / 2) * 10.5;
      const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);

      explosionOrigin.current.set((x * visibleWidth) / 2, (y * visibleHeight) / 2, 0);
    } else {
      explosionOrigin.current.set(0, 0, 0);
    }

    setExplosionActive(true);
    explosionProgress.current = 0.0;

    const expObj = { val: 0.0 };

    gsap.to(expObj, {
      val: 1.0,
      duration: 1.4,
      ease: 'power3.inOut',
      onUpdate: () => {
        explosionProgress.current = expObj.val;
      },
      onComplete: () => {
        onCompleteCallback();

        gsap.to(expObj, {
          val: 0.0,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: () => {
            explosionProgress.current = expObj.val;
          },
          onComplete: () => {
            setExplosionActive(false);
          }
        });
      }
    });
  };

  const { helixPositions, helixColors, spacePositions, spaceColors } = useMemo(() => {
    const helixCount = 2000;
    const spaceCount = 1000;
    
    const hPos = new Float32Array(helixCount * 3);
    const hCol = new Float32Array(helixCount * 3);
    const sPos = new Float32Array(spaceCount * 3);
    const sCol = new Float32Array(spaceCount * 3);

    for (let i = 0; i < helixCount; i++) {
      const strand = i % 2;
      const t = i / helixCount;
      const yPos = t * 60 - 30;
      const turns = 10;
      const theta = t * turns * Math.PI * 2 + (strand * Math.PI);
      const radius = 4.2;
      const spread = 0.5;

      const x = Math.cos(theta) * radius + (Math.random() - 0.5) * spread;
      const y = yPos + (Math.random() - 0.5) * spread;
      const z = Math.sin(theta) * radius + (Math.random() - 0.5) * spread;

      hPos[i * 3] = x;
      hPos[i * 3 + 1] = y;
      hPos[i * 3 + 2] = z;

      const mix = Math.random();
      if (mix < 0.25) {
        hCol[i * 3] = 0.98; hCol[i * 3 + 1] = 0.96; hCol[i * 3 + 2] = 0.92;
      } else if (mix < 0.55) {
        hCol[i * 3] = 0.92; hCol[i * 3 + 1] = 0.78; hCol[i * 3 + 2] = 0.52;
      } else if (mix < 0.8) {
        hCol[i * 3] = 0.98; hCol[i * 3 + 1] = 0.74; hCol[i * 3 + 2] = 0.66;
      } else {
        hCol[i * 3] = 0.82; hCol[i * 3 + 1] = 0.63; hCol[i * 3 + 2] = 0.44;
      }
    }

    for (let i = 0; i < spaceCount; i++) {
      const t = i / spaceCount;
      const yPos = t * 80 - 40;
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 15;

      sPos[i * 3] = Math.cos(angle) * radius;
      sPos[i * 3 + 1] = yPos;
      sPos[i * 3 + 2] = Math.sin(angle) * radius;

      sCol[i * 3] = 0.72; sCol[i * 3 + 1] = 0.62; sCol[i * 3 + 2] = 0.52;
    }

    return { helixPositions: hPos, helixColors: hCol, spacePositions: sPos, spaceColors: sCol };
  }, []);

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <>
      <div 
        id="canvas-container" 
        className={loadingState !== 'active' ? 'portal-active' : ''}
        style={{ display: currentPage === 'hero' ? 'block' : 'none' }}
      >
        <Canvas 
          frameloop={currentPage === 'hero' ? 'always' : 'never'}
          camera={{ position: [0, 0, 10.5], fov: 45, near: 0.1, far: 1000 }}
        >
          <ambientLight intensity={0.95} color="#e5ded4" />
          <pointLight position={[6, 12, 6]} intensity={1.8} color="#ffdca3" />
          <pointLight position={[-6, -12, -6]} intensity={1.3} color="#ffb5a7" />
          
          <fogExp2 attach="fog" args={['#faf7f0', 0.012]} />
          
          {currentPage === 'hero' && (
            <HelicalWorld 
              scrollState={scrollState}
              loadingState={loadingState}
              onWarpTrigger={(e) => {
                playExplosion(() => {
                  setCurrentPage("about");
                }, e, true);
              }}
              onProjectsWarpTrigger={(e) => {
                playExplosion(() => {
                  setCurrentPage("projects");
                }, e, true);
              }}
              onSkillsWarpTrigger={(e) => {
                playExplosion(() => {
                  setCurrentPage("skills");
                }, e, true);
              }}
              helixPositions={helixPositions}
              helixColors={helixColors}
              spacePositions={spacePositions}
              spaceColors={spaceColors}
              particleTexture={particleTexture}
            />
          )}

          <ExplosionEffect 
            progress={explosionProgress}
            active={explosionActive}
            origin={explosionOrigin.current}
          />

          <CameraController loadingState={loadingState} />

          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.15} 
              luminanceSmoothing={0.9} 
              intensity={1.2} 
            />
          </EffectComposer>
        </Canvas>
      </div>

      {loadingState !== 'active' && (
        <div className={`loader-container ${loadingState === 'transitioning' ? 'hidden' : ''}`}>
          <div className="loader-content">
            <div className="loader-profile-wrapper" style={{ opacity: 0, transform: 'scale(0.8)' }}>
              <img 
                src={profileImg} 
                alt="Arikaran Profile" 
                className="loader-profile-img"
              />
            </div>

            <h1 className="loader-title">I AM ARIKARAN</h1>

            <div className="loader-progress-track">
              <div className="loader-progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="loader-icons-container">
              <div className="loader-icon-box icon-github">
                <GithubIcon />
              </div>
              <div className="loader-icon-box icon-linkedin">
                <LinkedinIcon />
              </div>
              <div className="loader-icon-box icon-leetcode">
                <LeetcodeIcon />
              </div>
              <div className="loader-icon-box icon-python">
                <PythonIcon />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen About page */}
      {loadingState === 'active' && currentPage === 'about' && (
        <AboutExperience 
          onBack={(e) => {
            playExplosion(() => {
              setCurrentPage("hero");
            }, e, false);
          }}
        />
      )}

      {/* Full-screen Projects page */}
      {loadingState === 'active' && currentPage === 'projects' && (
        <ProjectsExperience 
          onBack={(e) => {
            playExplosion(() => {
              setCurrentPage("hero");
            }, e, false);
          }}
        />
      )}

      {/* Full-screen Skills page */}
      {loadingState === 'active' && currentPage === 'skills' && (
        <SkillsExperience 
          onBack={(e) => {
            playExplosion(() => {
              setCurrentPage("hero");
            }, e, false);
          }}
        />
      )}

      <div 
        ref={flashOverlayRef} 
        className="white-flash" 
      />

      {loadingState === 'active' && currentPage === 'hero' && (
        <>
          <div className="content">
            <section style={{ height: '100vh' }}></section>
            <section style={{ height: '100vh' }}></section>
            <section style={{ height: '100vh' }}></section>
            <section style={{ height: '100vh' }}></section>
            <section style={{ height: '100vh' }}></section>
            <section style={{ height: '100vh' }}></section>
          </div>
          <HeroCopyrightFooter isVisible={showSocialFooter} />
        </>
      )}
    </>
  );
}
