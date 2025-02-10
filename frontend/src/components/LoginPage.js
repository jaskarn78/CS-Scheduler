import React, { useState } from "react";
import "./LoginPage.css"; // Import styles

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Determine the API base URL dynamically based on the environment
  const API_BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://192.168.7.200:3000/api" // Backend server during development
      : "/api"; // Use relative path for production

  // Function to generate the Base64 encoded Authorization header
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
      });

      const data = await response.json();

      if (response.ok) {
        // Generate the authorization header
        const authHeader = generateAuthorizationHeader(username, password);

        // Store the token and authorization header in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("authHeader", authHeader);

        // Pass the token to the parent component
        onLoginSuccess(data.token, authHeader);
        setError("");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    
    <div className="login-container">
    {/* Login Form */}
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Login
        </button>
      </form>
    </div>
    </div>
  );
};

export default LoginPage;