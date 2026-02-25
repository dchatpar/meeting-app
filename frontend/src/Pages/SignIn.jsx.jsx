import React, { useContext, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import { FiMail, FiLock, FiLogIn, FiUser, FiArrowRight, FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";
import ForgetPasswordDialog from "../Components/ForgetPasswordDialog";
import SetPasswordDialog from "../Components/SetPasswordDialog";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const SignIn = () => {
  const { login, loading, user, logout, isAuthenticated } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [forgetOpen, setForgetOpen] = useState(params.get("forget") === "1");
  const [setPasswordOpen, setSetPasswordOpen] = useState(!!params.get("email"));
  const emailParam = params.get("email") || "";

  React.useEffect(() => {
    setForgetOpen(params.get("forget") === "1");
    setSetPasswordOpen(!!params.get("email"));
  }, [location.search]);

  const handleOpenForget = (e) => {
    e.preventDefault();
    params.set("forget", "1");
    navigate({ search: params.toString() }, { replace: true });
  };

  const handleCloseForget = () => {
    params.delete("forget");
    navigate({ search: params.toString() }, { replace: true });
  };

  const handleForgetSuccess = (email) => {
    params.delete("forget");
    params.set("email", email);
    navigate({ search: params.toString() }, { replace: true });
  };

  const handleCloseSetPassword = () => {
    params.delete("email");
    navigate({ search: params.toString() }, { replace: true });
  };

  const handleLogin = async (data) => {
    try {
      await login(data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Invalid email or password");
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <FiCalendar className="text-4xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center">Welcome back!</h2>
              <p className="text-center text-blue-100 mt-2">You&apos;re already signed in</p>
            </div>
            <div className="p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-900">{user?.username || "User"}</p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                <div className="flex gap-3 w-full mt-4">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                  >
                    Go to Dashboard
                    <FiArrowRight />
                  </button>
                  <button
                    onClick={logout}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <FiCalendar className="text-5xl" />
            </div>
            <h1 className="text-4xl font-bold mb-4">MeetApp</h1>
            <p className="text-xl text-blue-100 max-w-md">
              Streamline your conference room bookings and delegate meeting management
            </p>
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-blue-200 text-sm">Automated</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-blue-200 text-sm">Available</p>
              </div>
              <div>
                <p className="text-3xl font-bold">Real-time</p>
                <p className="text-blue-200 text-sm">Updates</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FiCalendar className="text-3xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-2">Sign in to continue to MeetApp</p>
            </div>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-5">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <Field
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                          errors.email && touched.email
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        }`}
                      />
                    </div>
                    <ErrorMessage name="email" component="p" className="mt-2 text-sm text-red-500" />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <Field
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                          errors.password && touched.password
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        }`}
                      />
                    </div>
                    <ErrorMessage name="password" component="p" className="mt-2 text-sm text-red-500" />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenForget}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <FiLogIn />
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </motion.div>
      </div>

      {forgetOpen && (
        <ForgetPasswordDialog
          open={forgetOpen}
          onClose={handleCloseForget}
          onSuccess={handleForgetSuccess}
        />
      )}

      {setPasswordOpen && (
        <SetPasswordDialog
          open={setPasswordOpen}
          onClose={handleCloseSetPassword}
          email={emailParam}
        />
      )}
    </div>
  );
};

export default SignIn;
