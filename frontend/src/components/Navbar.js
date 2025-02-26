import React, { useState } from "react";
import { Link, useNavigate, useLocation} from "react-router-dom";
import { Menu, X } from "lucide-react";
import "../styles/Navbar.css";
const Navbar = ({ setToken }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const isActive = (path) => location.pathname === path;
    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("authHeader");
        localStorage.removeItem("barCode");
        localStorage.removeItem("userID");
        setToken(null);
        navigate("/login");
    };

    return (
        <div className="nav-container">
          {/* Top navigation bar */}
          <nav className="top-nav">
            <div className="nav-content">
              <div className="nav-brand">
                <Link to="/" className="brand-link">
                  <span className="brand-icon">CS</span>
                  <span className="brand-text">ClubSync</span>
                </Link>
              </div>
              
              {/* Desktop Navigation Links */}
              <div className="desktop-links">
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  My Classes
                </Link>
                <Link to="/upcoming-classes" className={`nav-link ${isActive('/upcoming-classes') ? 'active' : ''}`}>
                  Schedule
                </Link>
                <Link to="/my-preferences" className={`nav-link ${isActive('/my-preferences') ? 'active' : ''}`}>
                  Preferences
                </Link>
                <Link to="/logout" className="nav-link logout" onClick={handleLogout}>
                  Logout
                </Link>
              </div>
              
              {/* Mobile Menu Button */}
              <button className="menu-button" onClick={toggleMenu} aria-label="Toggle menu">
                <svg 
                  viewBox="0 0 24 24" 
                  width="24" 
                  height="24" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  {isMenuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <>
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </nav>
          
          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="mobile-menu">
              <Link to="/" className={`mobile-link ${isActive('/') ? 'active' : ''}`} onClick={toggleMenu}>
                My Classes
              </Link>
              <Link to="/upcoming-classes" className={`mobile-link ${isActive('/upcoming-classes') ? 'active' : ''}`} onClick={toggleMenu}>
                Schedule
              </Link>
              <Link to="/my-preferences" className={`mobile-link ${isActive('/my-preferences') ? 'active' : ''}`} onClick={toggleMenu}>
                Preferences
              </Link>
              <Link to="/logout" className="mobile-link logout" onClick={handleLogout}>
                Logout
              </Link>
            </div>
          )}
          
     
        </div>
      );
};

export default Navbar;