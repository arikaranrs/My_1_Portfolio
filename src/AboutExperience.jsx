import React, { useEffect, useState, useRef, memo } from 'react';
import profileImg from './image/Arikaran_profile.jpeg';
import resumePdf from './resume/ARIKARAN-RS-RESUME.PDF.pdf';
import aboutBgVideo from './assets/aboutbg.mp4';

const DOMAIN_TITLES = [
  "Artificial Intelligence Engineer",
  "AI Developer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Data Analyst",
  "AI/ML Engineer"
];

const BIO_TEXT = "Final-year Artificial Intelligence & Data Science student with a deep passion for Artificial Intelligence. I am highly interested in Machine Learning, Deep Learning, Data Analytics, and Generative AI. I love solving real-world problems using intelligent software solutions and look forward to starting my career as an AI Engineer.";

// =========================================================================
// 1. HARDWARE-ACCELERATED PERSISTENT BACKGROUND VIDEO PLAYER
// Single instance, zero DOM re-renders, freeze-protection & auto-recovery
// =========================================================================
const BackgroundVideoPlayer = memo(function BackgroundVideoPlayer() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Direct DOM property configuration
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');

    let isAttemptingPlay = false;

    const safePlay = () => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;

      if (video.paused && !isAttemptingPlay) {
        isAttemptingPlay = true;
        const playPromise = video.play();
        if (playPromise !== undefined && typeof playPromise.then === 'function') {
          playPromise
            .then(() => {
              isAttemptingPlay = false;
            })
            .catch(() => {
              isAttemptingPlay = false;
            });
        } else {
          isAttemptingPlay = false;
        }
      }
    };

    // Initial mount playback call
    safePlay();

    // Lifecycle events
    const handleEnded = () => {
      if (video) {
        video.currentTime = 0;
        safePlay();
      }
    };

    const handleVisibility = () => {
      if (!document.hidden && video && video.paused) {
        safePlay();
      }
    };

    const handleFocus = () => {
      if (video && video.paused) {
        safePlay();
      }
    };

    const handleCanPlay = () => {
      safePlay();
    };

    // One-time user gesture fallback
    const onUserInteraction = () => {
      safePlay();
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('canplay', handleCanPlay);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('click', onUserInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', onUserInteraction, { once: true, passive: true });
    window.addEventListener('keydown', onUserInteraction, { once: true, passive: true });

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('click', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
    };
  }, []);

  return (
    <div className="about-video-bg-container">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src={aboutBgVideo}
        className="about-video-bg-media"
      />
      {/* Subtle readability gradient tint */}
      <div className="about-video-overlay-tint"></div>
    </div>
  );
});

// Typing animation for main name: "ARIKARAN R"
function TypewriterName({ text = "ARIKARAN R", speed = 80 }) {
  const [displayedName, setDisplayedName] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (displayedName.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedName(text.slice(0, displayedName.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsFinished(true);
    }
  }, [displayedName, text, speed]);

  return (
    <h1 className="apple-about-name">
      <span>{displayedName}</span>
      {!isFinished && <span className="name-cursor">|</span>}
    </h1>
  );
}

// Continuous infinite typewriter loop for domain titles
function TypewriterDomainTitles({ titles = DOMAIN_TITLES }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === titles[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => {
        setReverse(true);
      }, 1800);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % titles.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 35 : 75);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, titles]);

  return (
    <div className="apple-domain-title-wrapper">
      <span className="apple-domain-title-text">
        {titles[index].substring(0, subIndex)}
      </span>
      <span className="typing-cursor"></span>
    </div>
  );
}

