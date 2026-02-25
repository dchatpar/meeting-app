import React, { useContext, useState, useEffect } from "react";
import { DataContext } from "../Context/DataContext";
import Axios from "../Api/Axios";
import { useParams } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { BsGift, BsGiftFill } from "react-icons/bs";
import { BiCommentAdd, BiCommentEdit } from "react-icons/bi";
import { FiSearch, FiUsers, FiCalendar, FiMessageSquare, FiCheck, FiX, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Company = () => {
  const [commentModal, setCommentModal] = useState({
    open: false,
    userId: null,
    slotId: null,
    initial: "",
  });
  const [commentValue, setCommentValue] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const { id } = useParams();
  const { refetch, fileUserData, getUniqueCompanies } = useContext(DataContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState();
  const { user: loggedInUser } = useContext(UserContext);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    slotId: null,
    isCompleted: false,
    userName: "",
  });

  useEffect(() => {
    if (id) {
      refetch(id);
    }
  }, [id]);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      const allCompanyNames = getUniqueCompanies();
      try {
        const response = await Axios.post("/slot/get-company-slot-counts", {
          event: id,
        });

        const apiCompanies = response.data || [];

        const apiCompanyMap = new Map();
        apiCompanies.forEach((company) => {
          apiCompanyMap.set(company.company, {
            slotCount: company.slotCount,
            userCount: company.userCount || 0,
          });
        });

        const combined = allCompanyNames.map((companyName) => ({
          company: companyName,
          slotCount: apiCompanyMap.get(companyName)?.slotCount || 0,
          userCount: apiCompanyMap.get(companyName)?.userCount || 0,
        }));

        combined.sort((a, b) => {
          if (b.userCount !== a.userCount) {
            return b.userCount - a.userCount;
          }
          return a.company.localeCompare(b.company);
        });

        setCompanies(combined);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to load companies");
      } finally {
        setLoadingCompanies(false);
      }
    };

    if (id && fileUserData) {
      fetchCompanies();
    }
  }, [fileUserData]);

  const fetchUsers = async (companyName) => {
    const encodedCompanyName = encodeURIComponent(companyName);
    setSelectedCompany(companyName);
    setIsLoading(true);
    setError(null);

    try {
      const response = await Axios.post(`/slot/company/${encodedCompanyName}`, {
        event: id,
      });
      if (response.status >= 300) {
        throw new Error("Failed to fetch users");
      }
      const slots = response.data;

      const uniqueUsersMap = new Map();
      slots.forEach((slot) => {
        const user = slot.userId;
        if (user && !uniqueUsersMap.has(user._id)) {
          uniqueUsersMap.set(user._id, {
            ...user,
            slotId: slot._id,
            completed: slot.completed,
          });
        }
      });

      setUsers(Array.from(uniqueUsersMap.values()));
      setCount(uniqueUsersMap.size);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleClick = (slotId, isCompleted, userName) => {
    setConfirmationData({
      slotId,
      isCompleted,
      userName,
    });
    setShowConfirmation(true);
  };

  const toggleCompletion = async () => {
    const { slotId, isCompleted } = confirmationData;
    setUpdatingId(slotId);
    setShowConfirmation(false);

    try {
      const response = await Axios.post(`/slot/toggle-completed/${slotId}`, {
        completed: !isCompleted,
      });

      if (response.status >= 300) throw new Error("Failed to update status");

      if (selectedCompany) fetchUsers(selectedCompany);
    } catch (error) {
      console.error("Error updating slot status:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (commentModal.open) {
      setCommentValue(commentModal.initial || "");
    }
  }, [commentModal.open, commentModal.initial]);

  const handleGiftClick = async (userId) => {
    try {
      await Axios.put(`/files/user/${userId}`, {
        giftCollected: true,
      });
      if (selectedCompany) fetchUsers(selectedCompany);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {confirmationData.isCompleted ? (
                  <FiX className="text-2xl text-blue-600" />
                ) : (
                  <FiCheck className="text-2xl text-blue-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {confirmationData.isCompleted ? "Mark as Incomplete?" : "Mark as Completed?"}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to mark{" "}
                <span className="font-semibold">{confirmationData.userName}</span>
                &apos;s interview as {confirmationData.isCompleted ? "incomplete" : "completed"}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={toggleCompletion}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {commentModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setCommentModal({ ...commentModal, open: false })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {commentModal.initial ? "Edit Comment" : "Add Comment"}
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!commentValue.trim()) return;
                  setCommentLoading(true);
                  try {
                    await Axios.put(`/files/user/${commentModal.userId}`, {
                      comment: commentValue,
                    });
                    if (selectedCompany) fetchUsers(selectedCompany);
                    setCommentModal({ ...commentModal, open: false });
                  } catch (err) {
                    alert(err.response?.data?.error || "Failed to save comment.");
                  } finally {
                    setCommentLoading(false);
                  }
                }}
              >
                <textarea
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  placeholder="Enter your comment..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[120px] resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setCommentModal({ ...commentModal, open: false })}
                    disabled={commentLoading}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={commentLoading || !commentValue.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    {commentLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Company Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Select a company to view and manage user interviews
          </p>
        </div>

        {/* Loading Companies */}
        {loadingCompanies ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : companies.length > 0 ? (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 px-2">
              Available Companies ({companies.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {companies.map((company) => (
                <motion.button
                  key={company.company}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fetchUsers(company.company)}
                  className={`p-4 rounded-2xl text-center transition-all duration-200 w-full ${
                    selectedCompany === company.company
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-100"
                  }`}
                >
                  <span className="block font-semibold truncate">{company.company}</span>
                  <span className={`text-sm ${selectedCompany === company.company ? "text-blue-100" : "text-gray-500"}`}>
                    {company.slotCount} slot{company.slotCount !== 1 ? "s" : ""}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiUsers className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies available</h3>
            <p className="text-gray-500">No companies have booked slots for this event</p>
          </div>
        )}

        {/* Company Users Table */}
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCompany} Users
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Manage interviews and bookings
                </p>
              </div>
              <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {count} {count === 1 ? "user" : "users"}
              </span>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : users.length > 0 ? (
                <div className="space-y-4">
                  {users.map((user) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-5 rounded-2xl border-l-4 transition-all ${
                        user.completed
                          ? "bg-green-50 border-green-500"
                          : "bg-gray-50 border-blue-500"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-gray-500">{user.email}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {user.title && (
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                  {user.title}
                                </span>
                              )}
                              {user.phone && (
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Comment Button */}
                          <button
                            onClick={() =>
                              setCommentModal({
                                open: true,
                                userId: user._id,
                                slotId: user.slotId,
                                initial: user.comment || "",
                              })
                            }
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
                            title="Add comment"
                          >
                            {user.comment ? <BiCommentEdit /> : <BiCommentAdd />}
                          </button>

                          {/* Gift Button */}
                          {loggedInUser.role !== "viewer" && (
                            <button
                              onClick={() => handleGiftClick(user._id)}
                              className={`p-2.5 rounded-xl transition-colors ${
                                user.giftCollected
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                              }`}
                              title="Gift collected"
                            >
                              {user.giftCollected ? <BsGiftFill /> : <BsGift />}
                            </button>
                          )}

                          {/* Complete Toggle */}
                          <button
                            onClick={() =>
                              handleToggleClick(
                                user.slotId,
                                user.completed,
                                `${user.firstName} ${user.lastName}`
                              )
                            }
                            disabled={updatingId === user.slotId}
                            className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                              user.completed
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            {user.completed ? (
                              <>
                                <FiCheck /> Completed
                              </>
                            ) : (
                              <>
                                <FiClock /> Mark Complete
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Comment Display */}
                      {user.comment && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-start gap-2">
                            <FiMessageSquare className="text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-600">{user.comment}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No users found for this company</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Company;
