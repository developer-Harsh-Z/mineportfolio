import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './hbot.module.css';

const SECTION_POSITIONS = {
  hero: 0.08,
  about: 0.22,
  skills: 0.38,
  projects: 0.55,
  leadership: 0.75,
  contact: 0.90
};

const TOUR_SCRIPT = [
  { section: 'hero', lines: ["Hey! I'm H-Bot 🤖", "This is Harsh's world.", "Let's explore it together. 👇"], pauseMs: 3000 },
  { section: 'about', lines: ["Chapter 01 — The Origin.", "Started with spreadsheets.", "Ended up building AI. 📖"], pauseMs: 3500 },
  { section: 'skills', lines: ["Chapter 02 — The Arsenal.", "AI · Data · Analytics · Leadership.", "Hover the cards to see depth. 👆"], pauseMs: 3000 },
  { section: 'projects', lines: ["Chapter 03 — The Work.", "Real data. Real problems.", "Real solutions. 🔥"], pauseMs: 3000 },
  { section: 'leadership', lines: ["Chapter 04 — The Leader.", "He builds AND leads.", "Clubs. Teams. Events."], pauseMs: 3000 },
  { section: 'contact', lines: ["Chapter 05 — The End.", "That's the tour! 🎉", "Click me anytime to chat. 👋"], pauseMs: 4000 }
];

const HBOT_SYSTEM_PROMPT = `You are H-Bot, a witty AI robot on harshvardhansingh.me. Short punchy sentences (max 3). Helpful nerdy energy.
ABOUT HARSH:
- Role: Data Science student, AI/ML builder, Data Analyst, Leader
- Skills: Python, Scikit-learn, TensorFlow, PyTorch, Pandas, NumPy, SQL, Power BI, Matplotlib, Seaborn
- Projects: ML Prediction Engine, Analytics Dashboard, NLP Sentiment Analyser, Data Pipeline Automation
- Leadership: Led college Data Science Club (30+ members), Project Lead ML team (5 people)
- Location: Delhi, India
RULES: If asked something not above, say "Harsh didn't upload that yet 🤖" Answer "should I hire Harsh?" with "Obviously. They're the generalist move." Keep replies under 80 tokens.`;

