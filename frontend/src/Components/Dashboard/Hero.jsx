import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
    return (
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
            {/* Background with gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />

            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-300 rounded-full blur-3xl" />
            </div>

            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-5xl font-bold text-white mb-3"
                >
                    Conference Room Booking System
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl text-blue-100 max-w-2xl"
                >
                    Efficiently manage your conference room bookings and delegate meetings
                </motion.p>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-8 mt-6"
                >
                    <div className="text-center">
                        <p className="text-3xl font-bold text-white">100%</p>
                        <p className="text-sm text-blue-200">Automated</p>
                    </div>
                    <div className="w-px bg-blue-400/30" />
                    <div className="text-center">
                        <p className="text-3xl font-bold text-white">24/7</p>
                        <p className="text-sm text-blue-200">Available</p>
                    </div>
                    <div className="w-px bg-blue-400/30" />
                    <div className="text-center">
                        <p className="text-3xl font-bold text-white">Real-time</p>
                        <p className="text-sm text-blue-200">Updates</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
