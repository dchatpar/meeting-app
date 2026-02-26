import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    // Default user - no authentication required
    const [user, setUser] = useState({
        _id: "demo-user",
        username: "Demo User",
        email: "demo@example.com",
        role: "admin"
    });
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [loading, setLoading] = useState(false);

    const login = async (credentials) => {
        // Mock login - just set the user
        setUser({
            _id: "demo-user",
            username: credentials.username || "Demo User",
            email: credentials.email || "demo@example.com",
            role: "admin"
        });
        setIsAuthenticated(true);
    };

    const logout = async () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const signup = async (data) => {
        // Mock signup - just set the user
        setUser({
            _id: "new-user",
            username: data.username,
            email: data.email,
            role: data.role || "admin"
        });
        setIsAuthenticated(true);
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser,
            isAuthenticated, 
            loading,
            login, 
            logout,
            signup 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