const HBot = () => {
  const [mode, setMode] = useState('idle'); // idle | tour_prompt | touring | idle_walking | chat
  const [currentSection, setCurrentSection] = useState('hero');
  const [targetX, setTargetX] = useState(window.innerWidth * SECTION_POSITIONS.hero);
  const [currentX, setCurrentX] = useState(window.innerWidth * SECTION_POSITIONS.hero);
  const [isWalking, setIsWalking] = useState(false);
  const [facing, setFacing] = useState(1); // 1 = right, -1 = left
  
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleLines, setBubbleLines] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const botRef = useRef(null);
  const chatEndRef = useRef(null);
  const tourStepRef = useRef(0);

  // 1. Movement Logic (Lerp)
  useEffect(() => {
    let raf;
    const animate = () => {
      setCurrentX(prev => {
        const next = prev + (targetX - prev) * 0.06;
        const diff = targetX - prev;
        
        if (Math.abs(diff) > 2) {
          setIsWalking(true);
          setFacing(diff > 0 ? 1 : -1);
        } else {
          setIsWalking(false);
        }
        return next;
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [targetX]);

  // 2. Intersection Observer for Scroll Linking
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && mode !== 'touring') {
          const sectionId = entry.target.id;
          if (SECTION_POSITIONS[sectionId]) {
            setCurrentSection(sectionId);
            setTargetX(window.innerWidth * SECTION_POSITIONS[sectionId]);
          }
        }
      });
    }, { threshold: 0.4 });

    ['hero', 'about', 'skills', 'projects', 'leadership', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mode]);

  // 3. Tour Logic
  useEffect(() => {
    if (mode === 'idle') {
      const timer = setTimeout(() => setMode('tour_prompt'), 4000);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const runTourStep = useCallback(async (stepIndex) => {
    if (stepIndex >= TOUR_SCRIPT.length) {
      setMode('idle_walking');
      return;
    }

    const step = TOUR_SCRIPT[stepIndex];
    setTargetX(window.innerWidth * SECTION_POSITIONS[step.section]);
    
    // Smooth scroll to section during tour
    const el = document.getElementById(step.section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait for arrival
    const checkArrival = setInterval(() => {
      const diff = Math.abs(currentX - (window.innerWidth * SECTION_POSITIONS[step.section]));
      if (diff < 10) {
        clearInterval(checkArrival);
        startTyping(step.lines, step.pauseMs, () => {
          tourStepRef.current++;
          runTourStep(tourStepRef.current);
        });
      }
    }, 100);
  }, [currentX]);

  const startTyping = (lines, pause, onComplete) => {
    setBubbleLines([]);
    let lineIdx = 0;
    
    const typeLine = (idx) => {
      if (idx >= lines.length) {
        setTimeout(onComplete, pause);
        return;
      }
      
      let charIdx = 0;
      const interval = setInterval(() => {
        setBubbleText(lines[idx].substring(0, charIdx + 1));
        charIdx++;
        if (charIdx === lines[idx].length) {
          clearInterval(interval);
          setBubbleLines(prev => [...prev, lines[idx]]);
          setBubbleText("");
          setTimeout(() => typeLine(idx + 1), 600);
        }
      }, 30);
    };
    
    typeLine(0);
  };

  const startTour = () => {
    setMode('touring');
    tourStepRef.current = 0;
    runTourStep(0);
  };

  // 4. Chat Logic
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://harshvardhansingh.me",
          "X-Title": "Harsh's Portfolio"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            { role: "system", content: HBOT_SYSTEM_PROMPT },
            ...chatHistory.slice(-5),
            { role: "user", content: userMsg }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      const data = await res.json();
      console.log("HBot Response:", data);
      
      if (!res.ok) throw new Error(data.error?.message || "API Error");
      
      const botReply = data.choices[0]?.message?.content || "My circuits are a bit fuzzy! 🤖";
      
      setChatHistory(prev => [...prev, { role: 'bot', content: botReply }]);
    } catch (error) {
      console.error("HBot Error:", error);
      setChatHistory(prev => [...prev, { role: 'bot', content: `Circuit Error: ${error.message} 🤖` }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  return (
    <>
      <div className={styles['hbot-floor']}></div>
      <div 
        className={styles['hbot-container']} 
        style={{ left: `${currentX}px` }}
        onClick={() => {
          if (mode !== 'touring' && mode !== 'tour_prompt') setMode('chat');
        }}
      >
        {/* Speech Bubble */}
        {(mode === 'tour_prompt' || mode === 'touring' || mode === 'chat') && (
          <div className={styles['hbot-bubble']}>
            {mode === 'tour_prompt' && (
              <div className={styles['bubble-content']}>
                Hey! Want a tour of Harsh's world? 👋
                <div className={styles['bubble-actions']}>
                  <button className={styles['btn-yes']} onClick={(e) => { e.stopPropagation(); startTour(); }}>YES!</button>
                  <button className={styles['btn-no']} onClick={(e) => { e.stopPropagation(); setMode('idle_walking'); }}>NO THANKS</button>
                </div>
              </div>
            )}

            {mode === 'touring' && (
              <div className={styles['bubble-content']}>
                {bubbleLines.map((line, i) => (
                  <div key={i} className={styles['bubble-narration']}>{line}</div>
                ))}
                {bubbleText && <div className={styles['bubble-narration']}>{bubbleText}</div>}
              </div>
            )}

            {mode === 'chat' && (
              <div className={styles['hbot-chat-container']}>
                <div className={styles['chat-header']}>
                  <div>
                    <span className={styles['header-title']}>H-Bot</span>
                    <span className={styles['header-subtitle']}>· // ask me anything</span>
                  </div>
                  <button className={styles['close-chat']} onClick={(e) => { e.stopPropagation(); setMode('idle_walking'); }}>×</button>
                </div>
                
                <div className={styles['chat-log']}>
                  <div className={styles['msg'] + ' ' + styles['bot']}>
                    I'm H-Bot. I know everything about Harsh. What's on your mind? 🤖
                  </div>
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={styles['msg'] + ' ' + styles[msg.role]}>
                      {msg.content}
                    </div>
                  ))}
                  {isTyping && (
                    <div className={styles['typing-indicator']}>
                      <span></span><span></span><span></span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form className={styles['input-row']} onSubmit={handleSendMessage}>
                  <input 
                    className={styles['chat-input']}
                    placeholder="// type here..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    autoFocus
                  />
                  <button className={styles['send-btn']} type="submit" disabled={isTyping}>→</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Robot Body */}
        <div className={`${styles['hbot-visual']} ${isWalking ? styles['walking'] : ''}`} style={{ transform: `scaleX(${facing})` }}>
          <div className={styles['hbot-head']}>
            <div className={styles['hbot-antenna']}></div>
            <div className={styles['hbot-eye'] + ' ' + styles['left']}></div>
            <div className={styles['hbot-eye'] + ' ' + styles['right']}></div>
          </div>
          <div className={styles['hbot-body']}>H</div>
          <div className={styles['hbot-legs']}>
            <div className={styles['hbot-leg'] + ' ' + styles['left']}></div>
            <div className={styles['hbot-leg'] + ' ' + styles['right']}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HBot;
