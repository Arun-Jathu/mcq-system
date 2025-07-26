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
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;

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
        navigate(`/result/${resultId}`, { replace: true });
        setTimeout(() => {
          if (window.pathname !== `/result/${resultId}`) {
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

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (error) return <div>{error}</div>;
  if (loading)
    return (
      <div className="loading-state">
        Loading questions... <span className="loader">⏳</span>
      </div>
    );
  if (submitting)
    return (
      <div className="loading-state">
        Submitting answers... <span className="loader">⏳</span>
      </div>
    );

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="exam-attempt-page-wrapper">
      <div className="exam-container">
        <div
          style={{
            position: isMobile ? "sticky" : "fixed",
            top: isMobile ? "env(safe-area-inset-top)" : 0,
            left: 0,
            right: 0,
            zIndex: 20,
            padding: isMobile ? "0.5rem" : "1.5rem",
            backgroundColor: "#4f46e5",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            height: isMobile ? "4rem" : "auto",
            overflow: "visible",
          }}
        >
          {!isMobile && (
            <h2 className="exam-title">
              Exam:{" "}
              {questions[0]?.exam_title ||
                questions[0]?.title ||
                "Untitled Exam"}
            </h2>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: isMobile ? "0" : "1rem",
            }}
          >
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
              <span style={{ fontSize: isMobile ? "1rem" : "1.25rem" }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div
            className="progress-bar-container"
            style={{
              marginTop: isMobile ? "0.5rem" : "1rem",
              width: isMobile ? "80%" : "100%",
              marginLeft: isMobile ? "auto" : "0",
              marginRight: isMobile ? "auto" : "0",
            }}
          >
            <div className="progress-bar-bg">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div
              className="progress-text"
              style={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
            >
              <span>
                Question {indexOfFirstQuestion + 1} to{" "}
                {Math.min(indexOfLastQuestion, questions.length)} of{" "}
                {questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
        <div
          className="question-section"
          style={{ paddingTop: isMobile ? "6rem" : "7rem" }}
        >
          {currentQuestions.map((question, index) => (
            <div key={question._id} className="question-item">
              <div className="question-header">
                <span className="question-number">
                  Q{indexOfFirstQuestion + index + 1}
                </span>
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
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
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
