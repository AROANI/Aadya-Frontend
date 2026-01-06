import { useEffect, useState } from 'react';
import { getQuestion, submitResponse, getStudent, getScores } from './services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

interface Option { id: string; text: string; }
interface Question { id: string; text: string; options: Option[]; }
interface ScoreData { name: string; score: number; }

function App() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState<string | null>(null);
  const [viewResults, setViewResults] = useState(false);
  const [scores, setScores] = useState<ScoreData[]>([]);

  const fetchNewQuestion = async () => {
    try {
      const data = await getQuestion();
      setQuestion(data);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const student = await getStudent();
        if (student && student.id) {
          setChildId(student.id);
          // We can call this because I defined it above
          const data = await getQuestion(); 
          setQuestion(data);
        }
      } catch (error) {
        console.error("Init failed:", error);
      }
      setLoading(false);
    };

    init();
  }, []);

  const handleViewResults = async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const data = await getScores(childId);
      setScores(data);
      setViewResults(true);
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
    setLoading(false);
  };

  const handleAnswer = async (optionId: string) => {
    if (!question || !childId) return;
    try {
      await submitResponse(childId, question.id, optionId);
      alert("Answer Saved! Score Updated. 🌟");
      await fetchNewQuestion();
    } catch (error) {
      // 🛠️ FIX: We use the error variable now to satisfy the linter
      console.error("Failed to save answer:", error);
      alert("Error saving answer.");
    }
  };

  if (loading) return <h2 className="loading">Loading... ⏳</h2>;

  if (viewResults) {
    return (
      <div className="container">
        <h1>📊 Your Unique Intelligence Profile</h1>
        <div className="chart-container">
          <ResponsiveContainer>
            <BarChart data={scores}>
              <XAxis dataKey="name" stroke="#8884d8" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" radius={[5, 5, 0, 0]}>
                {scores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score > 50 ? "#4CAF50" : "#FF9800"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <button 
          className="option-button back-button" 
          onClick={() => setViewResults(false)}
        >
          ⬅ Back to Quiz
        </button>
      </div>
    );
  }

  if (!question) return <h2 className="error">No Questions Found! ❌</h2>;

  return (
    <div className="container">
      <h1>🤖 Aadya Assessment</h1>
      <div className="question-card">
        <h2 className="question-text">{question.text}</h2>
        <div className="options-grid">
          {question.options && question.options.map((option) => (
            <button
              key={option.id}
              className="option-button"
              onClick={() => handleAnswer(option.id)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
      <div className="view-results-container">
        <button 
          className="option-button view-results-button" 
          onClick={handleViewResults}
        >
          📊 View My Results
        </button>
      </div>
    </div>
  );
}

export default App;