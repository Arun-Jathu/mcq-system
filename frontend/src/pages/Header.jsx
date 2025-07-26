import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = true; // Mock login state; replace with actual auth logic
  const username = "Test User"; // Mock username; replace with actual user data
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const handleLogout = () => {
    navigate("/");
  };

  const handleNav = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header-wrapper">
      <div className="header-content">
        <div className="logo-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="logo"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span className="title">QuizMaster</span>
        </div>
        <nav className={`nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <a href="#" onClick={() => handleNav("/exams")} className="nav-link">
            Exams
          </a>
          <a
            href="#"
            onClick={() => handleNav("/results")}
            className="nav-link"
          >
            Results
          </a>
          {isLoggedIn && (
            <button onClick={handleLogout} className="nav-link logout">
              Logout
            </button>
          )}
        </nav>
        <div className="header-right">
          {isLoggedIn && (
            <div className="user-profile">
              <span className="username">{username}</span>
              <div className="avatar"></div>
            </div>
          )}
          <button className="hamburger" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>
      )}
    </header>
  );
}

export default Header;
