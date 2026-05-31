import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const useProgressStore = create((set) => ({
  progress: null,
  allProgress: [],
  loading: false,

  getCourseProgress: async (courseId) => {
    set({ loading: true });
    try {
      const response = await api.get(`/courses/${courseId}/progress`);
      set({ progress: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch progress");
    }
  },

  getAllProgress: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/courses/progress/all');
      set({ allProgress: response.data.progress, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch progress");
    }
  },

  markLessonComplete: async (courseId, lessonId) => {
    set({ loading: true });
    try {
      const response = await api.post(
        `/courses/${courseId}/lessons/${lessonId}/complete`
      );
      set({
        progress: response.data,
        loading: false,
      });
      toast.success("Lesson completed");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to mark complete");
    }
  },

  markLessonIncomplete: async (courseId, lessonId) => {
    set({ loading: true });
    try {
      const response = await api.delete(
        `/courses/${courseId}/lessons/${lessonId}/complete`
      );
      set({
        progress: response.data,
        loading: false,
      });
      toast.success("Lesson marked incomplete");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to mark incomplete");
    }
  },
}));