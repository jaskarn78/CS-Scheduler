import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from "./components/Profile";
import Classes from "./components/Classes";
import UpcomingClassesPage from "./components/Scheduler";

function App() {
  return (
      <Router>
          <div className="app-container">
              <h1>Club Studio Dashboard</h1>
              <Routes>
                  {/* Main Dashboard */}
                  <Route path="/" element={
                      <>
                          <Profile />
                          <Classes />
                      </>
                  } />
                  
                  {/* Upcoming Classes Page */}
                  <Route path="/upcoming-classes" element={<UpcomingClassesPage />} />
              </Routes>
          </div>
      </Router>
  );
}

export default App;