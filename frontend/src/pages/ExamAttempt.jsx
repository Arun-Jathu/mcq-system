import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ExamAttempt.css";

function ExamAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  }, [id]);

  const handleAnswerChange = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const submission = questions.map((q) => ({
      question_id: q._id,
      selected_option: answers[q._id] || "",
    }));
    console.log("Submission data:", submission);
    try {
      const response = await axios.post(
        `/api/exams/${id}/submit`,
        { answers: submission },
        {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        }
      );
      console.log("Submission result:", response.data);
      navigate(`/result/${response.data.result_id}`);
    } catch (error) {
      console.error("Error submitting answers:", error);
      setError(
        `Submission failed. ${error.response?.statusText || error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="exam-attempt">
      <h2>Exam Questions</h2>
      {questions.map((question) => (
        <div key={question._id} className="question-item">
          <p>{question.question_text || "No question text"}</p>
          {question.options
            ? question.options.map((opt, index) => (
                <label key={index}>
                  <input
                    type="radio"
                    name={question._id}
                    value={opt}
                    onChange={(e) =>
                      handleAnswerChange(question._id, e.target.value)
                    }
                  />
                  {opt}
                </label>
              ))
            : null}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={loading || submitting}>
        Submit Answers
      </button>
    </div>
  );
}

export default ExamAttempt;
