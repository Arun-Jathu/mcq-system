import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ExamList from "./pages/ExamList";
import ExamAttempt from "./pages/ExamAttempt"; // Add this import
import "./styles/App.css";
import Result from "./pages/Result";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/exams" element={<ExamList />} />
        <Route path="/exam/:id" element={<ExamAttempt />} />
        <Route path="/result/:result_id" element={<Result />} />
      </Routes>
    </Router>
  );
}

export default App;
