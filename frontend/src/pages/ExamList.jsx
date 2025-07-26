import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ExamList.css";

function ExamList() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/exams");
      console.log("Request URL:", response.config.url);
      console.log("Response data:", response.data);
      setExams(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
      if (error.response) {
        setError(
          `Failed to load exams. Server returned ${error.response.status}: ${error.response.statusText}`
        );
      } else if (error.request) {
        setError("Failed to load exams. No response from server.");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const startExam = (id) => {
    navigate(`/exam/${id}`);
  };

  const handleAddExam = async () => {
    if (!title.trim()) {
      setError("Please enter a valid exam title");
      return;
    }
    try {
      const response = await axios.post("/api/create-exam", {
        title,
        difficulty,
      });
      await fetchExams(); // Refresh the exam list
      setTitle("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating exam:", error);
      setError("Failed to create exam. Please try again.");
    }
  };

  if (error) return <div>{error}</div>;
  if (loading) return <div>Loading exams...</div>;

  return (
    <div className="exam-list-page-wrapper">
      <div className="exam-list-content">
        <div className="header-section">
          <h1 className="page-title">Available Exams</h1>
          <p className="page-subtitle">
            Select an exam to begin your assessment
          </p>
          <button className="add-button" onClick={() => setShowModal(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24" /* Fixed size in pixels */
              height="24" /* Fixed size in pixels */
              fill="none"
              viewBox="0 0 24 24"
              stroke="white" /* Explicit white stroke */
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z" /* Original arrow path */
              />
            </svg>
            <span>Generate AI Questions</span>
            {/* Debug fallback: Uncomment to test */}
            {/* <div style={{ color: 'white' }}>Test</div> */}
          </button>
        </div>
        <div className="exam-grid">
          {exams.length === 0 ? (
            <p className="no-exams">No exams available.</p>
          ) : (
            exams.map((exam, index) => (
              <div key={exam._id} className="exam-card">
                <div className={`card-header ${getGradientClass(index)}`}>
                  {getSymbol(index)}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{exam.title}</h3>
                  <div className="card-detail">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="detail-icon"
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
                    {exam.questions ? exam.questions.length : 5} questions • 10
                    minutes
                  </div>
                  <div className="card-detail">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="detail-icon"
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
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1) ||
                      "Beginner"}{" "}
                    level
                  </div>
                  <div className="card-action">
                    <button
                      className="start-button"
                      onClick={() => startExam(exam._id)}
                    >
                      Start Exam
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {showModal && (
        <div className={`modal-backdrop ${showModal ? "modal-active" : ""}`}>
          <div className="modal">
            <div className="modal-content">
              <h2>Create New Exam</h2>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Mathematics"
              />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button onClick={handleAddExam}>Generate</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to dynamically assign gradients based on index
const getGradientClass = (index) => {
  const gradients = [
    "gradient-blue",
    "gradient-purple",
    "gradient-green",
    "gradient-red",
    "gradient-orange",
    "gradient-teal",
  ];
  return gradients[index % gradients.length]; // Cycle through gradients
};

// Helper function to get unique symbols based on index
const getSymbol = (index) => {
  const symbols = [
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="card-icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>, // Book
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="card-icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7C6.649 1 5 5.973 5 9c0 3.868 2.5 7 8 7a7.953 7.953 0 002.5-.5z"
      />
    </svg>, // Flask (simplified beaker)
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="card-icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7h6m-3-3v14m-4 0h8"
      />
    </svg>, // Plus/Minus (simplified calculator)
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="card-icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>, // Checkmark (simplified arrow)
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="card-icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>, // Bullseye (simplified target)
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="card-icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>, // Bookmark (simplified dots)
  ];
  return symbols[index % symbols.length]; // Cycle through symbols
};

export default ExamList;
