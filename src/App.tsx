/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Option { id: string; text: string; weight: number; }
interface Question { id: string; text: string; options: Option[]; }
interface ScoreData { intelligence: any; score: number; }

const DEMO_LABELS = ["Logical", "Musical", "Naturalist", "Existential", "Interpersonal", "Kinesthetic", "Linguistic", "Intrapersonal"];

function App() {
  const [childName, setChildName] = useState('');
  const [childId, setChildId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // 🚦 APP STATE
  const [appMode, setAppMode] = useState<'quiz' | 'sequence' | 'emotion' | 'motor' | 'chart'>('quiz');
  const [scores, setScores] = useState<ScoreData[]>([]);

  // --- 🧩 GAME STATE ---
  const [seqOrder, setSeqOrder] = useState<string[]>([]);
  // Paste -> Brush -> Rinse -> Teeth
  const correctSeq = ["Paste", "Brush", "Rinse", "Teeth"];

  // --- ⚡ MOTOR GAME STATE ---
  const [ballPos, setBallPos] = useState({ top: '20%', left: '20%' });
  const [motorScore, setMotorScore] = useState(0);
  const [motorTime, setMotorTime] = useState(0);

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleLogin = async () => {
    if (!childName) return alert("Name required!");
    try {
      const res = await axios.post('http://127.0.0.1:3001/children', { name: childName });
      setChildId(res.data.id);
      fetchQuestion();
    } catch (e) { 
        console.error(e); 
        alert("Login failed."); 
    }
  };

  const fetchQuestion = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3001/responses/question');
      if (res.data) {
        setCurrentQuestion(res.data);
      } else {
        setAppMode('sequence');
      }
    } catch (e) { 
        console.error(e);
        setAppMode('sequence'); 
    }
  };

  const submitAnswer = async (optionId: string) => {
    if (!childId || !currentQuestion) return;
    try {
      await axios.post('http://127.0.0.1:3001/responses', {
        childId, questionId: currentQuestion.id, optionId
      });
      fetchQuestion();
    } catch (e) { console.error(e); }
  };

  // --- GAME LOGIC ---
  const handleSeqClick = (item: string) => {
    if (!seqOrder.includes(item)) setSeqOrder([...seqOrder, item]);
  };

  const resetSequence = () => {
    setSeqOrder([]);
  }

  const checkSequence = () => {
    if (JSON.stringify(seqOrder) === JSON.stringify(correctSeq)) {
        alert("Correct! 🎉");
        setAppMode('emotion');
    } else {
        alert("Try again! Hint: Paste -> Brush -> Rinse -> Teeth");
        setSeqOrder([]);
    }
  };

  const handleEmotionAnswer = (isCorrect: boolean) => {
    if (isCorrect) alert("Great job! 😃");
    else alert("Not quite.");
    setAppMode('motor');
  };

  const moveBall = () => {
    const rTop = Math.floor(Math.random() * 80) + '%';
    const rLeft = Math.floor(Math.random() * 80) + '%';
    setBallPos({ top: rTop, left: rLeft });
  };
  
  useEffect(() => {
    if (appMode === 'motor') {
        const timer = setInterval(() => setMotorTime(t => t + 1), 1000);
        return () => clearInterval(timer);
    }
  }, [appMode]);

  const clickBall = () => {
    const newScore = motorScore + 1;
    setMotorScore(newScore);
    if (newScore >= 5) {
        alert(`Finished in ${motorTime} seconds! ⚡`);
        loadChart();
    } else {
        moveBall();
    }
  };

  const loadChart = async () => {
    if (!childId) return;
    try {
      const res = await axios.get(`http://127.0.0.1:3001/responses/score/${childId}`);
      const raw = res.data;
      const dataArray = Array.isArray(raw) ? raw : Object.keys(raw).map(k => ({ intelligence: k, score: raw[k] }));
      setScores(dataArray);
      setAppMode('chart');
    } catch (e) { 
        console.error(e); 
        alert("Could not load chart."); 
    }
  };

  return (
    <div className="app-container">
      {!childId && (
        <div className="login-container">
          <h1 className="title">👋 Aadya Assessment</h1>
          <div className="login-actions">
             <input className="login-input" placeholder="Enter Name" value={childName} onChange={e => setChildName(e.target.value)} />
             <button className="primary-btn" onClick={handleLogin}>Start 🚀</button>
          </div>
        </div>
      )}

      {/* --- QUIZ --- */}
      {childId && appMode === 'quiz' && currentQuestion && (
        <div className="card">
          <div className="question-header">
            <h2>{currentQuestion.text}</h2>
            <button className="audio-btn" onClick={() => speakText(currentQuestion.text)}>🔊</button>
          </div>
          <div>
            {currentQuestion.options.map(opt => (
              <button key={opt.id} className="option-btn" onClick={() => submitAnswer(opt.id)}>
                {opt.text} <span className="pointer-icon">👉</span>
              </button>
            ))}
          </div>
          <button className="back-btn skip-btn" onClick={() => setAppMode('sequence')}>Skip to Special Activities ➡️</button>
        </div>
      )}

      {/* --- GAME 1: SEQUENCE --- */}
      {appMode === 'sequence' && (
        <div className="game-box">
            <h2>🧩 Activity 1: Routine Logic</h2>
            <p className="instruction-text">Tap the steps in the correct order for "Brushing Teeth".</p>
            <div className="sequence-container">
                {["Teeth", "Rinse", "Brush", "Paste"].map((item) => (
                    <div 
                        key={item} 
                        className={`seq-card ${seqOrder.includes(item) ? 'seq-selected' : ''}`}
                        onClick={() => handleSeqClick(item)}
                    >
                        {item}
                        {seqOrder.includes(item) && <span className="seq-check">✅</span>}
                    </div>
                ))}
            </div>
            <div className="seq-result-text">Order: {seqOrder.join(" ➡ ")}</div>
            
            {/* 👇 REMOVED inline style, using updated CSS class */}
            <div className="login-actions">
               <button className="primary-btn view-btn" onClick={checkSequence}>Check Order</button>
               <button className="back-btn" onClick={resetSequence}>Reset</button>
            </div>
        </div>
      )}

      {/* --- GAME 2: EMOTION --- */}
      {appMode === 'emotion' && (
        <div className="game-box">
            <h2>😊 Activity 2: Emotional IQ</h2>
            <p className="instruction-text">How is this person feeling?</p>
            <div className="emotion-img">😤</div>
            <div className="emoji-grid">
                <button className="emoji-btn" onClick={() => handleEmotionAnswer(false)}>
                    😂 <span className="emoji-label">Happy</span>
                </button>
                <button className="emoji-btn" onClick={() => handleEmotionAnswer(true)}>
                    😤 <span className="emoji-label">Frustrated</span>
                </button>
                <button className="emoji-btn" onClick={() => handleEmotionAnswer(false)}>
                    😴 <span className="emoji-label">Tired</span>
                </button>
            </div>
        </div>
      )}

      {/* --- GAME 3: MOTOR --- */}
      {appMode === 'motor' && (
        <div className="game-box">
            <h2>⚡ Activity 3: Response Time</h2>
            <p className="instruction-text">Catch 5 red balls as fast as you can!</p>
            <div className="motor-area">
                <div 
                    className="target-ball"
                    // Ref used to avoid inline style warnings
                    ref={(el) => { if (el) { el.style.top = ballPos.top; el.style.left = ballPos.left; } }}
                    onClick={clickBall}
                ></div>
            </div>
            <p>Score: {motorScore} / 5</p>
        </div>
      )}

      {/* --- CHART --- */}
      {appMode === 'chart' && (
        <div className="chart-box">
          <h2 className="chart-title">Your Intelligence Profile</h2>
          <div className="chart-container">
            <div className="bars-area">
              {scores.length === 0 ? <p className="no-data-msg">No data yet.</p> : scores.map((item, idx) => {
                let name = typeof item.intelligence === 'string' ? item.intelligence : item.intelligence?.name;
                if (!name || name === "Type" || name === "Unknown") name = DEMO_LABELS[idx] || "Type " + (idx + 1);
                
                const val = item.score || 0; 
                const color = idx < 4 ? 'bar-orange' : 'bar-green';
                
                return (
                  <div key={idx} className="bar-column">
                    <div className={`bar ${color}`} ref={(el) => { if (el) el.style.height = `${Math.min(val, 100)}%`; }}>
                      <div className="tooltip">{val} pts</div>
                    </div>
                    <div className="x-label">{name}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="footer">
            <button className="back-btn" onClick={() => setAppMode('quiz')}>Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;