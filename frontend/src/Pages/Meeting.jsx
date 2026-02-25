import React, { useContext, useEffect, useState } from "react";
import DataContext from "../Context/DataContext";
import Axios from "../Api/Axios";
import { useParams } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { FiSearch, FiRefreshCw, FiUser, FiBriefcase, FiClock, FiX, FiCalendar, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Meeting = () => {
    const { id } = useParams();
    const { fileUserData, setFileUserData, refetch } = useContext(DataContext);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { user: loggedInUser } = useContext(UserContext);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState({ userId: null, slotTime: null });
    const [eventData, setEventData] = useState();

    const fetchData = async () => {
        setLoading(true);
        try {
            const userResponse = await Axios.get("/files/get-filedata/" + id);
            if (userResponse.status >= 300) throw new Error("Failed to fetch user data");
            const userData = await userResponse.data;
            const slotsResponse = await Axios.post("/slot/get-all-booked-slots", { event: id });
            if (slotsResponse.status >= 300) throw new Error("Failed to fetch slots");
            const slotsData = await slotsResponse.data;

            const usersWithSlots = userData.users.map((user) => {
                const userSlots = {};
                slotsData.forEach((slot) => {
                    if (slot.userId === user._id) {
                        userSlots[slot.timeSlot] = {
                            company: slot.company,
                            completed: slot.completed,
                        };
                    }
                });
                return { ...user, slots: userSlots };
            });

            const usersWithBookedSlots = usersWithSlots.filter(user => user.slots && Object.keys(user.slots).length > 0);
            setFileUserData(usersWithBookedSlots);
            setFilteredUsers(usersWithBookedSlots);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to fetch data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (userId, slotTime) => {
        setSlotToDelete({ userId, slotTime });
        setShowDeleteModal(true);
    };

    const deleteSlot = async () => {
        setDeleteLoading(true);
        try {
            const response = await Axios.delete(`/slot/delete/${slotToDelete.userId}`, {
                data: { event: id, slotTime: slotToDelete.slotTime }
            });

            if (response.status >= 200 && response.status < 300) {
                setFileUserData((prevData) =>
                    prevData.map((user) => {
                        if (user._id === slotToDelete.userId) {
                            const updatedSlots = { ...user.slots };
                            delete updatedSlots[slotToDelete.slotTime];
                            return { ...user, slots: updatedSlots };
                        }
                        return user;
                    })
                );
            } else {
                throw new Error(response.data.message || "Failed to delete slot");
            }
        } catch (error) {
            console.error("Error deleting slot:", error);
            alert("Error deleting slot: " + (error.response?.data?.message || error.message));
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
            setSlotToDelete({ userId: null, slotTime: null });
        }
    };

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUsers(fileUserData);
        } else {
            const filtered = fileUserData.filter(
                (user) =>
                    (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (user.title && user.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredUsers(filtered);
        }
        if (fileUserData.length > 0 && fileUserData[0].event) {
            setEventData(fileUserData[0].event);
        }
    }, [searchQuery, fileUserData]);

    const usersWithSlots = filteredUsers?.filter(user => user.slots && Object.keys(user.slots).length > 0);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTrash2 className="text-2xl text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm Deletion</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete this meeting slot? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={deleteSlot}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-50"
                                >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Meeting Schedule</h1>
                        <p className="text-gray-600 mt-1">Manage all scheduled meetings</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search attendees..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <FiRefreshCw className="animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <FiRefreshCw />
                                    Refresh
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                {!loading && usersWithSlots?.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiCalendar className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No attendees found</h3>
                        <p className="text-gray-500">Try adjusting your search or refresh the data</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {usersWithSlots?.map((user) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                {/* User Header */}
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                {user.firstName} {user.lastName}
                                            </h3>
                                            <p className="text-gray-500 flex items-center gap-2">
                                                <FiBriefcase className="text-xs" />
                                                {user.title} at {user.company}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Slots */}
                                <div className="p-5">
                                    <p className="text-sm font-medium text-gray-500 mb-3">Booked Slots:</p>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.entries(user.slots).map(([slotTime, slotInfo]) => (
                                            <motion.div
                                                key={slotTime}
                                                whileHover={{ scale: 1.02 }}
                                                className={`relative px-4 py-3 rounded-xl flex items-center gap-3 ${
                                                    slotInfo.completed
                                                        ? "bg-green-50 border border-green-200"
                                                        : "bg-blue-50 border border-blue-200"
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    slotInfo.completed ? "bg-green-100" : "bg-blue-100"
                                                }`}>
                                                    <FiClock className={`${slotInfo.completed ? "text-green-600" : "text-blue-600"}`} />
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${slotInfo.completed ? "text-green-700" : "text-blue-700"}`}>
                                                        {slotTime}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{slotInfo.company}</p>
                                                </div>
                                                {!slotInfo.completed && loggedInUser?.role !== "viewer" && (
                                                    <button
                                                        onClick={() => handleDeleteClick(user._id, slotTime)}
                                                        className="ml-2 p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                                        title="Delete slot"
                                                    >
                                                        <FiX />
                                                    </button>
                                                )}
                                                {slotInfo.completed && (
                                                    <span className="ml-2 px-2 py-1 bg-green-200 text-green-700 text-xs font-medium rounded-lg">
                                                        Completed
                                                    </span>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Meeting;
