import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  checkingAuth: true, 
  error: null,

  getMe: async () => {
    set({ checkingAuth: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, checkingAuth: false });
    } catch (error) {
      console.log(error.message);
      set({ user: null, checkingAuth: false });
    }
  },

  signup: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/signup', { name, email, password, role });
      set({ user: response.data.user, loading: false });
      toast.success("Account created successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      set({ user: response.data.user, loading: false });
      toast.success("Logged in successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.post('/auth/logout');
      set({ user: null, loading: false });
      toast.success("Logged out successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "An error occurred during logout");
    }
  },

  updateProfile: async (formData) => {
    set({ loading: true });
    try {
      const response = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ user: response.data.user, loading: false });
      toast.success("Profile updated successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },
}));