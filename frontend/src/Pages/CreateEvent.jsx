import React, { useEffect, useState } from "react";
import Select from "react-select";
import Axios from "../Api/Axios";
import { useNavigate } from "react-router-dom";
import { FiX, FiPlus, FiCalendar, FiImage, FiUsers, FiClock, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import SignUp2 from "./Signup2";

const CreateEvent = () => {
    const [title, setTitle] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [assignedTo, setAssignedTo] = useState([]);
    const [slotGap, setSlotGap] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSignupModal, setShowSignupModal] = useState(false);
    const navigate = useNavigate();

    const currentUserId = localStorage.getItem("userId");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        Axios.post("/auth/users-list")
            .then(res => {
                setUsers(res.data.users || []);
            })
            .catch((err) => {
                console.error("Users List Error:", err);
                setUsers([]);
            });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const userOptions = users.map(user => ({
        value: user._id,
        label: `${user.username} (${user.email}), Role: ${user?.role}`
    }));

    const slotGapOptions = [
        { value: 15, label: '15 min' },
        { value: 20, label: '20 min' },
        { value: 30, label: '30 min' }
    ];

    const handleAssignedToChange = (selectedOptions) => {
        setAssignedTo(selectedOptions || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!title || assignedTo.length === 0 || !currentUserId) {
            setError("Title, Assigned To, and Created By are required.");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title);
            if (imageFile) {
                formData.append("image", imageFile);
            }
            formData.append("description", description);
            formData.append("startDate", startDate);
            formData.append("endDate", endDate);
            formData.append("slotGap", slotGap);
            formData.append("createdBy", currentUserId);

            assignedTo.forEach(user => {
                formData.append("assignedTo", user.value);
            });

            await Axios.post("/events", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.error || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <h2 className="text-2xl font-bold">Create New Event</h2>
                        <p className="text-blue-100 mt-1">Fill in the details to create a new event</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter event title"
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-48 mx-auto object-cover rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(""); }}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer">
                                        <FiImage className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                                        <p className="text-gray-600">Click to upload event image</p>
                                        <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Enter event description"
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Assign To */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                                <button
                                    type="button"
                                    onClick={() => setShowSignupModal(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    <FiPlus /> Add User
                                </button>
                            </div>
                            <Select
                                isMulti
                                value={assignedTo}
                                onChange={handleAssignedToChange}
                                options={userOptions}
                                placeholder="Select users..."
                                noOptionsMessage={() => "No users found"}
                                closeMenuOnSelect={false}
                                isSearchable={true}
                                isClearable={true}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>

                        {/* Slot Gap */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Slot Duration</label>
                            <div className="relative">
                                <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none bg-white"
                                    value={slotGap}
                                    onChange={e => setSlotGap(e.target.value)}
                                    required
                                >
                                    <option value="">Select Slot Duration</option>
                                    {slotGapOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Event...
                                </>
                            ) : (
                                <>
                                    Create Event
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Add User Modal */}
            {showSignupModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowSignupModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowSignupModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                        <SignUp2
                            onSuccess={() => {
                                setShowSignupModal(false);
                                fetchUsers();
                            }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default CreateEvent;
