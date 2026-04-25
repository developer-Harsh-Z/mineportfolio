import React, { useState, useEffect, useRef, useCallback } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

// ── EmailJS config ── fill these in after creating your free account at emailjs.com
const EMAILJS_SERVICE_ID  = 'service_XXXXXXX';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'template_XXXXXXX';  // e.g. 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'XXXXXXXXXXXXXXXXXXXX'; // Public Key from EmailJS dashboard

// ----------------------------------------------------
// TERMINAL OUTPUT — runs exactly once, no infinite loop
// ----------------------------------------------------
const TerminalOutput = ({ onComplete }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const fullLines = [
    "> initialising message payload...",
    "> validating fields............. ✓",
    "> encoding sentiment data........ ✓",
    "> dispatching to harsh@harshvardhansingh.me",
    "> message delivered ✓",
    "> exit code 0"
  ];

  useEffect(() => {
    let idx = 0;
    const tick = () => {
      idx++;
      setVisibleLines(idx);
      if (idx < fullLines.length) {
        timer = setTimeout(tick, 220);
      } else {
        setTimeout(() => onCompleteRef.current?.(), 500);
      }
    };
    let timer = setTimeout(tick, 220);
    return () => clearTimeout(timer);
  }, []); // ← empty dep array = runs exactly once

  return (
    <div className="terminal-output">
      {fullLines.slice(0, visibleLines).map((line, i) => (
        <div key={i} className="terminal-line">
          {line.includes('✓') ? (
            <>{line.split('✓')[0]}<span className="success-tick">✓</span>{line.split('✓')[1]}</>
          ) : line}
        </div>
      ))}
    </div>
  );
};

