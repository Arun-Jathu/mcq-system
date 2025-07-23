import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/ExamAttempt.css";

function ExamAttempt() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/exams/${id}/questions`);
        setQuestions(response.data);
        // Assume time is in minutes from the exam data or default to 10
        const examTime = response.data[0]?.time
          ? parseInt(response.data[0].time)
          : 10;
        setTimeLeft(examTime * 60); // Convert to seconds
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current); // Cleanup on unmount
  }, [id]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const progress =
    questions.length > 0
      ? (Object.keys(answers).length / questions.length) * 100
      : 0;

  if (loading) return <div>Loading exam...</div>;
  if (error) return <div>{error}</div>;
  if (timeLeft === 0) return <div>Time's up! Exam submitted.</div>;

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="exam-header">
          <div className="header-content">
            <h2 className="exam-title">
              Exam: {questions[0]?.title || "Untitled"}
            </h2>
            <div className="timer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="timer-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-bg">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>
                Question {Object.keys(answers).length + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
        <div className="question-section">
          {questions.map((q, index) => (
            <div key={index} className="question-item">
              <h3 className="question-text">{q.question}</h3>
              {q.options.map((option, optIndex) => (
                <div key={optIndex} className="option-item">
                  <input
                    type="radio"
                    id={`q${index}-o${optIndex}`}
                    name={`question-${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={() => handleAnswerChange(index, option)}
                  />
                  <label
                    htmlFor={`q${index}-o${optIndex}`}
                    className="option-label"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="submit-section">
          <button
            className="submit-button"
            onClick={() => console.log("Exam submitted:", answers)}
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamAttempt;
