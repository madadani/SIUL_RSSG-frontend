import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user_data')) || null,
  token: localStorage.getItem('jwt_token') || null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`http://${window.location.hostname}:8080/api/v1/auth/login`, {
        username,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        set({ user, token, loading: false });
        return true;
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login gagal, terjadi kesalahan server', 
        loading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
