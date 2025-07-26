import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import "../styles/Result.css";

function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Invalid result ID");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/exams/result/${id}`, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        console.log(
          "Full Result data:",
          JSON.stringify(response.data, null, 2)
        );
        setResult(response.data);
        if (response.data.score > 0) setShowConfetti(true); // Trigger confetti on passing score
      } catch (error) {
        console.error("Error fetching result:", error);
        setError(
          `Failed to load result. ${
            error.response?.statusText || error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleBackToExams = () => navigate("/exams");
  const handleRetryExam = () => {
    if (result?.exam_id) {
      navigate(`/exam/${result.exam_id}`);
    } else {
      setError("No exam ID available to retry");
    }
  };

  if (loading)
    return (
      <div>
        Loading results... <span className="loader">⏳</span>
      </div>
    );
  if (error) return <div>{error}</div>;
  if (!result) return <div>No result data available</div>;

  const totalQuestions =
    result.totalQuestions || (result.answers ? result.answers.length : 0);
  const correctAnswers =
    result.score || result.answers?.filter((a) => a.is_correct).length || 0;
  const progress =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const reviewData = result.answers || [];

  return (
    <div className="result-page-wrapper">
      {showConfetti && <Confetti numberOfPieces={100} recycle={false} />}
      <div className="result-container">
        <div className="result-header">
          <div className="header-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="header-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="result-title">Quiz Completed!</h2>
          <div className="score-section">
            <div className="progress-ring" style={{ "--progress": progress }}>
              <svg>
                <circle className="ring-bg" />
                <circle className="ring-progress" />
              </svg>
              <span className="score-value">
                {correctAnswers}
                <span className="total-score">/{totalQuestions}</span>
              </span>
            </div>
            <p className="score-text">Your Score</p>
          </div>
        </div>
        <div className="result-body">
          <h3 className="review-title">Question Review</h3>
          <div className="review-container">
            {reviewData.map((q, index) => {
              const question = q.question_id || {};
              const isCorrect =
                q.is_correct !== undefined ? q.is_correct : false;
              return (
                <div
                  key={index}
                  className={`review-card ${isCorrect ? "correct" : "wrong"}`}
                >
                  <div className="card-header">
                    <span className="card-number">Q{index + 1}</span>
                    <h4 className="card-question">
                      {question.question_text || `Question ${index + 1}`}
                    </h4>
                  </div>
                  <p className="card-answer">
                    Your Answer:{" "}
                    <span>{q.selected_option || "Unanswered"}</span>
                  </p>
                  <p className="card-correct">
                    Correct Answer:{" "}
                    <span>{question.correct_option || "Not provided"}</span>
                  </p>
                </div>
              );
            })}
          </div>
          <div className="button-section">
            <button onClick={handleBackToExams} className="back-button">
              Back to Exams
            </button>
            <button onClick={handleRetryExam} className="retry-button">
              Retry Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
