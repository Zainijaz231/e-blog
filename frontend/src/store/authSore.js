import { create } from 'zustand'
import api from '../api/axios'

const useAuthStore = create((set) => ({
    user: null,
    loading: false,
    error: null,

    register: async (formData) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/auth/register', formData);
            set({ loading: false, error: null });
            return res.data;
        } catch (error) {
            console.error('Registration Error:', error);
            set({ error: error.response?.data?.message || 'Registration failed', loading: false });
            return { success: false, ...error.response?.data };
        }
    },

    login: async (formData) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/auth/login', formData);

            // Save token if provided
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }

            set({ user: res.data.user, loading: false });
            return res.data;
        } catch (error) {
            console.error('Login Error:', error);
            set({ error: error.response?.data?.message || 'Login failed', loading: false });
            return { success: false, ...error.response?.data };
        }
    },

    logout: async () => {
        set({ loading: true, error: null });
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token');
            set({ user: null, loading: false });
        } catch (error) {
            console.error('Logout Error:', error);
            localStorage.removeItem('token'); // Remove token even if logout fails
            set({ user: null, loading: false }); // Clear user state
        }
    },

    fetchUser: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api.get('/auth/user');
            set({ user: res.data.user, loading: false });
        } catch (error) {
            // Don't log 401 errors as they're expected when user is not authenticated
            if (error.response?.status !== 401) {
                console.error('Fetch User Error:', error);
            }
            // Don't set error for unauthorized - user is just not logged in
            if (error.response?.status === 401) {
                set({ user: null, loading: false, error: null });
            } else {
                set({ error: error.response?.data?.message || 'Failed to fetch user', loading: false });
            }
        }
    },

    setUser: (user) => {
        set({ user });
    }

}));

export default useAuthStore;