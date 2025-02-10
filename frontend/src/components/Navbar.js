import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ setToken }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("token"); // Remove token
        localStorage.removeItem("authHeader"); // Remove auth header
        localStorage.removeItem("barCode");
        setToken(null); // Update state to force logout
        navigate("/login"); // Redirect to login page
    };

    return (
        <nav className="navigation bg-black text-white shadow-md fixed top-0 w-full z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <h1 className="text-2xl font-bold">Club Studio Scheduler</h1>
                    <div className="lg:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-white text-3xl focus:outline-none"
                        >
                            ☰
                        </button>
                    </div>
                    <ul
                        className={`${
                            menuOpen ? "block" : "hidden"
                        } absolute lg:static lg:flex lg:gap-6 w-full lg:w-auto top-16 lg:top-0 left-0 lg:left-auto text-center lg:text-left lg:p-0`}
                    >
                        <li>
                            <Link
                                to="/"
                                className="block py-2 px-4 text-lg text-white hover:text-gray-300 lg:inline"
                                onClick={() => setMenuOpen(false)}
                            >
                                My Classes
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/upcoming-classes"
                                className="block py-2 px-4 text-lg text-white hover:text-gray-300 lg:inline"
                                onClick={() => setMenuOpen(false)}
                            >
                                Schedule
                            </Link>
                        </li>
                        <li>
                            <Link
                                onClick={handleLogout}
                                className="block py-2 px-4 text-lg text-red-500 hover:text-red-300 lg:inline"
                            >
                                Logout
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;