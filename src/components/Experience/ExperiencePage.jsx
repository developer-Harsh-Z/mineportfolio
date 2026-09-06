import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import Lenis from 'lenis';
import { Link } from 'react-router-dom';
import './ExperiencePage.css';

const experiences = [
  {
    role: "IT Intern",
    company: "Cosmospumps",
    org: "Cosmospumps Pvt. Ltd.",
    date: "Aug 2024 – Present",
    desc: [
      "Executing IT operations and infrastructure tasks at a global industrial pump manufacturer.",
      "Supporting internal systems and ensuring high availability across departments.",
      "Implementing system optimizations to streamline operations.",
    ],
  },
  {
    role: "Founder & President",
    company: "VIVIDH",
    org: "Social Media Club, USET, LTSU",
    date: "Jan 2024 – Present",
    desc: [
      "Lead club operations end-to-end — permissions, event planning, team direction, and execution.",
      "Serve as graphic designer, creating banners and creative posts for club promotions.",
      "Drive team initiatives for maximum student engagement and campus visibility.",
    ],
  },
  {
    role: "Co-President",
    company: "Cultural Kaleidoscope",
    org: "Cultural Club, USET, LTSU",
    date: "Nov 2023 – Present",
    desc: [
      "Co-lead planning and coordination of cultural events and activities.",
      "Manage cross-functional team efforts to deliver campus-wide cultural celebrations.",
    ],
  },
  {
    role: "Head of Operations",
    company: "SRIJANAM",
    org: "Organizing Committee, USET, LTSU",
    date: "2024 – 2025",
    desc: [
      "Managed operational logistics and on-ground execution for fest events.",
      "Coordinated resources and teams for 500+ attendees across multiple event tracks.",
    ],
  },
  {
    role: "NSS Member",
    company: "NSS",
    org: "USET Department, LTSU",
    date: "Jan 2025 – Present",
    desc: [
      "Participate in community service and outreach activities under the NSS program.",
      "Assist in organizing NSS-driven social initiatives in local communities.",
    ],
  },
  {
    role: "Member",
    company: "Coding Nexus",
    org: "Coding Club, USET, LTSU",
    date: "2023 – Present",
    desc: [
      "Participate in coding workshops, competitions, and peer learning sessions.",
      "Engage in collaborative problem-solving and upskilling in software development.",
    ],
  },
];

const CARD_H   = 360;  // px — open card height
const SCROLL_PER = 700; // px scroll per folder
const HERO_VH  = 0.9;  // hero is 90vh

