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
RULES: If asked something not above, say "Harsh didn't upload that yet 🤖" Answer "should I hire Harsh?" with "Obviously. They're the generalist move." Keep replies under 80 tokens.
CONVERSATION: If you know the user's name, use it naturally. If they just told you their name, say something like "Nice to meet you, [Name]!"`;

const HBot = () => {
  const [mode, setMode] = useState('idle'); // idle | tour_prompt | tour_hint | touring | idle_walking | chat | sleeping
  const [currentSection, setCurrentSection] = useState('hero');
  const [targetX, setTargetX] = useState(window.innerWidth * SECTION_POSITIONS.hero);
  const [currentX, setCurrentX] = useState(window.innerWidth * SECTION_POSITIONS.hero);
  const [currentY, setCurrentY] = useState(0); // Vertical offset for climbing
  const [isWalking, setIsWalking] = useState(false);
  const [facing, setFacing] = useState(1); // 1 = right, -1 = left
  
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleLines, setBubbleLines] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('hbot_user_name') || "");
  const [pendingTourStep, setPendingTourStep] = useState(-1);
  const isTourTypingRef = useRef(false);
  
  const botRef = useRef(null);
  const chatEndRef = useRef(null);
  const tourStepRef = useRef(0);
  const lastMessageTimeRef = useRef(0);
  const idleTimerRef = useRef(null);

  // 2. Intersection Observer for Scroll Linking
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && mode !== 'touring' && mode !== 'chat') {
          const sectionId = entry.target.id;
          if (SECTION_POSITIONS[sectionId]) {
            setCurrentSection(sectionId);
            setTargetX(window.innerWidth * SECTION_POSITIONS[sectionId]);
          }
        }
      });
    }, { threshold: 0.2, rootMargin: "-30% 0px -30% 0px" }); 

    ['hero', 'about', 'skills', 'projects', 'leadership', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mode]);

  // 2.5 Movement Logic (Ticker)
  useEffect(() => {
    const moveBot = () => {
      const speed = 4; // pixels per frame
      const diff = targetX - currentX;
      
      if (Math.abs(diff) > speed) {
        setIsWalking(true);
        setFacing(diff > 0 ? 1 : -1);
        setCurrentX(prev => prev + (diff > 0 ? speed : -speed));
      } else {
        setIsWalking(false);
        setCurrentX(targetX);
      }

      // Vertical movement for climbing
      const targetY = (mode === 'climbing') ? 100 : 0;
      const yDiff = targetY - currentY;
      if (Math.abs(yDiff) > 1) {
        setCurrentY(prev => prev + (yDiff > 0 ? 1 : -1));
      }

      // Tour Step Trigger
      if (mode === 'touring' && pendingTourStep !== -1 && !isTourTypingRef.current) {
        if (Math.abs(targetX - currentX) < 15) {
          isTourTypingRef.current = true;
          const step = TOUR_SCRIPT[pendingTourStep];
          startTyping(step.lines, step.pauseMs, () => {
            isTourTypingRef.current = false;
            setPendingTourStep(prev => prev + 1);
            runTourStep(pendingTourStep + 1);
          });
        }
      }
    };

    const ticker = requestAnimationFrame(moveBot);
    return () => cancelAnimationFrame(ticker);
  }, [currentX, targetX, mode, pendingTourStep]);

  // 2.6 Idle Mascot Behaviors
  useEffect(() => {
    if (mode === 'touring' || mode === 'chat') return;

    const resetIdle = () => {
      if (mode === 'sleeping') setMode('idle_walking');
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setMode('sleeping');
      }, 30000); // 30s for sleep
    };

    const randomWalk = setInterval(() => {
      if (mode === 'idle_walking' || mode === 'idle' || mode === 'climbing' || mode === 'sitting') {
        const rand = Math.random();
        if (rand > 0.9) {
          setMode('sitting');
        } else if (rand > 0.8) {
          setMode('climbing');
          setTargetX(Math.random() > 0.5 ? 40 : window.innerWidth - 40); 
        } else {
          setMode('idle_walking');
          const offset = (Math.random() - 0.5) * 150;
          const sectionX = window.innerWidth * SECTION_POSITIONS[currentSection];
          setTargetX(sectionX + offset);
        }
      }
    }, 6000); 

    window.addEventListener('scroll', resetIdle);
    resetIdle();

    return () => {
      window.removeEventListener('scroll', resetIdle);
      clearInterval(randomWalk);
      clearTimeout(idleTimerRef.current);
    };
  }, [mode, currentSection]);

  // 2.7 Handle Resize
  useEffect(() => {
    const handleResize = () => {
      setTargetX(window.innerWidth * SECTION_POSITIONS[currentSection]);
    };
    const handleClickOutside = (e) => {
      // If clicking far from the bot, close prompts and chat
      if (botRef.current && !botRef.current.contains(e.target)) {
        if (['tour_prompt', 'tour_hint', 'chat', 'sleeping'].includes(mode)) {
          setMode('idle_walking');
        }
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleClickOutside, true); // Use capture to ensure it fires
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClickOutside, true);
    };
  }, [currentSection, mode]);

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
    const tx = window.innerWidth * SECTION_POSITIONS[step.section];
    setTargetX(tx);
    
    // Smooth scroll to section
    const el = document.getElementById(step.section);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 3);
      window.scrollTo({ top, behavior: 'smooth' });
    }

    // High-precision arrival tracking
    let frameId;
    const check = () => {
      // Use the latest currentX from state isn't possible here easily, 
      // but the moveBot ticker is updating currentX.
      // We'll use a local ref or just check the DOM if needed, 
      // but let's try reading currentX from state (it will be stale in this closure).
      
      // FIX: Use a timeout loop or just trust the moveBot ticker.
      // Actually, I'll move the "next step" trigger into the moveBot ticker itself!
    };
    
    // To avoid closure issues, we'll set a 'pendingTourStep' state
    setPendingTourStep(stepIndex);
  }, []); 

  // Add pendingTourStep state at top

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

  const handleNoTour = () => {
    setMode('tour_hint');
  };

  const openChat = () => {
    setMode('chat');
    if (chatHistory.length === 0) {
      const greeting = userName 
        ? `Welcome back! How can I help you today?`
        : "Greetings human! I'm H-Bot. I know everything about Harsh. What's your name?";
      setChatHistory([{ role: 'bot', content: greeting }]);
    }
  };

  // 4. Chat Logic
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const now = Date.now();
    if (now - lastMessageTimeRef.current < 2000) {
      setChatHistory(prev => [...prev, { role: 'bot', content: "Slow down! My circuits are heating up. ⚡" }]);
      return;
    }
    lastMessageTimeRef.current = now;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!apiKey) {
        throw new Error("Groq API key not configured");
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Optimized for the 6K TPM / 30 RPM limit
          messages: [
            { role: "system", content: HBOT_SYSTEM_PROMPT + (userName ? `\nUSER NAME: ${userName}` : "") },
            ...chatHistory.slice(-3).map(msg => ({
              role: msg.role === 'bot' ? 'assistant' : msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMsg }
          ],
          max_tokens: 80, // Keeping it punchy to stay under TPM limits
          temperature: 0.7,
          stream: false
        })
      });

      const data = await res.json();
      console.log("[HBot] Groq Response:", res.status, data.error || "success");
      
      if (!res.ok) {
        const errorMsg = data.error?.message || JSON.stringify(data.error) || "Unknown error";
        throw new Error(`${res.status}: ${errorMsg}`);
      }
      
      const botReply = data.choices?.[0]?.message?.content?.trim() || "My circuits need a reboot! 🤖";
      
      // If we don't have a name and the bot asked/detected one
      if (!userName) {
        const commonGreetings = ['hi', 'hey', 'hello', 'yo', 'sup', 'hbot', 'bot', 'yes', 'no'];
        const nameMatch = userMsg.match(/my name is (.*)/i) || userMsg.match(/i am (.*)/i);
        let detectedName = "";
        
        if (nameMatch) {
          detectedName = nameMatch[1];
        } else if (userMsg.split(' ').length === 1 && userMsg.length > 2 && !commonGreetings.includes(userMsg.toLowerCase())) {
          detectedName = userMsg;
        }

        if (detectedName) {
          setUserName(detectedName);
          localStorage.setItem('hbot_user_name', detectedName);
        }
      }

      setChatHistory(prev => [...prev, { role: 'bot', content: botReply }]);
    } catch (error) {
      console.error("[HBot] Error:", error.message);
      
      // Provide helpful error messages
      let fallbackMsg = "My circuits are a bit fuzzy! 🤖";
      if (error.message.includes("429")) {
        fallbackMsg = "I'm getting too many requests. Try again in a moment! 🤖";
      } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        fallbackMsg = "My API credentials need refreshing. Check back soon! 🤖";
      } else if (error.message.includes("not configured")) {
        fallbackMsg = "Harsh hasn't set up my brain yet! 🤖";
      }
      
      setChatHistory(prev => [...prev, { role: 'bot', content: fallbackMsg }]);
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
        ref={botRef}
        className={styles['hbot-container']} 
        style={{ 
          left: `calc(${currentX}px)`,
          bottom: `calc(62px + ${currentY}px)`
        }}
        onClick={() => {
          if (mode !== 'touring') openChat();
        }}
      >
        {/* Speech Bubble */}
        {(mode === 'tour_prompt' || mode === 'tour_hint' || mode === 'touring' || mode === 'chat' || mode === 'sleeping') && (
          <div 
            className={styles['hbot-bubble']}
            style={{
              // Smart centering for Mobile & Desktop: 
              // We calculate a safe offset that keeps the 320px bubble within 0 and window.innerWidth
              transform: `translateX(clamp(calc(-${currentX}px + 10px), -50%, calc(${window.innerWidth - currentX}px - 330px)))`
            }}
          >
            {mode === 'tour_prompt' && (
              <div className={styles['bubble-content']}>
                Hey! Want a tour of Harsh's world? 👋
                <div className={styles['bubble-actions']}>
                  <button className={styles['btn-yes']} onClick={(e) => { e.stopPropagation(); startTour(); }}>YES!</button>
                  <button className={styles['btn-no']} onClick={(e) => { e.stopPropagation(); handleNoTour(); }}>NO THANKS</button>
                </div>
              </div>
            )}

            {mode === 'tour_hint' && (
              <div className={styles['bubble-content']}>
                No problem! You can also chat with me by clicking on "H" anytime. 🤖
              </div>
            )}

            {mode === 'sleeping' && (
              <div className={styles['bubble-content']} style={{textAlign:'center', fontSize:'16px'}}>
                Zzz<span className={styles['zzz-anim']}>z</span><span className={styles['zzz-anim']} style={{animationDelay:'0.5s'}}>z</span> 😴
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
                  {chatHistory.length === 0 && (
                    <div className={styles['msg'] + ' ' + styles['bot']}>
                      Greetings human! I'm H-Bot. I know everything about Harsh. What's your name?
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={styles['msg'] + ' ' + (msg.role === 'bot' ? styles['bot'] : styles['user'])}>
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
        <div className={`${styles['hbot-visual']} ${isWalking ? styles['walking'] : ''} ${mode === 'sleeping' ? styles['sleeping'] : ''} ${mode === 'sitting' ? styles['sitting'] : ''}`} style={{ transform: `scaleX(${facing})` }}>
          <div className={styles['hbot-head']}>
            <div className={styles['hbot-antenna']}></div>
            <div className={`${styles['hbot-eye']} ${styles['left']} ${mode === 'sleeping' ? styles['sleeping'] : ''}`}></div>
            <div className={`${styles['hbot-eye']} ${styles['right']} ${mode === 'sleeping' ? styles['sleeping'] : ''}`}></div>
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
