import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        // Fetch full user details
                        const { data } = await axios.get("http://localhost:5000/auth/me", {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setUser(data);
                    }
                } catch (error) {
                    console.error("Auth verification failed", error);
                    logout();
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, [token]);

    const login = (userData, newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
    };

    const updateUser = async (updatedData) => {
        try {
            // Use local API path since we added it to index.js, but let's call axios directly for consistency with fetchUser above 
            // OR use the one from api/index.js if imported. 
            // Since this file imports axios, let's stick to axios or better yet, call the endpoint.
            // Wait, I should probably reuse the token from state.
            const { data } = await axios.put("http://localhost:5000/auth/update", updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(data);
            return data;
        } catch (error) {
            console.error("Update failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
