import React, { useState, useEffect } from "react";

const ExamHeader = ({ examTitle, timeLeft, progress }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        position: "relative",
        height: "5rem", // Placeholder height
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: "1rem",
          backgroundColor: "#4f46e5",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          height: "5rem",
          overflow: "visible",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "0 1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#f9fafb",
              margin: "0 0 0.5rem 0",
              textAlign: "center",
              whiteSpace: "normal",
            }}
          >
            {examTitle}
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dbeafe",
              fontSize: "1.125rem",
              fontWeight: 500,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{
                height: "1.5rem",
                width: "1.5rem",
                marginRight: "0.5rem",
              }}
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
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0 1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              backgroundColor: "#e0e7ff",
              borderRadius: "9999px",
              height: "0.75rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background:
                  "linear-gradient(to right, #d8b4fe, #c084fc, #a5b4fc)",
                width: `${progress}%`,
                transition: "width 0.3s ease",
                borderRadius: "6px",
                boxShadow: "0 0 8px rgba(192, 132, 252, 0.4)",
              }}
            ></div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.5rem",
              fontSize: "0.875rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#60a5fa", marginBottom: "0.25rem" }}>
              Question {indexOfFirstQuestion + 1} to{" "}
              {Math.min(indexOfLastQuestion, questions.length)} of{" "}
              {questions.length}
            </span>
            <span style={{ color: "#3b82f6" }}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHeader;
