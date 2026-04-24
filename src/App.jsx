import { useEffect, useRef, useState } from 'react';
import './index.css';

function App() {
  const [loaderSplit, setLoaderSplit] = useState(false);
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [showLines, setShowLines] = useState([false, false, false]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const ringPos = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const requestRef = useRef();

  useEffect(() => {
    // Custom Cursor
    const onMouseMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      
      if (dotRef.current) {
        dotRef.current.style.left = mousePos.current.x + 'px';
        dotRef.current.style.top = mousePos.current.y + 'px';
      }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    
    const animateRing = () => {
      const ease = 0.15;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;
      
      if (ringRef.current) {
        ringRef.current.style.left = ringPos.current.x + 'px';
        ringRef.current.style.top = ringPos.current.y + 'px';
      }
      
      requestRef.current = requestAnimationFrame(animateRing);
    };
    
    requestRef.current = requestAnimationFrame(animateRing);
    
    // Hover effects
    const addHover = () => document.body.classList.add('cursor-hover');
    const removeHover = () => document.body.classList.remove('cursor-hover');
    
    const elements = document.querySelectorAll('a, button');
    elements.forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(requestRef.current);
      elements.forEach(el => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
      });
    };
  }, [loaderHidden]);

  useEffect(() => {
    // Loader Animation
    document.body.style.overflow = 'hidden';
    
    let count = 0;
    const counterInterval = setInterval(() => {
      count++;
      setCurrentCount(count);
      if (count >= 100) clearInterval(counterInterval);
    }, 25);
    
    setTimeout(() => setShowLines(prev => [true, prev[1], prev[2]]), 1000);
    setTimeout(() => setShowLines(prev => [prev[0], true, prev[2]]), 1200);
    setTimeout(() => setShowLines(prev => [prev[0], prev[1], true]), 1400);
    
    setTimeout(() => {
      setLoaderSplit(true);
      document.body.style.overflow = '';
      
      setTimeout(() => {
        setLoaderHidden(true);
        // Trigger hero reveal
        const heroEls = document.querySelectorAll('.hero-el.scroll-reveal');
        heroEls.forEach((el, index) => {
          setTimeout(() => el.classList.add('visible'), index * 150);
        });
      }, 900);
    }, 3000);
    
    return () => clearInterval(counterInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scroll Reveal Observer
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    
    const revealElements = document.querySelectorAll('.scroll-reveal:not(.hero-el)');
    revealElements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, [loaderHidden]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <>
      <div id="cursor-dot" ref={dotRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>

      {!loaderHidden && (
        <div id="loader" className={loaderSplit ? 'split' : ''}>
          <div className="loader-bg-top"></div>
          <div className="loader-bg-bottom"></div>
          <div className="ghost-number" id="loader-counter">{currentCount}</div>
          <div className="loader-content">
            <div className="loader-line-wrap"><span className={`loader-line-1 ${showLines[0] ? 'show' : ''}`}>— Welcome to —</span></div>
            <div className="loader-line-wrap"><span className={`loader-line-2 ${showLines[1] ? 'show' : ''}`}>Harsh's</span></div>
            <div className="loader-line-wrap"><span className={`loader-line-3 ${showLines[2] ? 'show' : ''}`}>World.</span></div>
          </div>
          <div className="loader-progress-wrap">
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${currentCount}%` }}></div>
            </div>
            <div className="progress-text">
              <span>Loading experience</span>
              <span>{currentCount}%</span>
            </div>
          </div>
        </div>
      )}

      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="logo">H<span>.</span></div>
        <div className="nav-links">
          <a href="#about">Story</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#leadership">Leadership</a>
          <a href="#contact">Contact</a>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        {['about', 'skills', 'projects', 'leadership', 'contact'].map((id, i) => (
          <a key={i} href={`#${id}`} onClick={() => setMobileMenuOpen(false)}>
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </a>
        ))}
        <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="mobile-theme-toggle">
          {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>

      <section id="hero" className="hero">
        <div className="hero-content">
          <div className="eyebrow hero-el scroll-reveal">
            <div className="eyebrow-line"></div>
            <div className="eyebrow-text">// Student · Builder · Data Person</div>
          </div>
          <h1 className="headline hero-el scroll-reveal">
            Not just a<br />
            developer.<br />
            A <span className="italic highlight">thinker</span><br />
            who builds.
          </h1>
          <div className="hero-bottom hero-el scroll-reveal">
            <div className="hero-desc">
              // Data Science student. AI/ML builder. Analytics thinker. Leadership by default. The generalist who ships.
            </div>
            <div className="hero-stats">
              <div className="stat-block">
                <div className="stat-number">5+</div>
                <div className="stat-label">AI Projects</div>
              </div>
              <div className="stat-block">
                <div className="stat-number">3</div>
                <div className="stat-label">Domains</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="chapter-label scroll-reveal">
          <span>Chapter 01 — The Origin</span>
          <div className="chapter-line"></div>
        </div>
        <div className="two-column">
          <div className="col-left">
            <div className="sticky-wrap">
              <div className="ghost-number-section">01</div>
              <h2 className="section-heading scroll-reveal">
                Who is<br />
                <span className="italic highlight">Harsh?</span>
              </h2>
            </div>
          </div>
          <div className="col-right">
            <p className="scroll-reveal">I started where most data people do — staring at a spreadsheet, wondering why numbers weren't telling a story. Then I learned to make them talk.</p>
            <p className="scroll-reveal">From building <strong>ML models</strong> that predict behaviour, to <strong>dashboards</strong> that reveal patterns nobody noticed — I've learned that the best insights live at the intersection of domains.</p>
            <p className="scroll-reveal">I'm the person who reads the data, codes the solution, leads the team, and still asks <strong>'but why does this actually matter to a human being?'</strong></p>
            <p className="scroll-reveal">Some call it being a generalist. I call it being dangerous in the best way.</p>
            
            <div className="info-table scroll-reveal">
              <div className="info-row">
                <div className="info-label">// Primary Domain</div>
                <div className="info-value">Data Science + AI/ML</div>
              </div>
              <div className="info-row">
                <div className="info-label">// Secondary</div>
                <div className="info-value">Data Analytics</div>
              </div>
              <div className="info-row">
                <div className="info-label">// Hidden Superpower</div>
                <div className="info-value">Leadership</div>
              </div>
              <div className="info-row">
                <div className="info-label">// Current Status</div>
                <div className="info-value status-wrap">
                  Actively building <span className="status-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="skills">
        <div className="chapter-label scroll-reveal">
          <span>Chapter 02 — The Arsenal</span>
          <div className="chapter-line"></div>
        </div>
        <div className="skills-grid">
          <div className="skill-card scroll-reveal">
            <div className="skill-icon">◈</div>
            <h3 className="skill-title">AI & Machine Learning</h3>
            <p className="skill-desc">Building models that actually generalise. From regression to neural nets — I understand the math and the tradeoffs.</p>
            <div className="skill-tags">
              <span>Python</span><span>Scikit-learn</span><span>TensorFlow</span><span>PyTorch</span>
            </div>
          </div>
          <div className="skill-card scroll-reveal">
            <div className="skill-icon">◉</div>
            <h3 className="skill-title">Data Science</h3>
            <p className="skill-desc">End-to-end pipelines. Cleaning messy data, feature engineering, modelling, communicating results that non-data people actually understand.</p>
            <div className="skill-tags">
              <span>Pandas</span><span>NumPy</span><span>Statistics</span><span>EDA</span>
            </div>
          </div>
          <div className="skill-card scroll-reveal">
            <div className="skill-icon">◇</div>
            <h3 className="skill-title">Data Analytics</h3>
            <p className="skill-desc">Turning raw data into decisions. Dashboards, KPIs, trend analysis — the kind that changes what a team does on Monday.</p>
            <div className="skill-tags">
              <span>SQL</span><span>Power BI</span><span>Matplotlib</span><span>Seaborn</span>
            </div>
          </div>
          <div className="skill-card scroll-reveal">
            <div className="skill-icon">◎</div>
            <h3 className="skill-title">Leadership</h3>
            <p className="skill-desc">The skill that multiplies everything else. I've led teams, driven projects, and know how to move people toward a shared goal.</p>
            <div className="skill-tags">
              <span>Team Lead</span><span>Strategy</span><span>Communication</span>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="projects">
        <div className="chapter-label scroll-reveal">
          <span>Chapter 03 — The Work</span>
          <div className="chapter-line"></div>
        </div>
        <div className="projects-list">
          <div className="project-row scroll-reveal">
            <div className="project-num">_01</div>
            <div className="project-info">
              <div className="project-name">Air Quality Predictive Model</div>
              <div className="project-tech">Python · Scikit-learn · Random Forest</div>
            </div>
            <div className="project-meta">
              <div className="project-badge">[AI/ML]</div>
              <div className="project-year">[2024]</div>
            </div>
            <div className="project-arrow">↗</div>
          </div>
          <div className="project-row scroll-reveal">
            <div className="project-num">_02</div>
            <div className="project-info">
              <div className="project-name">Grocery Store Sales Insights</div>
              <div className="project-tech">Python · Scikit-learn · Power BI</div>
            </div>
            <div className="project-meta">
              <div className="project-badge">[Analytics]</div>
              <div className="project-year">[2024]</div>
            </div>
            <div className="project-arrow">↗</div>
          </div>
          <div className="project-row scroll-reveal">
            <div className="project-num">_03</div>
            <div className="project-info">
              <div className="project-name">Hate Speech Detection</div>
              <div className="project-tech">Python · NLP · Decision Tree</div>
            </div>
            <div className="project-meta">
              <div className="project-badge">[AI/NLP]</div>
              <div className="project-year">[2024]</div>
            </div>
            <div className="project-arrow">↗</div>
          </div>
          <div className="project-row scroll-reveal">
            <div className="project-num">_04</div>
            <div className="project-info">
              <div className="project-name">SMS Spam Classification</div>
              <div className="project-tech">Python · SVM · Naive Bayes</div>
            </div>
            <div className="project-meta">
              <div className="project-badge">[AI/ML]</div>
              <div className="project-year">[2024]</div>
            </div>
            <div className="project-arrow">↗</div>
          </div>
        </div>
      </section>

      <section id="leadership" className="leadership">
        <div className="chapter-label scroll-reveal">
          <span>Chapter 04 — The Leader</span>
          <div className="chapter-line"></div>
        </div>
        <div className="two-column">
          <div className="col-left">
            <div className="sticky-wrap">
              <div className="ghost-number-section">04</div>
              <h2 className="section-heading scroll-reveal">
                When data meets leadership,<br />
                things get <span className="italic highlight">done.</span>
              </h2>
            </div>
          </div>
          <div className="col-right">
            <div className="timeline">
              <div className="timeline-line"></div>
              
              <div className="timeline-item scroll-reveal">
                <div className="timeline-dot"></div>
                <div className="timeline-date">2025</div>
                <h3 className="timeline-title">1st Prize — Ideathon, 54th ISTE Convention</h3>
                <p className="timeline-desc">Led the team to victory at the national convention, demonstrating problem-solving and business acumen.</p>
              </div>
              
              <div className="timeline-item scroll-reveal">
                <div className="timeline-dot"></div>
                <div className="timeline-date">2024</div>
                <h3 className="timeline-title">Data Science Intern — 1stop</h3>
                <p className="timeline-desc">Built SMS Spam Classification (93% acc.) and Hate Speech Detection (97% acc.) models using NLP. Performed full data preprocessing and feature engineering on real-world datasets.</p>
              </div>
              
              <div className="timeline-item scroll-reveal">
                <div className="timeline-dot"></div>
                <div className="timeline-date">2024</div>
                <h3 className="timeline-title">Runner-up — Byte Battle Web Dev</h3>
                <p className="timeline-desc">Led the web development team, coordinating the project pipeline, ensuring fast delivery and seamless UI/UX implementation.</p>
              </div>

              <div className="timeline-item scroll-reveal">
                <div className="timeline-dot"></div>
                <div className="timeline-date">2023</div>
                <h3 className="timeline-title">1st Prize — Hackathon, Yuva Fest (LTSU)</h3>
                <p className="timeline-desc">Coordinated a multi-disciplinary team to develop an innovative solution, managing timelines, strategy, and final presentation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="chapter-label scroll-reveal">
          <span>Chapter 05 — Let's Talk</span>
        </div>
        <div className="contact-wrap scroll-reveal">
          <div className="contact-small">Got a project, idea, or opportunity?</div>
          <h2 className="contact-heading">
            Let's<br />
            build<br />
            <span className="italic highlight">together.</span>
          </h2>
          <a href="mailto:harshvardhansingh.ds@gmail.com" className="email-btn">harshvardhansingh.ds@gmail.com ↗</a>
          <div className="social-links">
            <a href="https://github.com/harshvardhansingh" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="https://linkedin.com/in/harshvardhansingh775" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href="./Harsh_Resume.pdf" target="_blank" rel="noreferrer">Resume ↗</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-left">© 2025 Harsh</div>
        <div className="footer-center">Designed with intention. Built with data.</div>
        <div className="footer-right">Punjab, India</div>
      </footer>
    </>
  );
}

export default App;
