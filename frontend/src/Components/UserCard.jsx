import React, { useState, useEffect, useContext } from "react";
import Axios from "../Api/Axios";
import { FiEdit2, FiTrash2, FiClock, FiCheck, FiX, FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin } from "react-icons/fi";
import SlotsContext from "../Context/SlotsContext.jsx";
import { UserContext } from "../Context/UserContext.jsx";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

const UserCard = ({eventId, user: initialUser, searchQuery, selectedByOptions, timeSlots = [], onUserUpdated, onUserDeleted }) => {
    const [user, setUser] = useState(initialUser);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const { slots, fetchSlots } = useContext(SlotsContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {user:loggedInUser}=useContext(UserContext)

    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: initialUser.firstName || '',
        lastName: initialUser.lastName || '',
        company: initialUser.company || '',
        title: initialUser.title || '',
        email: initialUser.email || '',
        phone: initialUser.phone || '',
        status: initialUser.status || 'pending',
    });
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        setEditForm({
            firstName: initialUser.firstName || '',
            lastName: initialUser.lastName || '',
            company: initialUser.company || '',
            title: initialUser.title || '',
            email: initialUser.email || '',
            phone: initialUser.phone || '',
            status: initialUser.status || 'pending',
        });
    }, [initialUser]);

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await Axios.put(`/files/user/${user._id}`, editForm);
            setShowEditDialog(false);
            if (onUserUpdated) onUserUpdated();
            setUser({ ...user, ...editForm });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update user.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await Axios.delete(`/files/user/${user._id}`);
            setShowDeleteDialog(false);
            if (onUserDeleted) onUserDeleted();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user.');
        } finally {
            setDeleteLoading(false);
        }
    };

    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    const highlightMatch = (text) => {
        if (!searchQuery || !text) return text;
        const regex = new RegExp(`(${searchQuery})`, "gi");
        return text.toString().split(regex).map((part, i) =>
            i % 2 === 1 ? (
                <mark key={i} className="bg-yellow-100 text-yellow-800 px-1 rounded">{part}</mark>
            ) : (
                part
            )
        );
    };

    const handleCompanyChange = (company) => {
        setSelectedCompany(company);
        setSelectedTime("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!selectedTime || !selectedCompany) {
            alert("Please select a company and a time slot.");
            setIsSubmitting(false);
            return;
        }

        if (hasUserBookedCompany(selectedCompany)) {
            alert("You have already booked a slot with this company for this event.");
            setIsSubmitting(false);
            return;
        }

        if (isTimeSlotBooked(selectedTime)) {
            alert("You have already booked this time for this event.");
            setIsSubmitting(false);
            return;
        }

        if (isCompanyTimeTaken(selectedTime)) {
            alert("This time is already booked for the selected company.");
            setIsSubmitting(false);
            return;
        }

        try {
            const data = {
                userId: user._id,
                timeSlot: selectedTime,
                company: selectedCompany,
                event:eventId
            };

            await Axios.post(`/booking-slot`, data, {
                headers: { "Content-Type": "application/json" }
            });
            await fetchSlots(eventId);
            setShowBookingForm(false);
        } catch (error) {
            console.error("Error booking slot:", error);
            alert(error.response?.data?.error || "An error occurred while booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(()=>{
        if(eventId){
        fetchSlots(eventId);
        }
    },[eventId])

    const userBookedSlots = slots.filter(slot => slot.userId === user._id && slot.event === eventId);

    const isTimeSlotBooked = (time) => {
        return userBookedSlots.some(slot => slot.timeSlot === time);
    };

    const isCompanyTimeTaken = (time) => {
        if (!selectedCompany) return false;
        return slots.some(slot =>
            slot.timeSlot === time &&
            slot.company === selectedCompany &&
            slot.event === eventId
        );
    };

    const hasUserBookedCompany = (company) => {
        if (!company) return false;
        return userBookedSlots.some(slot => slot.company === company);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'not-available': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
        >
            <div className="p-5 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    {/* User Info Section */}
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/30 flex-shrink-0">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {highlightMatch(user.firstName)} {highlightMatch(user.lastName)}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                                        {user.status}
                                    </span>
                                </div>
                                <p className="text-gray-500 mt-0.5">{user.title}</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <FiBriefcase className="text-gray-400" />
                                </div>
                                <span className="text-sm truncate">{user.company}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <FiMail className="text-gray-400" />
                                </div>
                                <span className="text-sm truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <FiPhone className="text-gray-400" />
                                    </div>
                                    <span className="text-sm">{user.phone}</span>
                                </div>
                            )}
                            {user.serialNo && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-400">#</span>
                                    </div>
                                    <span className="text-sm">S.No: {user.serialNo}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions & Slots */}
                    <div className="flex flex-col gap-4 lg:min-w-[280px]">
                        {/* Booked Slots */}
                        {userBookedSlots.length > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-sm font-medium text-blue-900 mb-2">Booked Slots</p>
                                <div className="flex flex-wrap gap-2">
                                    {userBookedSlots.map((slot, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-sm font-medium text-blue-700 border border-blue-200">
                                            <FiClock className="text-xs" />
                                            {slot.timeSlot}
                                            <span className="text-blue-400">|</span>
                                            <span className="truncate max-w-[80px]">{slot.company}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {loggedInUser.role !== "viewer" && (
                                <>
                                    <button
                                        onClick={() => setShowEditDialog(true)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-colors border border-gray-200"
                                    >
                                        <FiEdit2 /> Edit
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <AnimatePresence>
                {showEditDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowEditDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                            </div>
                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={editForm.firstName}
                                            onChange={handleEditChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={editForm.lastName}
                                            onChange={handleEditChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={editForm.company}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editForm.title}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={editForm.phone}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                        <option value="not-available">Not Available</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditDialog(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50"
                                    >
                                        {editLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Dialog */}
            <AnimatePresence>
                {showDeleteDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeleteDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiTrash2 className="text-2xl text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete User</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-50"
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UserCard;
