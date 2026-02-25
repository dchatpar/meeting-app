import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios, { BASE_URL } from "../Api/Axios";
import { FiCalendar, FiClock, FiMapPin, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { useContext } from "react";
import { UserContext } from "../Context/UserContext";

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'long',    // Full month name (e.g., "June")
    day: 'numeric',   // Day of month (e.g., "12")
    hour: '2-digit',  // 2-digit hour (e.g., "06")
    minute: '2-digit',// 2-digit minute (e.g., "06")
    hour12: true      // 12-hour format with AM/PM
  });
};

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DefaultPage = () => {
  const navigate = useNavigate();
  const {user} = useContext(UserContext)
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    eventId: null,
    eventTitle: ""
  });

  useEffect(() => {
    Axios.get("/events")
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      await Axios.delete(`/events/${id}`);
      setEvents(events.filter(event => event._id !== id));
      setDeleteDialog({ isOpen: false, eventId: null, eventTitle: "" });
    } catch (err) {
      alert("Failed to delete event");
      console.error(err);
    }
  };

  const openDeleteDialog = (id, title) => {
    setDeleteDialog({
      isOpen: true,
      eventId: id,
      eventTitle: title
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      eventId: null,
      eventTitle: ""
    });
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => handleDelete(deleteDialog.eventId)}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteDialog.eventTitle}"? This action cannot be undone.`}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Discover Events
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                Find and join exciting events happening around you or create your own
              </p>
            </div>
            {user.role==="admin"&&<motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition"
            >
              <FiPlus className="text-lg" />
              Create Event
            </motion.button>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-12">
          <div className="relative max-w-md mx-auto md:mx-0">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-3 top-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                variants={itemVariants}
              >
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4 relative overflow-hidden">
                    <div className="shimmer-effect absolute inset-0"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded relative overflow-hidden">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded relative overflow-hidden">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
                      <div className="shimmer-effect absolute inset-0"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-gray-600 mb-2">
              {searchTerm ? "No events match your search" : "No events available"}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchTerm 
                ? "Try a different search term or create a new event"
                : "Check back later or create the first event"}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 transition"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredEvents.map((event) => (
              <motion.div
                key={event._id}
                className="relative group"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div 
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer h-full flex flex-col"
                  onClick={() => navigate(`/event/${event._id}`)}
                >
                  {(
                    <div className="h-48 w-full overflow-hidden relative">
                      <img
                        src={event.image ? BASE_URL + event.image : "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{event.title}</h3>
                      <div className="flex space-x-2">
                        {user.role!=="viewer"&&<button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/event/update/${event._id}`);
                          }}
                          className="text-gray-500 hover:text-blue-600 transition p-1"
                          title="Edit event"
                        >
                          <FiEdit2 size={18} />
                        </button>}
                       {user.role!=="viewer"&&<button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(event._id, event.title);
                          }}
                          className="text-gray-500 hover:text-red-600 transition p-1"
                          title="Delete event"
                        >
                          <FiTrash2 size={18} />
                        </button>}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description || "No description provided"}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <FiCalendar className="mr-2" />
                        <span>
                          {event.startDate ? formatDateTime(event.startDate) : "N/A"}
                          {event.endDate && ` - ${formatDateTime(event.endDate)}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <FiMapPin className="mr-2" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DefaultPage;