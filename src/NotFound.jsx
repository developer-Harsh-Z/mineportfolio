import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

export default function NotFound() {
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
  }, []);

  return (
    <>
      <div id="cursor-dot" ref={dotRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>

      <nav id="navbar">
        <div className="logo"><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>H<span>.</span></Link></div>
        <div className="nav-links">
          <Link to="/">Return to World</Link>
        </div>
      </nav>

      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 2rem' }}>
        <div className="eyebrow">
          <div className="eyebrow-line"></div>
          <div className="eyebrow-text">// Error 404</div>
        </div>
        <h1 className="headline" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          You've wandered off <br/>
          the <span className="italic highlight">map</span>.
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '3rem', fontFamily: 'var(--font-mono)' }}>
          This page does not exist in Harsh's world. Let's get you back to the main path.
        </p>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 24px',
          background: 'var(--bg-secondary)',
          color: 'var(--accent)',
          border: '1px solid rgba(255, 61, 0, 0.3)',
          fontFamily: 'var(--font-mono)',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontSize: '0.85rem'
        }}>
          ← Return Home
        </Link>
      </section>
    </>
  );
}
