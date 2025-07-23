import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ExamList.css";

function ExamList() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/exams", {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
      .then((response) => {
        console.log("Request URL:", response.config.url);
        console.log("Response data:", response.data);
        setExams(response.data);
      })
      .catch((error) => {
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
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (error) return <div>{error}</div>;
  if (loading) return <div>Loading exams...</div>;

  return (
    <div className="exam-list">
      <h2>Available Exams</h2>
      {exams.length === 0 ? (
        <p>No exams available.</p>
      ) : (
        exams.map((exam) => (
          <div
            key={exam._id}
            onClick={() => navigate(`/exam/${exam._id}`)}
            className="exam-item"
          >
            {exam.title}
          </div>
        ))
      )}
    </div>
  );
}

export default ExamList;
