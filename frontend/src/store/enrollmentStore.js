import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const useEnrollmentStore = create((set) => ({
  enrollments: [],
  enrollmentStatus: null,
  loading: false,

  enrollInCourse: async (courseId) => {
    set({ loading: true });
    try {
      const response = await api.post(`/enrollments/${courseId}/enroll`);
      set((state) => ({
        enrollments: [...state.enrollments, response.data.enrollment],
        enrollmentStatus: { isEnrolled: true, enrollment: response.data.enrollment },
        loading: false,
      }));
      toast.success("Enrolled successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to enroll");
    }
  },

  getMyEnrollments: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/enrollments/my-enrollments');
      set({ enrollments: response.data.enrollments, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch enrollments");
    }
  },

  getEnrollmentStatus: async (courseId) => {
    set({ loading: true });
    try {
      const response = await api.get(`/enrollments/${courseId}/status`);
      set({ enrollmentStatus: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch status");
    }
  },

  unenrollFromCourse: async (courseId) => {
    set({ loading: true });
    try {
      await api.delete(`/enrollments/${courseId}/unenroll`); 
      set((state) => ({
        enrollments: state.enrollments.filter(
          (e) => e.course._id !== courseId 
        ),
        enrollmentStatus: { isEnrolled: false, enrollment: null },
        loading: false,
      }));
      toast.success("Unenrolled successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to unenroll");
    }
  },
}));