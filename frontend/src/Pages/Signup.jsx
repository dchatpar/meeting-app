import React, { useContext, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../Context/UserContext';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const validationSchema = Yup.object({
    username: Yup.string()
        .required('Username is required')
        .min(2, 'Username must be at least 2 characters')
        .max(50, 'Username cannot be longer than 50 characters'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .max(20, 'Password cannot be longer than 20 characters'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    role: Yup.string()
        .oneOf(['viewer', 'manager', 'admin'], 'Invalid role')
        .required('Role is required')
});

const SignUp = ({ eventId, onSuccess }) => {
    const { signup } = useContext(UserContext);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const { confirmPassword, ...signupData } = values;
            await signup(eventId ? { ...signupData, eventId } : signupData);
            setErrorMessage(null);
            if (onSuccess) onSuccess();
            resetForm();
        } catch (error) {
            console.error("Signup error:", error);
            setErrorMessage(error.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <h2 className="text-2xl font-bold">Create Account</h2>
                        <p className="text-blue-100 mt-1">Join us to manage your events</p>
                    </div>

                    <div className="p-6">
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                            >
                                <p className="text-sm text-red-600">{errorMessage}</p>
                            </motion.div>
                        )}

                        <Formik
                            initialValues={{
                                username: '',
                                email: '',
                                password: '',
                                confirmPassword: '',
                                role: 'viewer'
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, errors, touched }) => (
                                <Form className="space-y-5">
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <FiUser className="text-gray-400" />
                                            </div>
                                            <Field
                                                type="text"
                                                id="username"
                                                name="username"
                                                placeholder="Enter your username"
                                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                                                    errors.username && touched.username
                                                        ? "border-red-300 focus:border-red-500"
                                                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                }`}
                                            />
                                        </div>
                                        <ErrorMessage name="username" component="p" className="text-red-500 text-xs mt-1.5" />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <FiMail className="text-gray-400" />
                                            </div>
                                            <Field
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="you@example.com"
                                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                                                    errors.email && touched.email
                                                        ? "border-red-300 focus:border-red-500"
                                                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                }`}
                                            />
                                        </div>
                                        <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1.5" />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <FiLock className="text-gray-400" />
                                            </div>
                                            <Field
                                                type="password"
                                                id="password"
                                                name="password"
                                                placeholder="Create a password"
                                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                                                    errors.password && touched.password
                                                        ? "border-red-300 focus:border-red-500"
                                                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                }`}
                                            />
                                        </div>
                                        <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1.5" />
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <FiLock className="text-gray-400" />
                                            </div>
                                            <Field
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                placeholder="Confirm your password"
                                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                                                    errors.confirmPassword && touched.confirmPassword
                                                        ? "border-red-300 focus:border-red-500"
                                                        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                }`}
                                            />
                                        </div>
                                        <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs mt-1.5" />
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                        <Field
                                            as="select"
                                            id="role"
                                            name="role"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </Field>
                                        <ErrorMessage name="role" component="p" className="text-red-500 text-xs mt-1.5" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <FiArrowRight />
                                            </>
                                        )}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SignUp;
