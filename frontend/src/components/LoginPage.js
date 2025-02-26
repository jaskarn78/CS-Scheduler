import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://192.168.7.200:3000/api"
      : "/api";

  const generateAuthorizationHeader = (username, password) => {
    return `Basic ${btoa(`${username}:${password}`)}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      const data = await response.json();
      if (response.ok) {
        const authHeader = generateAuthorizationHeader(username, password);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userID", data.userID);
        localStorage.setItem("authHeader", authHeader);
        localStorage.setItem("barCode", data.barcode);
        onLoginSuccess(data.token, authHeader);
        setError("");
        navigate("/", { replace: true });
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-container">
          <div className="logo">CS</div>
        </div>
        
        <h1 className="title">ClubSync</h1>
        <p className="subtitle">Welcome back</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-container">
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              {/* <a href="#" className="forgot-password">Forgot password? Too Bad :)</a> */}
            </div>
            <div className="input-container">
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        
        <p className="signup-prompt">
          Don't have an account? <a href="">Too Bad :)</a>
        </p>
      </div>
      
      <div className="copyright">
        © 2025 ClubSync. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;