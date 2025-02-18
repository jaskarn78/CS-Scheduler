import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // 🔥 FIX: useNavigate() inside a component wrapped with <Router>

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
                credentials: "include" // Allow cookies and CORS authentication
            });

            const data = await response.json();
            if (response.ok) {
                const authHeader = generateAuthorizationHeader(username, password);
                localStorage.setItem("token", data.token);
                localStorage.setItem("userID", data.userID)
                localStorage.setItem("authHeader", authHeader);
                localStorage.setItem("barCode", data.barcode);
                onLoginSuccess(data.token, authHeader);
                setError("");

                // 🔥 FIX: Navigate to home after login
                navigate("/", { replace: true });
            } else {
                setError(data.message || "Invalid credentials");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="login-container">
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