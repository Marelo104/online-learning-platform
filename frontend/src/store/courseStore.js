import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const useCourseStore = create((set) => ({
  courses: [],
  currentCourse: null,
  instructorCourses: [],
  loading: false,

  fetchCourses: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await api.get('/courses', { params });
      set({ courses: response.data.courses, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch courses");
    }
  },

  fetchCourseById: async (courseId) => {
    set({ loading: true });
    try {
      const response = await api.get(`/courses/${courseId}`);
      set({ currentCourse: response.data.course, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch course");
    }
  },

  fetchInstructorCourses: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/courses/instructor/my-courses'); 
      set({ instructorCourses: response.data.courses, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch your courses");
    }
  },

  createCourse: async (courseData) => {
    set({ loading: true });
    try {
      const response = await api.post('/courses', courseData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set((state) => ({
        instructorCourses: [...state.instructorCourses, response.data.course],
        loading: false,
      }));
      toast.success("Course created successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to create course");
    }
  },

  updateCourse: async (courseId, courseData) => {
    set({ loading: true });
    try {
      const response = await api.put(`/courses/${courseId}`, courseData, {
        headers: { 'Content-Type': 'multipart/form-data' }, 
      });
      set((state) => ({
        instructorCourses: state.instructorCourses.map((course) =>
          course._id === courseId ? response.data.course : course
        ),
        currentCourse: response.data.course,
        loading: false,
      }));
      toast.success("Course updated successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to update course");
    }
  },

  deleteCourse: async (courseId) => {
    set({ loading: true });
    try {
      await api.delete(`/courses/${courseId}`);
      set((state) => ({
        instructorCourses: state.instructorCourses.filter(
          (course) => course._id !== courseId
        ),
        loading: false,
      }));
      toast.success("Course deleted successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to delete course");
    }
  },

  publishCourse: async (courseId) => {
    set({ loading: true });
    try {
      const response = await api.patch(`/courses/${courseId}/publish`); 
      set((state) => ({
        instructorCourses: state.instructorCourses.map((course) =>
          course._id === courseId ? response.data.course : course
        ),
        loading: false,
      }));
      toast.success(response.data.message); 
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to publish course");
    }
  },
}));