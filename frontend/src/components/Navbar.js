import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContainer}>
                <h1 style={styles.brand}>CS Scheduler</h1>
                <button style={styles.menuButton} onClick={toggleMenu}>
                    ☰
                </button>
                <ul style={{ ...styles.navLinks, display: menuOpen ? "flex" : "none" }}>
                    <li><Link to="/" style={styles.navItem}>Home</Link></li>
                    <li><Link to="/upcoming-classes" style={styles.navItem}>Schedule</Link></li>
                </ul>
            </div>
        </nav>
    );
};

// CSS Styling
const styles = {
    navbar: {
        backgroundColor: "#007bff",
        padding: "10px 20px",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
    },
    navContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "900px",
        margin: "0 auto",
    },
    brand: {
        color: "#fff",
        fontSize: "20px",
    },
    menuButton: {
        backgroundColor: "transparent",
        color: "#fff",
        fontSize: "24px",
        border: "none",
        cursor: "pointer",
        display: "none", // Will be shown in mobile
    },
    navLinks: {
        listStyle: "none",
        padding: 0,
        display: "flex",
        gap: "20px",
    },
    navItem: {
        color: "#fff",
        textDecoration: "none",
        fontSize: "16px",
    },
};

// Mobile Responsive Styles
const mobileStyles = `
    @media (max-width: 768px) {
        .menuButton {
            display: block !important;
        }
        .navLinks {
            flex-direction: column !important;
            background: #007bff;
            position: absolute;
            top: 50px;
            right: 0;
            width: 100%;
            text-align: center;
            padding: 10px 0;
        }
        .navLinks li {
            padding: 10px 0;
        }
    }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = mobileStyles;
document.head.appendChild(styleSheet);

export default Navbar;