// ----------------------------------------------------
// MODE A: DATA FORM
// ----------------------------------------------------
const ModeA = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [intent, setIntent] = useState('Just Saying Hi');
  const [message, setMessage] = useState('');
  
  const [emailValid, setEmailValid] = useState(null);
  const [sentiment, setSentiment] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(0);
  const [avgWordLen, setAvgWordLen] = useState(0);
  const [keywords, setKeywords] = useState([]);

  const [submitting, setSubmitting] = useState(false);   // sending in progress
  const [sendState, setSendState]   = useState('idle');  // 'idle'|'sending'|'done'|'error'
  const [terminalDone, setTerminalDone] = useState(false);
  const handleTerminalComplete = useCallback(() => setTerminalDone(true), []);

  const intents = ["Job Offer", "Collaboration", "Freelance", "Just Saying Hi"];

  // Sentiment analysis & stats
  useEffect(() => {
    const text = message.toLowerCase();
    
    // Stats
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    setWordCount(words.length);
    setSentenceCount(sentences.length);
    
    if (words.length > 0) {
      const totalChars = words.reduce((acc, w) => acc + w.length, 0);
      setAvgWordLen((totalChars / words.length).toFixed(1));
    } else {
      setAvgWordLen(0);
    }

    // Sentiment
    const posWords = ['great', 'excited', 'love', 'interested', 'hello', 'hi', 'amazing', 'opportunity', 'collab', 'work', 'build'];
    const negWords = ['urgent', 'asap', 'unfortunately', 'problem', 'issue', 'sorry'];
    
    let score = 0;
    words.forEach(w => {
      if (posWords.some(p => w.includes(p))) score += 0.2;
      if (negWords.some(n => w.includes(n))) score -= 0.2;
    });
    score = Math.max(-1, Math.min(1, score));
    setSentiment(score);

    // Keywords
    const stopwords = ['the','a','an','is','are','i','you','we','and','or','but','in','on','at','to','for','of','with','my','your','it','be','have','do','this','that','was','will','can','me'];
    const meaningful = words.filter(w => !stopwords.includes(w) && w.length > 2);
    
    // Count frequencies
    const freqs = {};
    meaningful.forEach(w => freqs[w] = (freqs[w] || 0) + 1);
    
    // Sort and get top 5
    const top5 = Object.entries(freqs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
      
    setKeywords(top5);

  }, [message]);

  const validateEmail = () => {
    if (!email) {
      setEmailValid(null);
      return;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(regex.test(email));
  };

  const handleSend = async () => {
    if (!name || !emailValid || !message) {
      if (!emailValid) validateEmail();
      return;
    }

    setSubmitting(true);
    setSendState('sending');

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  name,
          from_email: email,
          intent:     intent,
          message:    message,
          sentiment:  sentiment.toFixed(2),
          to_email:   'harshvardhansingh.ds@gmail.com',
        },
        EMAILJS_PUBLIC_KEY
      );
      setSendState('done');
    } catch (err) {
      console.error('EmailJS error:', err);
      setSendState('error');
      setSubmitting(false);
    }
  };

  return (
    <div className="mode-a-container">
      <div className="form-left">
        {submitting ? (
          <div className="submitting-state">
            {sendState === 'sending' && (
              <div className="sending-indicator">
                <div className="spinner"></div>
                <span>Sending your message...</span>
              </div>
            )}
            {sendState === 'done' && (
              <>
                <TerminalOutput onComplete={handleTerminalComplete} />
                {terminalDone && (
                  <div className="terminal-success-msg">Message received. Harsh will get back to you.</div>
                )}
              </>
            )}
            {sendState === 'error' && (
              <div className="send-error">
                <div className="terminal-line">✗ Failed to send. Check your connection and try again.</div>
                <button className="run-send-btn" style={{marginTop:'16px'}} onClick={() => { setSubmitting(false); setSendState('idle'); }}>
                  ↩ try again
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="field-group">
              <input 
                type="text" 
                className="contact-input" 
                placeholder="your name here_" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            
            <div className="field-group">
              <input 
                type="email" 
                className="contact-input" 
                placeholder="your email_" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                onBlur={validateEmail}
              />
              {emailValid === true && <div className="validation-msg valid">✓ valid</div>}
              {emailValid === false && <div className="validation-msg invalid">✗ try again</div>}
            </div>

            <div className="field-group intent-group">
              <div className="intent-selector">
                {intents.map(int => (
                  <button 
                    key={int} 
                    className={`intent-pill ${intent === int ? 'selected' : ''}`}
                    onClick={() => setIntent(int)}
                  >
                    {int}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <textarea 
                className="contact-input" 
                placeholder="write your message..." 
                rows="6"
                value={message}
                onChange={e => setMessage(e.target.value)}
              ></textarea>
            </div>

            <button className="run-send-btn" onClick={handleSend}>run send_message.py</button>
          </>
        )}
      </div>

      <div className="live-viz-right">
        <div className="viz-panel-label">// live data</div>
        
        <div className="viz-card">
          <div className="viz-label">message sentiment</div>
          <div className="sentiment-bar-bg">
            <div 
              className="sentiment-bar-fill" 
              style={{
                width: `${((sentiment + 1) / 2) * 100}%`,
                backgroundColor: sentiment < -0.3 ? '#ff3d00' : sentiment > 0.3 ? '#57ff8c' : '#f5e2c0'
              }}
            ></div>
          </div>
          <div className="sentiment-score">{sentiment > 0 ? '+' : ''}{sentiment.toFixed(2)}</div>
        </div>

        <div className="viz-card">
          <div className="viz-label">word breakdown</div>
          <div className="breakdown-bars">
            <div className="breakdown-col">
              <div className="b-bar-wrap">
                <div className="b-bar" style={{ height: `${Math.min(100, (wordCount / 100) * 100)}%`, opacity: 0.9 }}></div>
              </div>
              <div className="b-label">words</div>
            </div>
            <div className="breakdown-col">
              <div className="b-bar-wrap">
                <div className="b-bar" style={{ height: `${Math.min(100, (sentenceCount / 20) * 100)}%`, opacity: 0.6 }}></div>
              </div>
              <div className="b-label">sentences</div>
            </div>
            <div className="breakdown-col">
              <div className="b-bar-wrap">
                <div className="b-bar" style={{ height: `${Math.min(100, (avgWordLen / 10) * 100)}%`, opacity: 0.4 }}></div>
              </div>
              <div className="b-label">avg len</div>
            </div>
          </div>
        </div>

        <div className="viz-card">
          <div className="viz-label">extracted keywords</div>
          <div className="keywords-wrap">
            {keywords.length > 0 ? (
              keywords.map(kw => <span key={kw} className="keyword-tag">{kw}</span>)
            ) : (
              <span className="keyword-empty">// start typing...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// MODE B: VOICEMAIL
// ----------------------------------------------------
const ModeB = () => {
  const [recordingState, setRecordingState] = useState('idle'); // idle, recording, review, submitted
  const [time, setTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [liveWord, setLiveWord] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const reqFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioUrlRef = useRef('');
  const audioRef = useRef(null);
  
  const recognitionRef = useRef(null);

  // Formatting timer
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    let timer;
    if (recordingState === 'recording') {
      timer = setInterval(() => {
        setTime(prev => {
          if (prev >= 90) {
            stopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [recordingState]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) setTranscript(prev => prev + ' ' + finalTrans);
        setLiveWord(interimTrans);
      };
    }
  }, []);

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      reqFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = '#0d0b09';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ff3d00';
      ctx.beginPath();
      
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      
      for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height/2);
      ctx.stroke();
    };
    draw();
  };

  const drawIdleWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d0b09';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(240,232,216,0.2)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();
  };

  useEffect(() => {
    if (recordingState === 'idle') drawIdleWaveform();
  }, [recordingState]);

  const startRecording = async () => {
    setTranscript('');
    setLiveWord('');
    setTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = e => {
        if(e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioUrlRef.current = URL.createObjectURL(audioBlob);
      };

      mediaRecorderRef.current.start();
      if (recognitionRef.current) recognitionRef.current.start();
      setRecordingState('recording');
      drawWaveform();

    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access is needed for this mode.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    if (recognitionRef.current) recognitionRef.current.stop();
    cancelAnimationFrame(reqFrameRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    
    setRecordingState('review');
  };

  const handleStartOver = () => {
    setRecordingState('idle');
    setTranscript('');
    setLiveWord('');
    setTime(0);
    audioUrlRef.current = '';
  };

  const handleSubmit = () => {
    setRecordingState('submitted');
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) audioRef.current.play();
      else audioRef.current.pause();
    }
  };

  return (
    <div className="mode-b-container">
      <div className="cassette">
        <div className="cassette-window"></div>
        <div className={`cassette-reel left ${recordingState === 'recording' ? 'spinning fast' : recordingState === 'review' ? 'paused' : 'spinning slow'}`}></div>
        <div className={`cassette-reel right ${recordingState === 'recording' ? 'spinning fast' : recordingState === 'review' ? 'paused' : 'spinning slow'}`}></div>
        <div className="cassette-label">TO: HARSH</div>
        {recordingState === 'submitted' && (
          <div className="wax-seal-overlay">
            <svg className="seal-circle" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45"></circle>
            </svg>
            <div className="seal-h">H</div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="waveform-canvas" width="480" height="60"></canvas>

      {recordingState === 'idle' || recordingState === 'recording' ? (
        <div className="recording-controls">
          <button 
            className={`record-btn ${recordingState === 'recording' ? 'pulsing' : ''}`}
            onClick={recordingState === 'idle' ? startRecording : stopRecording}
          >
            <div className={`inner-dot ${recordingState === 'recording' ? 'square' : ''}`}></div>
          </button>
          <div className={`timer ${time >= 80 ? 'warning' : ''}`}>{formatTime(time)}</div>

          <div className="live-transcript-wrap">
            <div className="viz-panel-label">// live transcript {!recognitionRef.current && "(available in Chrome)"}</div>
            <div className="transcript-live-text">
              <span className="final-trans">{transcript}</span>
              <span className="interim-trans">{liveWord}</span>
            </div>
          </div>
        </div>
      ) : recordingState === 'review' ? (
        <div className="review-section">
          <div className="review-header">
            <button className="start-over-btn" onClick={handleStartOver}>× start over</button>
          </div>
          
          <div className="review-playback">
            <button className="play-btn" onClick={playAudio}></button>
            <div className="playback-info">
              <div className="playback-label">recorded: {formatTime(time)}</div>
            </div>
            <audio ref={audioRef} src={audioUrlRef.current}></audio>
          </div>

          <div className="review-transcript">
            <div className="viz-panel-label">// auto-transcribed</div>
            <textarea 
              className="contact-input" 
              rows="4" 
              value={transcript} 
              onChange={e => setTranscript(e.target.value)}
            ></textarea>
          </div>

          <div className="review-fields">
             <input 
                type="text" 
                className="contact-input" 
                placeholder="your name here_" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
              <input 
                type="email" 
                className="contact-input" 
                placeholder="your email_" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
              />
          </div>

          <button className="seal-send-btn" onClick={handleSubmit}>seal & send</button>
        </div>
      ) : (
        <div className="success-msg">Sent. Harsh will hear your voice.</div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------
export default function Contact() {
  const [selectedMode, setSelectedMode] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    const elements = sectionRef.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [selectedMode]); // re-run when mode changes so new elements get observed

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      <div className="chapter-label scroll-reveal">
        <span>Chapter 05 — Let's Talk</span>
      </div>
      
      {!selectedMode ? (
        <div className="mode-picker scroll-reveal">
          <h2 className="contact-heading">How do you want to reach me?</h2>
          <div className="mode-cards">
            
            <div className="mode-card" onClick={() => setSelectedMode('dataform')}>
              <div className="card-icon bouncing-bars">
                <span></span><span></span><span></span>
              </div>
              <h3 className="card-label">The Data Form</h3>
              <p className="card-subline">Your words, visualised live</p>
              <span className="pill-tag">[keyboard]</span>
            </div>

            <div className="mode-card" onClick={() => setSelectedMode('voicemail')}>
              <div className="card-icon spinning-reels">
                <div className="reel"></div>
                <div className="reel"></div>
              </div>
              <h3 className="card-label">The Voicemail</h3>
              <p className="card-subline">Record. Transcribe. Send.</p>
              <span className="pill-tag">[microphone]</span>
            </div>

          </div>
        </div>
      ) : (
        <div className="selected-mode-wrapper">
           <button className="back-btn" onClick={() => setSelectedMode(null)}>← Back to modes</button>
           {selectedMode === 'dataform' ? <ModeA /> : <ModeB />}
        </div>
      )}

      <div className="social-links contact-socials scroll-reveal">
        <a href="https://github.com/harshvardhansingh" target="_blank" rel="noreferrer">GitHub ↗</a>
        <a href="https://linkedin.com/in/harshvardhansingh775" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href="./Harsh_Resume.pdf" target="_blank" rel="noreferrer">Resume ↗</a>
      </div>
    </section>
  );
}

