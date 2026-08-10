import React, { useState, useEffect, useRef, useMemo } from 'react';

// Skill Data Categories and detailed skills
const SKILLS_DATA = [
  // AI / Generative AI
  { id: 'rag', name: 'RAG', category: 'ai', level: 94, color: '#00f2fe', icon: '🧠', desc: 'Retrieval-Augmented Generation & Vector Pipelines' },
  { id: 'langchain', name: 'LangChain', category: 'ai', level: 92, color: '#38bdf8', icon: '🦜', desc: 'LLM Orchestration & Autonomous Agent Chains' },
  { id: 'llm', name: 'LLM', category: 'ai', level: 92, color: '#818cf8', icon: '⚡', desc: 'Large Language Model Fine-Tuning & Prompting' },
  { id: 'prompt_eng', name: 'Prompt Engineering', category: 'ai', level: 95, color: '#c084fc', icon: '✨', desc: 'Advanced CoT, Few-Shot & Zero-Shot Optimization' },
  { id: 'chromadb', name: 'ChromaDB', category: 'ai', level: 90, color: '#ec4899', icon: '🔮', desc: 'High-Performance Vector Embeddings Store' },
  { id: 'embeddings', name: 'Embeddings', category: 'ai', level: 92, color: '#f472b6', icon: '🌌', desc: 'Dense Vector Representations & Semantic Search' },
  { id: 'llama', name: 'Llama 3.1', category: 'ai', level: 90, color: '#fb7185', icon: '🦙', desc: 'Open-Source Meta LLM Integration & Deployment' },
  { id: 'ollama', name: 'Ollama', category: 'ai', level: 92, color: '#00f2fe', icon: '🦙', desc: 'Local LLM Hosting, Quantization & Serving' },
  { id: 'bert', name: 'BERT', category: 'ai', level: 88, color: '#38bdf8', icon: '🔤', desc: 'Bidirectional Transformers for NLP Understanding' },

  // Deep Learning
  { id: 'tensorflow', name: 'TensorFlow', category: 'deep_learning', level: 92, color: '#ff7b00', icon: '🔥', desc: 'Production Deep Learning Architectures' },
  { id: 'keras', name: 'Keras', category: 'deep_learning', level: 90, color: '#ef4444', icon: '🎯', desc: 'High-level Neural Network Prototyping' },
  { id: 'pytorch', name: 'PyTorch', category: 'deep_learning', level: 88, color: '#ec4899', icon: '⚡', desc: 'Dynamic Tensors & Deep Learning Research' },
  { id: 'cnn', name: 'CNN', category: 'deep_learning', level: 90, color: '#8b5cf6', icon: '👁️', desc: 'Convolutional Neural Networks for Computer Vision' },
  { id: 'fwd_prop', name: 'Forward Propagation', category: 'deep_learning', level: 92, color: '#3b82f6', icon: '➡️', desc: 'Neural Mathematical Feed-Forward Activations' },
  { id: 'backprop', name: 'Backpropagation', category: 'deep_learning', level: 92, color: '#00f2fe', icon: '🔄', desc: 'Gradient Descent Optimization & Chain Rule' },

  // Machine Learning
  { id: 'sklearn', name: 'Scikit-learn', category: 'ml', level: 95, color: '#38bdf8', icon: '⚙️', desc: 'Core ML Classification, Clustering & Regression' },
  { id: 'xgboost', name: 'XGBoost', category: 'ml', level: 90, color: '#00f2fe', icon: '🚀', desc: 'Extreme Gradient Boosted Decision Trees' },
  { id: 'random_forest', name: 'Random Forest', category: 'ml', level: 92, color: '#10b981', icon: '🌲', desc: 'Ensemble Bagging & High-Dimensional Trees' },
  { id: 'grad_boost', name: 'Gradient Boosting', category: 'ml', level: 88, color: '#a855f7', icon: '📈', desc: 'Sequential Loss Minimization Algorithms' },
  { id: 'lin_reg', name: 'Linear Regression', category: 'ml', level: 94, color: '#3b82f6', icon: '📏', desc: 'Continuous Numerical Target Estimation' },
  { id: 'log_reg', name: 'Logistic Regression', category: 'ml', level: 92, color: '#ec4899', icon: '📊', desc: 'Probabilistic Binary & Multiclass Classification' },
  { id: 'decision_tree', name: 'Decision Tree', category: 'ml', level: 90, color: '#f59e0b', icon: '🌿', desc: 'Entropy & Information Gain Decision Splits' },
  { id: 'svm', name: 'SVM', category: 'ml', level: 88, color: '#6366f1', icon: '📐', desc: 'Support Vector Hyperplane Classification' },
  { id: 'knn', name: 'KNN', category: 'ml', level: 86, color: '#06b6d4', icon: '📍', desc: 'K-Nearest Neighbors Distance-Based Metrics' },

  // Data Analytics
  { id: 'pandas', name: 'Pandas', category: 'data', level: 94, color: '#3b82f6', icon: '🐼', desc: 'High-Performance Dataframes & Transformations' },
  { id: 'numpy', name: 'NumPy', category: 'data', level: 92, color: '#00f2fe', icon: '🔢', desc: 'Multidimensional Arrays & Linear Algebra' },
  { id: 'eda', name: 'EDA', category: 'data', level: 92, color: '#a855f7', icon: '🔍', desc: 'Exploratory Data Analysis & Statistical Insight' },
  { id: 'etl', name: 'ETL', category: 'data', level: 85, color: '#ec4899', icon: '🔀', desc: 'Extract, Transform & Load Data Pipelines' },
  { id: 'powerbi', name: 'Power BI', category: 'data', level: 86, color: '#f59e0b', icon: '📊', desc: 'Interactive Executive Business Dashboards' },
  { id: 'excel', name: 'Excel', category: 'data', level: 88, color: '#10b981', icon: '📑', desc: 'Advanced Formulas, Pivot Tables & Analytics' },

  // Programming
  { id: 'python', name: 'Python', category: 'programming', level: 95, color: '#38bdf8', icon: '🐍', desc: 'Primary AI, ML & Scientific Programming Language' },
  { id: 'sql', name: 'SQL', category: 'programming', level: 90, color: '#ec4899', icon: '🗄️', desc: 'Relational Database Queries & Schema Architecture' },
  { id: 'html', name: 'HTML', category: 'programming', level: 92, color: '#f97316', icon: '🌐', desc: 'Semantic Web Structure & Accessibility' },
  { id: 'css', name: 'CSS', category: 'programming', level: 88, color: '#00f2fe', icon: '🎨', desc: 'Modern Responsive Layouts, Grid & Animations' },
  { id: 'java', name: 'Java', category: 'programming', level: 80, color: '#ef4444', icon: '☕', desc: 'Object-Oriented Programming & Backend Core' },

  // Backend / Development
  { id: 'fastapi', name: 'FastAPI', category: 'backend', level: 90, color: '#10b981', icon: '⚡', desc: 'Asynchronous Python Web APIs & Microservices' },
  { id: 'flask', name: 'Flask', category: 'backend', level: 88, color: '#a855f7', icon: '🧪', desc: 'Lightweight REST APIs for Machine Learning' },
  { id: 'react', name: 'React', category: 'backend', level: 86, color: '#00f2fe', icon: '⚛️', desc: 'Modern Component-Driven Web Applications' },
  { id: 'git', name: 'Git', category: 'backend', level: 92, color: '#f97316', icon: '🌿', desc: 'Version Control & Distributed Branching' },
  { id: 'github', name: 'GitHub', category: 'backend', level: 94, color: '#c084fc', icon: '🐙', desc: 'CI/CD Actions, Repositories & Collaboration' }
];

