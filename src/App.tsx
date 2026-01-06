import { useEffect, useState } from 'react';
import { getQuestion, submitResponse, getStudent } from './services/api';
import './App.css'; 

interface Option { id: string; text: string; }
interface Question { id: string; text: string; options: Option[]; }

function App() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  
  // No more hardcoded ID! We store the real one here.
  const [childId, setChildId] = useState<string | null>(null);

  // 1. Initialize App: Get User -> Then Get Question
  const init = async () => {
    setLoading(true);
    try {
      // Get the student first
      const student = await getStudent();
      if (student && student.id) {
        console.log("✅ Logged in as:", student.name, student.id);
        setChildId(student.id);
        
        // Now get the first question
        await fetchNewQuestion();
      } else {
        alert("No student found in DB. Run seed!");
      }
    } catch (error) {
      console.error("Init failed:", error);
    }
    setLoading(false);
  };

  const fetchNewQuestion = async () => {
    try {
      const data = await getQuestion();
      setQuestion(data);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = async (optionId: string) => {
    if (!question || !childId) return;
    try {
      await submitResponse(childId, question.id, optionId);
      alert("Answer Saved! Score Updated. 🌟");
      await fetchNewQuestion();
    } catch (error) {
      console.error("Error saving answer:", error);
      alert("Error saving answer. Check console.");
    }
  };

  if (loading) return <h2 className="loading">Loading User... ⏳</h2>;
  if (!question) return <h2 className="error">No Questions Found! ❌</h2>;

  return (
    <div className="container">
      <h1>🤖 Aadya Assessment</h1>
      
      <div className="question-card">
        <h2 className="question-text">{question.text}</h2>
        
        <div className="options-grid">
          {question.options && question.options.length > 0 ? (
            question.options.map((option) => (
              <button
                key={option.id}
                className="option-button"
                onClick={() => handleAnswer(option.id)}
              >
                {option.text}
              </button>
            ))
          ) : (
            <p style={{ color: 'red' }}>⚠️ Error: This question has no options.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;