// High-speed AI Typewriter for the About Me Introduction with Liquid Gradient & Shimmer
function TypewriterBio({ text = BIO_TEXT, speed = 14, delay = 400 }) {
  const [displayedBio, setDisplayedBio] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isTyping) return;

    if (displayedBio.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedBio(text.slice(0, displayedBio.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [displayedBio, isTyping, text, speed]);

  return (
    <div className="apple-about-bio-container">
      <p className="apple-about-bio">
        <span className="liquid-bio-gradient-text">{displayedBio}</span>
        {isTyping && <span className="ai-bio-cursor"></span>}
      </p>
    </div>
  );
}

export default function AboutExperience({ onBack }) {
  const [showResumeViewer, setShowResumeViewer] = useState(false);

  return (
    <div className="about-experience-fullscreen">
      
      {/* 1. CINEMATIC 3D BACKGROUND VIDEO LAYER (HARDWARE ACCELERATED & CONTINUOUS) */}
      <BackgroundVideoPlayer />

      <div className="about-experience-scroll-wrapper">
        {/* 2. ULTRA-PREMIUM LIQUID CRYSTAL GLASS ABOUT CARD */}
        <div className="apple-about-card liquid-crystal-card">
          
          {/* Subtle Chromatic Caustics & Specular Water Sweep */}
          <div className="slab-liquid-caustics about-liquid-caustics"></div>
          <div className="slab-water-shine luxury-specular-sweep"></div>
          <div className="slab-neon-border about-neon-border"></div>
          
          {/* HEADER: Side-by-side Profile Avatar + Name & Titles */}
          <div className="apple-profile-header">
            <div className="apple-avatar-frame">
              <div className="avatar-inner-ring"></div>
              <img 
                src={profileImg} 
                alt="ARIKARAN R Profile" 
                className="apple-avatar-img"
              />
            </div>
            
            <div className="apple-header-info">
              <div className="apple-badge-wrapper">
                <span className="apple-badge">✨ PORTFOLIO EXPERIENCE</span>
              </div>
              <TypewriterName text="ARIKARAN R" />
              <TypewriterDomainTitles titles={DOMAIN_TITLES} />
            </div>
          </div>

          {/* DIVIDER 1 */}
          <div className="apple-divider"></div>

          {/* ABOUT ME SECTION: Modern Liquid Gradient & Specular Shimmer */}
          <div className="apple-bio-section">
            <TypewriterBio text={BIO_TEXT} />
          </div>

          {/* VIEW RESUME BUTTON: Liquid Gradient Glass */}
          <div className="apple-action-group">
            <button
              onClick={() => setShowResumeViewer(true)}
              className="btn-view-resume"
            >
              <span className="btn-reflection"></span>
              <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              View Resume
            </button>
          </div>

          {/* DIVIDER 2 */}
          <div className="apple-divider"></div>

          {/* BOTTOM SECTION: GO BACK BUTTON */}
          <div className="apple-footer-back">
            <button 
              onClick={onBack}
              className="about-experience-btn-back"
            >
              <span className="btn-icon">←</span> Go Back
            </button>
          </div>

        </div>
      </div>

      {/* RESUME EXPERIENCE: Full-Screen PDF Viewer Modal */}
      {showResumeViewer && (
        <div className="resume-viewer-overlay">
          <div className="resume-viewer-backdrop" onClick={() => setShowResumeViewer(false)}></div>
          
          <div className="resume-viewer-content">
            {/* Viewer Header Bar */}
            <div className="resume-viewer-header">
              <h2 className="resume-viewer-title">Resume</h2>
              <button 
                onClick={() => setShowResumeViewer(false)}
                className="resume-viewer-close-btn"
                aria-label="Close Resume Viewer"
              >
                ✕ Close
              </button>
            </div>

            {/* Center Embedded PDF Viewer */}
            <div className="resume-pdf-container">
              <object
                data={resumePdf}
                type="application/pdf"
                className="resume-pdf-object"
              >
                <iframe
                  src={`${resumePdf}#toolbar=0`}
                  title="ARIKARAN R Resume"
                  className="resume-pdf-iframe"
                >
                  <p>Your browser does not support inline PDFs. <a href={resumePdf} target="_blank" rel="noreferrer">Download Resume</a> to view.</p>
                </iframe>
              </object>
            </div>

            {/* Bottom Action Footer: Download Resume */}
            <div className="resume-viewer-footer">
              <a
                href={resumePdf}
                download="ARIKARAN-RS-RESUME.pdf"
                className="btn-download-resume"
              >
                <span className="btn-reflection"></span>
                <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Resume
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