// ─── Single folder — all animation driven by continuous motion values ────────
function FolderItem({ exp, i, total, scrollY, zoneStart }) {
  const startOpen = zoneStart + i * SCROLL_PER;
  const fullOpen  = zoneStart + (i + 0.5) * SCROLL_PER;
  const startClose= zoneStart + (i + 1) * SCROLL_PER;
  const fullClose = zoneStart + (i + 1.5) * SCROLL_PER;
  const isLast = i === total - 1;

  const bodyH = useTransform(
    scrollY,
    [startOpen, fullOpen, startClose, fullClose],
    [0, CARD_H, CARD_H, isLast ? CARD_H : 0]
  );

  // Folder lifts forward (translateY up) when active
  const lift = useTransform(scrollY, [startOpen, fullOpen, startClose, fullClose], [0, -4, -4, isLast ? -4 : 0]);

  // Shadow deepens when folder is open (depth illusion)
  const shadow = useTransform(scrollY,
    [startOpen, fullOpen, startClose, fullClose],
    [
      '0 2px 4px rgba(0,0,0,0.12)',
      '0 16px 40px rgba(0,0,0,0.35)',
      '0 16px 40px rgba(0,0,0,0.35)',
      isLast ? '0 16px 40px rgba(0,0,0,0.35)' : '0 2px 4px rgba(0,0,0,0.12)',
    ]
  );

  // Orange accent line grows under the tab when folder is active
  const lineW = useTransform(scrollY, [startOpen, fullOpen, startClose, fullClose], ['0%', '100%', '100%', isLast ? '100%' : '0%']);

  // Card content fades in slightly after the body starts opening
  const cardOpacity = useTransform(scrollY,
    [startOpen, startOpen + SCROLL_PER * 0.25, startClose, fullClose],
    [0, 1, 1, isLast ? 1 : 0]
  );
  const cardSlide = useTransform(scrollY, [startOpen, startOpen + SCROLL_PER * 0.3], [12, 0]);

  // Each folder's z-index — earlier folders sit on top when stacked
  const zIndex = total - i;

  return (
    <motion.div
      className="folder-item"
      style={{ y: lift, boxShadow: shadow, zIndex }}
    >
      {/* ── Folder header: the "manila tab" strip ── */}
      <div className="folder-header">
        {/* Full-width header row below the tab */}
        <div className="folder-header-row">
          <span className="fh-num">0{i + 1}</span>
          <div className="fh-title-group">
            <span className="fh-company">{exp.company}</span>
            <span className="fh-role">{exp.role}</span>
          </div>
          <span className="fh-date">{exp.date}</span>
        </div>

        {/* Orange progress line */}
        <motion.div className="folder-accent-line" style={{ width: lineW }} />
      </div>

      {/* ── Folder body: slides open ── */}
      <motion.div className="folder-body" style={{ height: bodyH, overflow: 'hidden' }}>
        {/* Dark card — like a sheet of paper inside the folder */}
        <motion.div
          className="folder-card"
          style={{ opacity: cardOpacity, y: cardSlide }}
        >
          <div className="fc-header">
            <span className="fc-id">EXP — 0{i + 1} / 0{total}</span>
            <span className="fc-org">{exp.org}</span>
          </div>
          <div className="fc-body">
            {exp.desc.map((line, idx) => (
              <p key={idx} className="fc-line">
                <span className="fc-bullet">▸</span> {line}
              </p>
            ))}
          </div>
          <div className="fc-footer">
            <div>
              <div className="fc-company">{exp.company}</div>
              <div className="fc-meta">{exp.role} · {exp.date}</div>
            </div>
            <span className="fc-cursor">█</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function ExperiencePage() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const ringPos  = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const rafCursorRef = useRef();
  const lenisRef = useRef(null);

  const total = experiences.length;
  const { scrollY } = useScroll();

  const vh          = window.innerHeight;
  // Start zone slightly before the hero fully scrolls away for smooth fade
  const zoneStart   = vh * HERO_VH - 200;
  const zoneLength  = total * SCROLL_PER;
  const zoneEnd     = zoneStart + zoneLength;
  const pageH       = zoneEnd + vh * 0.4;

  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    let idx = Math.floor((latest - zoneStart) / SCROLL_PER);
    if (idx < 0) idx = 0;
    if (idx >= total) idx = total - 1;
    if (idx !== activeIndex) setActiveIndex(idx);
  });

  // Overlay fades in/out at zone boundaries (smooth, no pop)
  const overlayOpacity = useTransform(
    scrollY,
    [zoneStart - 60, zoneStart + 60, zoneEnd - 60, zoneEnd + 60],
    [0, 1, 1, 0]
  );
  const overlayPtr = useTransform(overlayOpacity, v => v > 0.05 ? 'auto' : 'none');
  
  // Fade out hero text on scroll to prevent bleeding over navbar
  const heroOpacity = useTransform(scrollY, [0, vh * 0.5], [1, 0]);

  // Tab click — scroll to center of that folder's scroll window
  const goTo = (i) => {
    if (!lenisRef.current) return;
    lenisRef.current.scrollTo(zoneStart + (i + 0.5) * SCROLL_PER, { duration: 0.9 });
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    let aid;
    const raf = t => { lenis.raf(t); aid = requestAnimationFrame(raf); };
    aid = requestAnimationFrame(raf);
    window.scrollTo(0, 0);

    // Custom cursor
    const onMove = e => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) { dotRef.current.style.left = e.clientX+'px'; dotRef.current.style.top = e.clientY+'px'; }
    };
    document.addEventListener('mousemove', onMove);
    const animRing = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) { ringRef.current.style.left = ringPos.current.x+'px'; ringRef.current.style.top = ringPos.current.y+'px'; }
      rafCursorRef.current = requestAnimationFrame(animRing);
    };
    rafCursorRef.current = requestAnimationFrame(animRing);
    const add = () => document.body.classList.add('cursor-hover');
    const rem = () => document.body.classList.remove('cursor-hover');
    const t = setTimeout(() => {
      document.querySelectorAll('a, button, .folder-item, .folder-header').forEach(el => {
        el.addEventListener('mouseenter', add); el.addEventListener('mouseleave', rem);
      });
    }, 400);
    return () => {
      lenis.destroy(); cancelAnimationFrame(aid);
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafCursorRef.current); clearTimeout(t);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" ref={dotRef} />
      <div id="cursor-ring" ref={ringRef} />

      <div className="exp-page" style={{ height: pageH }}>

        {/* Navbar */}
        <nav id="navbar" className="scrolled" style={{ zIndex: 300 }}>
          <div className="logo"><Link to="/" style={{ color:'inherit', textDecoration:'none' }}>H<span>.</span></Link></div>
          <div className="nav-links"><Link to="/">← Back to Home</Link></div>
          <div className="nav-actions mobile-only-back">
            <Link to="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--text-primary)", textDecoration: "none", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: "20px" }}>← Back</Link>
          </div>
        </nav>

        {/* Hero */}
        <motion.div className="exp-hero" style={{ opacity: heroOpacity }}>
          <div className="ghost-number-section" aria-hidden="true" style={{ opacity:0.06, userSelect:'none' }}>05</div>
          <h1 className="section-heading">The <span className="italic highlight">Journey.</span></h1>
          <p className="exp-subtitle">// Scroll to flip through the files</p>
          <div className="exp-arrow">↓</div>
        </motion.div>

        {/* ── Fixed overlay: the whole "filing cabinet" ── */}
        <motion.div
          className="exp-overlay"
          style={{ opacity: overlayOpacity, pointerEvents: overlayPtr }}
        >
          {/* Cabinet label */}
          <div className="cabinet-label">
            <span className="cabinet-tag">CHAPTER 05</span>
            <span className="cabinet-title">Work & Leadership</span>
            <div className="cabinet-line" />
          </div>

          {/* The stacked folder pile */}
          <div className="folder-stack" style={{ position: 'relative' }}>
            {/* Dynamic Physical tab shape that stays on top and updates with active folder */}
            <div className="folder-physical-tab">
              <span className="ptab-num">F-0{activeIndex + 1}</span>
              <span className="ptab-name">{experiences[activeIndex].company}</span>
            </div>
            
            {experiences.map((exp, i) => (
              <div key={i} onClick={() => goTo(i)}>
                <FolderItem
                  exp={exp} i={i} total={total}
                  scrollY={scrollY} zoneStart={zoneStart}
                />
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </>
  );
}
