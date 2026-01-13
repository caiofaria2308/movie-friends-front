import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { LoginData, RegisterData, User } from '../types/auth';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check if token exists and validate (optional)
        // For now, if token exists, we assume authenticated.
        // Ideally, fetch user profile here.
        const checkAuth = async () => {
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // Placeholder for fetching user profile if API supports it
                    // const res = await api.get('/user/profile');
                    // setUser(res.data);
                } catch (error) {
                    console.error("Auth check failed", error);
                    logout();
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, [token]);

    const login = async (data: LoginData) => {
        const response = await api.post('/auth/login', data);
        const { token } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Fetch user details immediately or decode token if possible
    };

    const register = async (data: RegisterData) => {
        await api.post('/auth/register', data);
        // Auto login after register? Or redirect to login.
        // For now, let's assume redirect to login is handled by component.
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
