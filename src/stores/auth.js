import { defineStore } from "pinia";
import router from "../router";
import { loginApi, logoutApi } from "../services/auth.service";
import { ElMessageBox, ElMessage } from "element-plus";
let sessionTimer = null; // Variable to store timer ID

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    expiresAt: localStorage.getItem('expiresAt') ? parseInt(localStorage.getItem('expiresAt')) : null,
    loading: false,
    error: null,
    authReady: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    userDisplayName: (state) => state.user ? (state.user.name) : 'Guest',
    isTokenValid: (state) => {
      if (!state.expiresAt) {
        console.warn('[isTokenValid] expiresAt is null. Token is invalid');
        return false;
      }
      const currentTime = new Date().getTime();
      const bufferTime = 10 * 1000;
      return currentTime < (state.expiresAt - bufferTime);
      // LOG CHI TIẾT ĐỂ DEBUG (nên giữ trong quá trình phát triển)
      // console.log(`[isTokenValid] Current: ${new Date(currentTime).toLocaleString()}`);
      // console.log(`[isTokenValid] Expires: ${new Date(state.expiresAt).toLocaleString()}`);
      // console.log(`[isTokenValid] Remaining: ${(state.expiresAt - currentTime) / 1000}s`);
      // console.log(`[isTokenValid] Buffer Adjusted Expires: ${new Date(state.expiresAt - bufferTime).toLocaleString()}`);
      // console.log(`[isTokenValid] Result (currentTime < expiresAt - bufferTime): ${isValid}`);
    },
  },
  actions: {
      /**
       * 
       * @param {Object} credentials 
       */
      async login(credentials) {
        this.loading = true;
        this.error = null;
        try {
          const response = await loginApi(credentials);
          console.log('response:', response);
          
          if (response && response.user_id && response.session_id && response.expires_at) {
            const expirationTime = new Date(response.expires_at).getTime();
            console.log('expirationTime:', expirationTime);
            if (isNaN(expirationTime)) {
              this.error = 'Thời gian hết hạn từ API không hợp lệ.';
              return false;
            }
            this.user = {
              id: response.user_id,
              name: response.full_name,
              avatar: response.avatar,
            };
            this.token = response.session_id;
            this.expiresAt = expirationTime;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            localStorage.setItem('expiresAt', this.expiresAt.toString());

            // console.log('Token saved:', this.token);
            // console.log('User saved:', this.user);
            // console.log('Expires At (timestamp):', this.expiresAt);
            // console.log('Expires At (Date object):', new Date(this.expiresAt));
            this.startSessionTimer();
            router.push('/summary-dashboard');
            return true;
          } else {
            this.error = 'Phản hồi đăng nhập không hợp lệ.'
            return false;
          }
        } catch (err) {
          console.error('Login failed:', err);
          this.error = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
          return false;
        } finally {
          this.loading = false;
        }
      },

      /**
       * @param {Object} credential
       */
      async logout(credential = {}) {
        this.loading = true;
        this.error = null;
        // Stop timer while logout
        this.stopSessionTimer();
        try {
          await logoutApi(credential);
          this.user = null;
          this.token = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return true;
        } catch (err) {
          console.error('Logout failed:', err);
          this.error = err.response?.data?.message || 'Đã xảy ra lỗi khi đăng xuất.';
          // Despite the API error, we should still delete local information to ensure safety 
          this.user = null;
          this.token = null;
          this.expiresAt = null;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('expiresAt');
          router.push('/login');
          return false;
        } finally {
          this.loading = false;
        }
      },

      async checkAuth() {
        if (this.authReady) return;

        this.loading = true;
        try {
          const storedToken = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          const storedExpiresAt = localStorage.getItem('expiresAt');

          if (storedToken && storedUser && storedExpiresAt) {
            this.token = storedToken;
            try {
              this.user = JSON.parse(storedUser);
              this.expiresAt = parseInt(storedExpiresAt); // Chuyển đổi về số nguyên
            } catch (e) {
            console.error("Lỗi khi phân tích JSON user từ localStorage:", e);
            this.clearAuthData(); // Delete data if parse error
            // this.user = null;
            this.loading = false
            this.authReady = true;
            // localStorage.removeItem('user');
            return;
          }
          if (this.isTokenValid) {
            console.log('Trạng thái xác thực được khỏi tạo từ localStorage.');
            this.startSessionTimer();
          } else {
            console.log('Token từ localStorage đã hết hạn.');
            this.clearAuthData();
          }
        } else {
          console.log('Không tìm thấy thông tin xác thực trong localStorage.');
          this.clearAuthData(); // Make sure clean status
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
        this.clearAuthData();
      } finally {
        this.authReady = true; // Checkpoint that success check
        this.loading = false;
      }
    },

    async handleSessionExpired() {
      this.stopSessionTimer();
      this.clearAuthData();
      if (router.currentRoute.value.name !== 'login' && !document.querySelector('.el-overlay-message-box')) {
        await ElMessageBox.alert('Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.', 'Phiên làm việc hết hạn', {
          confirmButtonText: 'Đăng nhập lại',
          callback: (action) => {
          },
        }).catch(() => {});
      }
    },

    startSessionTimer() {
      // Make sure do not timer running
      this.stopSessionTimer();
      sessionTimer = setInterval(() => {
        if (!this.isLoggedIn || !this.isTokenValid) {
          console.log('Session hết hạn hoặc không hợp lệ, yêu cầu đăng nhập lại.');
          // this.stopSessionTimer();
          this.handleSessionExpired();
        } else {
        }
      }, 5000);
    },
    /**
     * Dừng timer kiểm tra session.
     */
    stopSessionTimer() {
      if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
        console.log('Session timer đã dừng.');
      }
    },
    /**
     * Xóa tất cả dữ liệu xác thực và chuyển hướng về trang đăng nhập.
     */
    clearAuthData() {
      this.user = null;
      this.token = null;
      this.expiresAt = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiresAt');
      this.stopSessionTimer();
    },
    /**
     * Xóa dữ liệu và hiển thị popup yêu cầu đăng nhập lại.
     */
    // clearAuthDataAndPromptLogin() {
    //   this.clearAuthData();
    //   if (router.currentRoute.value.name !== 'login') {
    //     ElMessageBox.alert('Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.', 'Phiên làm việc hết hạn', {
    //       confirmButtonText: 'Đăng nhập lại',
    //       callback: (action) => {
    //         router.push('/login');
    //       },
    //     });
    //   } else {
    //     router.push('/login');
    //   }
    // }
  },
});