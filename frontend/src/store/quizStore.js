import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const useQuizStore = create((set) => ({
    quiz: null,
    quizResult: null,
    loading: false,

    getQuiz: async (courseId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/courses/${courseId}/quiz`);
            set({ quiz: response.data.quiz, loading: false });
        } catch (error) {
            // 404 means no quiz yet — not a real error, just set null silently
            if (error.response?.status === 404) {
            set({ quiz: null, loading: false });
            } else {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to fetch quiz");
            }
        }
    },

    submitQuiz: async (quizId, answers) => {
        set({ loading: true });
        try {
            const response = await api.post(`/courses/quiz/${quizId}/submit`, { answers });
            set({
            quizResult: response.data.result,
            loading: false,
            });
         
            toast.success(`Quiz submitted! Your score: ${response.data.result.score}%`);
            return response.data;
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to submit quiz");
        }
    },

    createQuiz: async(courseId, quizData)=>{
        set({ loading: true });
        try {
            const response = await api.post(`/courses/${courseId}/quiz`, quizData);
            set({ quiz: response.data.quiz, loading: false });
            toast.success("Quiz created successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to create quiz");
        }
    },

    deleteQuiz: async(quizId)=>{
        set({ loading: true });
        try {
            await api.delete(`/courses/quiz/${quizId}`);
            set({ quiz: null, loading: false });
            toast.success("Quiz deleted successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "Failed to delete quiz");
        }
    }

}));   