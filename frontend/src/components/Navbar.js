import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ setToken }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setMenuOpen(!menuOpen);

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
        <nav className="bg-gray-900 text-white shadow-lg fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <h1 className="text-xl lg:text-2xl font-semibold tracking-wide text-white">
                        Club Studio Scheduler
                    </h1>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="lg:hidden text-gray-300 text-3xl focus:outline-none"
                    >
                        ☰
                    </button>

                    {/* Navigation Links */}
                    <ul className={`lg:flex lg:items-center lg:gap-8 absolute lg:static w-full lg:w-auto top-16 left-0 bg-gray-900 lg:bg-transparent transition-all duration-300 ${menuOpen ? "block py-4" : "hidden"}`}>
                        <li>
                            <Link
                                to="/"
                                className="block px-6 py-2 text-lg font-medium text-gray-200 hover:text-white transition duration-300"
                                onClick={() => setMenuOpen(false)}
                            >
                                My Classes
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/upcoming-classes"
                                className="block px-6 py-2 text-lg font-medium text-gray-200 hover:text-white transition duration-300"
                                onClick={() => setMenuOpen(false)}
                            >
                                Schedule
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/my-preferences"
                                className="block px-6 py-2 text-lg font-medium text-gray-200 hover:text-white transition duration-300"
                                onClick={() => setMenuOpen(false)}
                            >
                                Preferences
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="block px-6 py-2 text-lg font-medium text-red-400 hover:text-red-300 transition duration-300"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;