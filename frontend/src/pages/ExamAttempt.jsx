import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ExamAttempt.css";

function ExamAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/exams/${id}/questions`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
      .then((response) => {
        console.log(
          "Full Questions data:",
          JSON.stringify(response.data, null, 2)
        );
        console.log("Questions data:", response.data);
        setQuestions(response.data);
        const examTime = response.data[0]?.time
          ? parseInt(response.data[0].time)
          : 10;
        setTimeLeft(examTime * 60);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        setError(
          `Failed to load questions. ${
            error.response?.statusText || error.message
          }`
        );
      })
      .finally(() => setLoading(false));

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [id]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const submission = questions.map((q) => ({
      question_id: q._id,
      selected_option: answers[q._id] || "wrong",
    }));
    console.log("Submission data:", submission);
    try {
      const response = await axios.post(
        `/api/exams/${id}/submit`,
        { answers: submission },
        { headers: { "X-Requested-With": "XMLHttpRequest" } }
      );
      console.log("Submission response:", response.data);
      const resultId = response.data.result_id;
      if (resultId) {
        console.log("Navigating to:", `/result/${resultId}`);
        navigate(`/result/${resultId}`, { replace: true }); // Use replace to avoid back navigation issues
        // Verify navigation by checking window.location
        setTimeout(() => {
          if (window.location.pathname !== `/result/${resultId}`) {
            console.error("Navigation failed, forcing redirect");
            navigate(`/result/${resultId}`, { replace: true });
          }
        }, 100);
      } else {
        throw new Error("No result_id returned from server");
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      setError(
        `Submission failed. ${
          error.response?.statusText || error.message || "No result_id returned"
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const progress =
    questions.length > 0
      ? (Object.keys(answers).length / questions.length) * 100
      : 0;

  if (error) return <div>{error}</div>;
  if (loading)
    return (
      <div>
        Loading questions... <span className="loader">⏳</span>
      </div>
    );
  if (submitting)
    return (
      <div>
        Submitting answers... <span className="loader">⏳</span>
      </div>
    );

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="exam-header">
          <div className="header-content">
            <h2 className="exam-title">
              Exam:{" "}
              {questions[0]?.exam_title ||
                questions[0]?.title ||
                "Untitled Exam"}
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
          {questions.map((question, index) => (
            <div key={question._id} className="question-item">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <h3 className="question-text">
                  {question.question_text ||
                    question.question ||
                    "No question text"}
                </h3>
              </div>
              {question.options && question.options.length > 0 ? (
                question.options.map((opt, optIndex) => (
                  <div key={optIndex} className="option-item">
                    <input
                      type="radio"
                      id={`q${question._id}-o${optIndex}`}
                      name={question._id}
                      value={opt}
                      checked={answers[question._id] === opt}
                      onChange={(e) =>
                        handleAnswerChange(question._id, e.target.value)
                      }
                    />
                    <label
                      htmlFor={`q${question._id}-o${optIndex}`}
                      className="option-label"
                    >
                      {opt}
                    </label>
                  </div>
                ))
              ) : (
                <p>No options available</p>
              )}
            </div>
          ))}
        </div>
        <div className="submit-section">
          <button onClick={handleSubmit} disabled={loading || submitting}>
            Submit Answers
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamAttempt;
