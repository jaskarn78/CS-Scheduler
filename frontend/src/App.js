import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from "./components/Profile";
import Classes from "./components/Classes";
import UpcomingClassesPage from "./components/Scheduler";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [authHeader,setAuthHeader] = useState(localStorage.getItem("authHeader") || null);
    const handleLoginSuccess = (authToken, authHeader) => {
        setToken(authToken);
        setAuthHeader(authHeader)
        localStorage.setItem("token", authToken);
        localStorage.setItem("authHeader", authHeader);
    };

    if (!token) {
        return (
            <Router>
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            </Router>
        );
    }

    return (
        <Router>
            <Navbar />
            <div className="app-container">
                <Routes>
                    {/* Main Dashboard */}
                    <Route
                        path="/"
                        element={
                            <>
                                <Profile />
                                <Classes />
                            </>
                        }
                    />

                    {/* Upcoming Classes Page */}
                    <Route
                        path="/upcoming-classes"
                        element={
                            <>
                                <Profile />
                                <UpcomingClassesPage />
                            </>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;