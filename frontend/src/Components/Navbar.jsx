import React, { useState, useContext } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { FiMenu, FiX, FiHome, FiCalendar, FiUsers, FiBriefcase, FiSend } from "react-icons/fi";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const { id } = useParams();
    const { user } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Desktop Navigation */}
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <FiCalendar className="text-white text-lg" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                                    MeetApp
                                </span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center gap-1">
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <span className="flex items-center gap-2">
                                    <FiHome className="text-sm" /> Dashboard
                                </span>
                            </NavLink>
                            <NavLink
                                to="/create"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <span className="flex items-center gap-2">
                                    <FiCalendar className="text-sm" /> Create Event
                                </span>
                            </NavLink>
                            <NavLink
                                to="/users"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <span className="flex items-center gap-2">
                                    <FiUsers className="text-sm" /> Users
                                </span>
                            </NavLink>
                            {id && (
                                <>
                                    <NavLink
                                        to={`/event/${id}/meeting`}
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`
                                        }
                                    >
                                        <span className="flex items-center gap-2">
                                            <FiUsers className="text-sm" /> Bookings
                                        </span>
                                    </NavLink>
                                    <NavLink
                                        to={`/event/${id}/company`}
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`
                                        }
                                    >
                                        <span className="flex items-center gap-2">
                                            <FiBriefcase className="text-sm" /> Companies
                                        </span>
                                    </NavLink>
                                    <NavLink
                                        to={`/event/${id}/partner-requests`}
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`
                                        }
                                    >
                                        <span className="flex items-center gap-2">
                                            <FiSend className="text-sm" /> Partner Requests
                                        </span>
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop Profile */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="relative">
                            <button
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                                onClick={() => setProfileOpen(!profileOpen)}
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                                    {user?.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">{user?.username || "User"}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role || "Member"}</p>
                                </div>
                                {profileOpen ? <MdKeyboardArrowUp className="text-gray-400" /> : <MdKeyboardArrowDown className="text-gray-400" />}
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                                    >
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                        <Link
                                            to="/"
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                        >
                                            <FiHome className="text-sm" />
                                            Dashboard
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isOpen ? <FiX className="h-6 w-6 text-gray-600" /> : <FiMenu className="h-6 w-6 text-gray-600" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100"
                    >
                        <div className="px-4 py-3 space-y-1">
                            <NavLink
                                to="/"
                                end
                                className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="flex items-center gap-3">
                                    <FiHome className="text-lg" /> Dashboard
                                </span>
                            </NavLink>
                            <NavLink
                                to="/create"
                                className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="flex items-center gap-3">
                                    <FiCalendar className="text-lg" /> Create Event
                                </span>
                            </NavLink>
                            <NavLink
                                to="/users"
                                className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="flex items-center gap-3">
                                    <FiUsers className="text-lg" /> Users
                                </span>
                            </NavLink>
                            {id && (
                                <>
                                    <NavLink
                                        to={`/event/${id}/meeting`}
                                        className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="flex items-center gap-3">
                                            <FiUsers className="text-lg" /> Bookings
                                        </span>
                                    </NavLink>
                                    <NavLink
                                        to={`/event/${id}/company`}
                                        className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="flex items-center gap-3">
                                            <FiBriefcase className="text-lg" /> Companies
                                        </span>
                                    </NavLink>
                                    <NavLink
                                        to={`/event/${id}/partner-requests`}
                                        className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="flex items-center gap-3">
                                            <FiSend className="text-lg" /> Partner Requests
                                        </span>
                                    </NavLink>
                                </>
                            )}
                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                                        {user?.username?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user?.username}</p>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
