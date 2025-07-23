import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Result.css";

function Result() {
  const { result_id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/exams/result/${result_id}`, {
        // Adjust endpoint if needed
        headers: { "X-Requested-With": "XMLHttpRequest" },
      })
      .then((response) => {
        console.log("Result data:", response.data);
        setResult(response.data);
      })
      .catch((error) => {
        console.error("Error fetching result:", error);
        setError(
          `Failed to load result. ${
            error.response?.statusText || error.message
          }`
        );
      })
      .finally(() => setLoading(false));
  }, [result_id]);

  if (error) return <div>{error}</div>;
  if (loading) return <div>Loading result...</div>;

  return (
    <div className="result">
      <h2>Exam Result</h2>
      {result && (
        <p>
          Your score: {result.score} out of{" "}
          {result.totalQuestions || result.answers.length}
        </p>
      )}
    </div>
  );
}

export default Result;
