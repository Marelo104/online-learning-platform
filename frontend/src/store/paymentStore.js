import { create } from 'zustand';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const usePaymentStore = create((set) => ({
  payments: [],
  currentPayment: null,
  loading: false,

  createCheckoutSession: async (courseId) => {
    set({ loading: true });
    try {
      const response = await api.post(`/payment/${courseId}/checkout`);

      // redirect to Stripe checkout page
      window.location.href = response.data.checkoutUrl;

      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to create checkout session");
    }
  },

verifyPayment: async (sessionId) => {
  set({ loading: true });
  try {
    const response = await api.get(`/payment/verify/${sessionId}`);
    set({ currentPayment: response.data.payment, loading: false });
    return response.data; // ✅ return full data including courseId
  } catch (error) {
    set({ loading: false });
    toast.error(error.response?.data?.message || "Payment verification failed");
    return null;
  }
},

  getMyPayments: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/payment/my-payments');
      set({ payments: response.data.payments, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to fetch payments");
    }
  },
}));