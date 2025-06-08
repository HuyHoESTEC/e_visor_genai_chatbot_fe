import { defineStore } from "pinia";
import { login, register, logout } from '../services/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('authToken') || null, // Get token from localStorage
    loading: false,
    error: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token, // `!!` convert to boolean
    userDisplayName: (state) => state.user ? (state.user.name || state.user.email) : 'Guest',
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await login(credentials); // Call API login
        this.user = response.data.user;
        this.token = response.data.token;
        localStorage.setItem('authToken', response.data.token); // Save token into localStorage
        this.router.push({ name: 'ContractReview' }); // Redirect after login success
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed. Please check your credentials.';
        console.error('Login error:', err);
      } finally {
        this.loading = false;
      }
    },
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await register(userData);
        this.user = response.data.user;
        this.token = response.data.token;
        localStorage.setItem('authToken', response.data.token);
        this.router.push({ name: 'ContractReview' }); // Redirect after register success
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed.';
        console.error('Register error:', err);
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      this.loading = true;
      this.error = null;
      try {
        // Can call logout API to invalidate token on the server
        await logout(); // Assume the API Logout does not need data, just need tokens in the header
      } catch (err) {
        console.error('Logout API error (might be ignored if token is already invalidated):'. err);
      } finally {
        this.user = null;
        this.token = null;
        localStorage.removeItem('authToken'); // Delete token
        this.router.push({ name: 'Login' }); // Redirect into login page
        this.loading = false;
      }
    },
    // Function to check token while start or refresh page
    async checkAuth() {
      /**
       * If there is token but there is no user information, try to re -verify the token
       * This is where you will call an API `/me` or`/validate-token`
       * To get user information and confirm the valid token
       */
      try {
        /**
         * Assume API to get user information from tokens
         * const response = await api.get('/auth/me');
         * this.user = response.data.user;
         * For demo, just set a dummy user if token exists
         */
        this.user = { email: 'estec_user@biendongco.vn', name: 'Authenticated User' };
        console.log('Auth token found and user session restored.');
      } catch (err) {
        console.error('Auth check failted, token might be invalid:', err);
        this.logout(); // If token is not exception, logout
      }
    }
  }
});