const CATEGORIES = [
  { id: 'all', label: 'All Skills', count: 40 },
  { id: 'ai', label: 'AI & Generative AI', count: 9 },
  { id: 'deep_learning', label: 'Deep Learning', count: 6 },
  { id: 'ml', label: 'Machine Learning', count: 9 },
  { id: 'data', label: 'Data Analytics', count: 6 },
  { id: 'programming', label: 'Programming', count: 5 },
  { id: 'backend', label: 'Backend & Dev', count: 5 }
];

export default function SkillsExperience({ onBack }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [animatedProgress, setAnimatedProgress] = useState(false);

  // Trigger progress bar animations on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Filter skills based on selected category tab
  const filteredSkills = useMemo(() => {
    if (activeCategory === 'all') return SKILLS_DATA;
    return SKILLS_DATA.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  // Smooth 3D mouse parallax tracking
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  return (
    <div 
      className="skills-experience-fullscreen"
      onMouseMove={handleMouseMove}
    >
      {/* Background Volumetric Glow & Aurora Atmosphere */}
      <div className="skills-ambient-bg">
        <div 
          className="skills-glow-orb orb-cyan"
          style={{ transform: `translate(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px)` }}
        />
        <div 
          className="skills-glow-orb orb-magenta"
          style={{ transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)` }}
        />
        <div 
          className="skills-glow-orb orb-violet"
          style={{ transform: `translate(${mousePos.x * 0.8}px, ${-mousePos.y * 0.8}px)` }}
        />
        <div className="skills-grid-overlay"></div>
      </div>

      {/* Main Content Container */}
      <div className="skills-content-container">
        
        {/* Top Header Section */}
        <header className="skills-header-section">
          <div className="skills-badge-wrapper">
            <span className="skills-badge">✦ TECHNICAL ARSENAL</span>
          </div>
          <h1 className="skills-main-title">
            <span className="skills-title-gradient">SKILLS MATRIX</span>
          </h1>
          <p className="skills-subtitle">
            Specialized in Artificial Intelligence, Deep Learning, Machine Learning, Data Analytics, and Modern Scalable Systems.
          </p>

          {/* Category Filter Navigation Bar */}
          <div className="skills-category-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedSkill(null);
                }}
                className={`skills-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              >
                <span className="tab-label">{cat.label}</span>
                <span className="tab-count">{cat.count}</span>
              </button>
            ))}
          </div>
        </header>

        {/* 3D Liquid Glass Skill Grid */}
        <div 
          className="skills-grid-wrapper"
          style={{
            transform: `perspective(1000px) rotateX(${-mousePos.y * 0.25}deg) rotateY(${mousePos.x * 0.25}deg)`
          }}
        >
          {filteredSkills.map((skill, idx) => {
            const isSelected = selectedSkill?.id === skill.id;
            return (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(isSelected ? null : skill)}
                className={`skill-glass-card ${isSelected ? 'highlighted' : ''}`}
                style={{
                  '--skill-color': skill.color,
                  animationDelay: `${idx * 0.03}s`
                }}
              >
                {/* Glossy Refraction & Specular Shine */}
                <div className="skill-card-shine"></div>
                <div className="skill-card-glow"></div>

                <div className="skill-card-header">
                  <span className="skill-icon">{skill.icon}</span>
                  <div className="skill-info">
                    <h3 className="skill-name">{skill.name}</h3>
                    <span className="skill-category-tag">{skill.category.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="skill-percent-badge">
                    <span className="percent-number">
                      {animatedProgress ? skill.level : 0}%
                    </span>
                  </div>
                </div>

                {/* Animated Horizontal Neon Progress Track */}
                <div className="skill-progress-container">
                  <div className="skill-progress-track">
                    <div 
                      className="skill-progress-bar"
                      style={{
                        width: animatedProgress ? `${skill.level}%` : '0%',
                        background: `linear-gradient(90deg, #00f2fe, ${skill.color}, #ec4899)`
                      }}
                    >
                      <div className="progress-sparkle"></div>
                    </div>
                  </div>
                </div>

                <p className="skill-desc">{skill.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation: Go Back Button */}
        <footer className="skills-footer-section">
          <button 
            onClick={onBack}
            className="skills-btn-back"
          >
            <span className="back-arrow">←</span>
            <span>Return to Orbit</span>
            <span className="back-glow"></span>
          </button>
        </footer>

      </div>
    </div>
  );
}
