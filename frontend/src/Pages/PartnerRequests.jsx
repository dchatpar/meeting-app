import React, { useState, useEffect, useContext } from 'react';
import Axios from '../Api/Axios';
import { UserContext } from '../Context/UserContext';
import { DataContext } from '../Context/DataContext';
import { useParams } from 'react-router-dom';
import { FiSend, FiCheck, FiX, FiClock, FiUser, FiBriefcase, FiMessageSquare, FiCalendar, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';

const PartnerRequests = () => {
  const { user } = useContext(UserContext);
  const { id: eventId } = useParams();
  const { fileUserData } = useContext(DataContext);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState(null);
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [message, setMessage] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchRequests();
  }, [eventId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await Axios.get('/partner-request', {
        params: { event: eventId }
      });
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedDelegate || selectedPartners.length === 0) {
      toast.error('Please select a delegate and at least one partner');
      return;
    }

    try {
      setSubmitting(true);
      const partners = selectedPartners.map(p => ({
        userId: p.value,
        company: p.company
      }));

      await Axios.post('/partner-request/create', {
        event: eventId,
        delegate: selectedDelegate.value,
        partners,
        message,
        dueDate: dueDate || null
      });

      toast.success('Partner request sent successfully');
      setShowCreateModal(false);
      setSelectedDelegate(null);
      setSelectedPartners([]);
      setMessage('');
      setDueDate('');
      fetchRequests();
    } catch (err) {
      console.error('Error creating request:', err);
      toast.error(err.response?.data?.error || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePartner = async (requestId, partnerId, timeSlot) => {
    try {
      await Axios.put('/partner-request/approve-partner', {
        requestId,
        partnerId,
        timeSlot
      });
      toast.success('Partner approved');
      fetchRequests();
    } catch (err) {
      console.error('Error approving partner:', err);
      toast.error(err.response?.data?.error || 'Failed to approve partner');
    }
  };

  const handleDeclinePartner = async (requestId, partnerId, reason) => {
    try {
      await Axios.put('/partner-request/decline-partner', {
        requestId,
        partnerId,
        reason
      });
      toast.success('Partner declined');
      fetchRequests();
    } catch (err) {
      console.error('Error declining partner:', err);
      toast.error(err.response?.data?.error || 'Failed to decline partner');
    }
  };

  const delegateOptions = fileUserData.map(u => ({
    value: u._id,
    label: `${u.firstName} ${u.lastName} - ${u.company}`
  }));

  const partnerOptions = fileUserData.map(u => ({
    value: u._id,
    label: `${u.firstName} ${u.lastName}`,
    company: u.company
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'declined': return 'bg-red-100 text-red-700 border-red-200';
      case 'partially_approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Requests</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage partner meeting requests' : 'Approve or decline partner meeting requests'}
            </p>
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 font-medium"
            >
              <FiPlus /> New Request
            </motion.button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 text-center border border-gray-100"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiClock className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No partner requests</h3>
            <p className="text-gray-500">
              {isAdmin ? 'Create a new request to send partner list to delegates' : 'You have no pending partner requests'}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                isAdmin={isAdmin}
                onApprove={handleApprovePartner}
                onDecline={handleDeclinePartner}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateRequestModal
            delegateOptions={delegateOptions}
            partnerOptions={partnerOptions}
            selectedDelegate={selectedDelegate}
            setSelectedDelegate={setSelectedDelegate}
            selectedPartners={selectedPartners}
            setSelectedPartners={setSelectedPartners}
            message={message}
            setMessage={setMessage}
            dueDate={dueDate}
            setDueDate={setDueDate}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateRequest}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, isAdmin, onApprove, onDecline }) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({});

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'declined': return 'bg-red-100 text-red-700 border-red-200';
      case 'partially_approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const pendingPartners = request.partners?.filter(p => p.status === 'pending') || [];
  const approvedPartners = request.partners?.filter(p => p.status === 'approved') || [];
  const declinedPartners = request.partners?.filter(p => p.status === 'declined') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
              {request.delegate?.firstName?.charAt(0)}{request.delegate?.lastName?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {request.delegate?.firstName} {request.delegate?.lastName}
              </h3>
              <p className="text-sm text-gray-500">{request.delegate?.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
              {request.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FiUser className="text-xs" />
            By: {request.requestedBy?.username}
          </span>
          <span className="flex items-center gap-1">
            <FiCalendar className="text-xs" />
            Event: {request.event?.title}
          </span>
        </div>
      </div>

      {/* Message */}
      {request.message && (
        <div className="p-4 border-b border-gray-100 bg-blue-50/50">
          <div className="flex items-start gap-2">
            <FiMessageSquare className="text-blue-500 mt-0.5" />
            <p className="text-sm text-gray-700">{request.message}</p>
          </div>
        </div>
      )}

      {/* Partners */}
      <div className="p-5">
        <h4 className="font-semibold text-gray-900 mb-4">Partners ({request.partners?.length})</h4>
        <div className="grid gap-3">
          {request.partners?.map((partner, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                  {partner.userId?.firstName?.charAt(0)}{partner.userId?.lastName?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {partner.userId?.firstName} {partner.userId?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{partner.company}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {partner.status === 'pending' && !isAdmin ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Time slot"
                      value={selectedTimeSlot[index] || ''}
                      onChange={(e) => setSelectedTimeSlot(prev => ({ ...prev, [index]: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onApprove(request._id, partner.userId._id, selectedTimeSlot[index])}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      title="Approve"
                    >
                      <FiCheck />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDecline(request._id, partner.userId._id, '')}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      title="Decline"
                    >
                      <FiX />
                    </motion.button>
                  </div>
                ) : (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(partner.status)}`}>
                    {partner.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <span className="text-yellow-600 font-medium">{pendingPartners.length} pending</span>
          <span className="text-green-600 font-medium">{approvedPartners.length} approved</span>
          <span className="text-red-600 font-medium">{declinedPartners.length} declined</span>
        </div>
      </div>
    </motion.div>
  );
};

// Create Request Modal
const CreateRequestModal = ({
  delegateOptions,
  partnerOptions,
  selectedDelegate,
  setSelectedDelegate,
  selectedPartners,
  setSelectedPartners,
  message,
  setMessage,
  dueDate,
  setDueDate,
  onClose,
  onSubmit,
  submitting
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Send Partner Request</h2>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Delegate</label>
            <Select
              options={delegateOptions}
              value={selectedDelegate}
              onChange={setSelectedDelegate}
              placeholder="Search for delegate..."
              isSearchable
              className="basic-select"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Partners to Meet</label>
            <Select
              options={partnerOptions}
              value={selectedPartners}
              onChange={setSelectedPartners}
              placeholder="Search for partners..."
              isSearchable
              isMulti
              className="basic-multi-select"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for the delegate..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date (Optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PartnerRequests;
