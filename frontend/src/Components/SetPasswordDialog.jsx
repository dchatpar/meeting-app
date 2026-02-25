import React, { useState } from "react";
import Axios from "../Api/Axios";

const SetPasswordDialog = ({ open, email, onClose }) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (!open || !email) return null;

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await Axios.post("/otp/set-password", { email, otp, password });
      setSuccess("Password set successfully. You can now sign in.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError("");
    setResent(false);
    try {
      await Axios.post("/otp/send-otp", { email });
      setResent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Set New Password</h2>
        <form onSubmit={handleSetPassword}>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700">OTP</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button
                type="button"
                className="bg-gray-200 text-gray-700 px-3 rounded hover:bg-gray-300"
                onClick={handleResendOtp}
                disabled={resending}
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            </div>
            {resent && <div className="text-green-600 mt-1">OTP resent!</div>}
          </div>
          <label className="block mb-2 text-gray-700">New Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">{success}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Setting..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPasswordDialog;
