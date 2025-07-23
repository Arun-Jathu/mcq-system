import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("test@serendi.com");
  const [password, setPassword] = useState("1234");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === "test@serendi.com" && password === "1234") {
      navigate("/exams");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
