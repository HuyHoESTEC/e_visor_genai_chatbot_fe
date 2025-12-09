import { defineStore } from "pinia";
import router from "../router";
import { loginApi, logoutApi } from "../services/auth.service";
import { ElMessageBox, ElMessage } from "element-plus";
import { USER_ROLES } from "../constants/roleList";
let sessionTimer = null; // Variable to store timer ID

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    expiresAt: localStorage.getItem('expiresAt') ? parseInt(localStorage.getItem('expiresAt')) : null,
    loading: false,
    error: null,
    authReady: false,
    role: null,
    department: null,
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
    // -- Getter get Role ID and Department IDrole_id
    userRoleId: (state) => state.user?.role || null,
    userDepartmentId: (state) => state.user?.department || null,

    isAdmin: (state) => state.user?.role === USER_ROLES.ADMIN,
    isManage: (state) => state.user?.role === USER_ROLES.DIRECTOR,
    isProjectManage: (state) => state.user?.role === USER_ROLES.PROJECT_MANAGER,
    isEmployee: (state) => state.user?.role === USER_ROLES.EMPLOYEE,
    isAdminOrDirector: (state) => state.user?.role === USER_ROLES.ADMIN || state.user?.role === USER_ROLES.DIRECTOR,
    // -- General getter to check permissions flexibly
    // Use: authStore.hasAccess(requiredRole, requiredDepts)
    hasAccess: (state) => {
      return (allowedRoles = [], allowedDepartments = []) => {
        if (!state.user) return false;

        const currentRole = state.user.role;
        const currentDept = state.user.department;
        // If user is Admin then set full permission
        if (currentRole === USER_ROLES.ADMIN) return true;
        // Check Role
        const roleMatch = allowedRoles.length === 0 || allowedRoles.includes(currentRole);
        // Check department
        const deptMatch = allowedDepartments.length === 0 || allowedDepartments.includes(currentDept);

        return roleMatch && deptMatch;
      };
    }
  },
  actions: {
      /**
       * * @param {Object} credentials 
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
              ElMessage.error(this.error); // Hiển thị lỗi nếu thời gian hết hạn không hợp lệ
              return false;
            }
            this.user = {
              id: response.user_id,
              name: response.full_name,
              avatar: response.avatar,
              role: response.role_id,
              department: response.department_id,
            };
            this.token = response.session_id;
            this.expiresAt = expirationTime;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            localStorage.setItem('expiresAt', this.expiresAt.toString());
            this.role = { id: response.role_id };
            this.department = { id: response.department_id };

            this.startSessionTimer();
            router.push('/summary-dashboard');
            return true;
          } else {
            this.error = response.message;
            ElMessage.error(this.error); // Hiển thị lỗi nếu phản hồi không hợp lệ
            return false;
          }
        } catch (err) {
          console.error('Login failed:', err);
          if (err.response && err.response.data) {
            const errorData = err.response.data;
            if (errorData.authentication === "failed" && errorData.message) {
              this.error = errorData.message; 
              ElMessage.error(this.error); // **Chỉ hiển thị ElMessage ở đây cho lỗi login sai**
            } else if (errorData.message) {
              this.error = errorData.message;
              ElMessage.error(this.error);
            } else {
              this.error = 'Đăng nhập thất bại. Vui lòng thử lại sau.';
              ElMessage.error(this.error);
            }
          } else {
            this.error = 'Đăng nhập thất bại. Vui lòng kiểm tra kết nối mạng.';
            ElMessage.error(this.error);
          }
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
        this.stopSessionTimer();
        try {
          await logoutApi(credential);
          this.user = null;
          this.token = null;
          this.expiresAt = null; // Clear expiresAt on logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('expiresAt');
          router.push({ name: "Login" });
          return true;
        } catch (err) {
          console.error('Logout failed:', err);
          this.error = err.response?.data?.message || 'Đã xảy ra lỗi khi đăng xuất.';
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
              this.expiresAt = parseInt(storedExpiresAt);
              if (this.user && this.user.role !== undefined) {
                this.role = { id: this.user.role };
              } else {
                this.role = null;
              }

              if (this.user && this.user.department !== undefined) {
                this.department = { id: this.user.department };
              } else {
                this.department = null;
              }
            } catch (e) {
              console.error("Lỗi khi phân tích JSON user từ localStorage:", e);
              this.clearAuthData();
              this.loading = false
              this.authReady = true;
              return;
            }
            if (this.isTokenValid) {
              console.log('Trạng thái xác thực được khởi tạo từ localStorage.');
              this.startSessionTimer();
            } else {
              console.log('Token từ localStorage đã hết hạn.');
              this.clearAuthData();
              // Không gọi handleSessionExpired ở đây, để router guard hoặc timer xử lý
            }
          } else {
            console.log('Không tìm thấy thông tin xác thực trong localStorage.');
            this.clearAuthData();
          }
        } catch (error) {
          console.error('Lỗi khi kiểm tra xác thực:', error);
          this.clearAuthData();
        } finally {
          this.authReady = true;
          this.loading = false;
        }
      },

      async handleSessionExpired() {
        this.stopSessionTimer();
        this.clearAuthData(); // Xóa dữ liệu trước khi hiển thị popup
        console.log('Phiên làm việc đã hết hạn. Đang kiểm tra để hiển thị popup...');

        // Chỉ hiển thị popup nếu đang không ở trang login
        // và chưa có popup ElMessageBox nào đang hiển thị
        if (router.currentRoute.value.name !== 'Login' && !document.querySelector('.el-overlay-message-box')) {
          console.log('Hiển thị popup "Phiên làm việc hết hạn".');
          await ElMessageBox.alert('Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.', 'Phiên làm việc hết hạn', {
            confirmButtonText: 'Đăng nhập lại',
            callback: (action) => {
              // Có thể thêm logic gì đó sau khi người dùng bấm nút nếu cần
              // Ví dụ: router.push('/login'); nhưng điều này đã được xử lý bởi router guard
              router.push({ name: "Login" });
            },
          }).catch(() => { /* Người dùng đã đóng box */ });
        } else {
          console.log('Không hiển thị popup vì đang ở trang login hoặc popup đã hiển thị.');
        }
        // Lưu ý: Việc chuyển hướng đến /login nên được router guard xử lý sau khi gọi handleSessionExpired
      },

      startSessionTimer() {
        this.stopSessionTimer();
        sessionTimer = setInterval(() => {
          if (!this.isLoggedIn || !this.isTokenValid) {
            console.log('Session hết hạn hoặc không hợp lệ bởi Timer, yêu cầu đăng nhập lại.');
            this.handleSessionExpired();
          } else {
            // console.log('Session timer: Token vẫn hợp lệ.');
          }
        }, 5000); // Kiểm tra mỗi 5 giây
      },
      
      stopSessionTimer() {
        if (sessionTimer) {
          clearInterval(sessionTimer);
          sessionTimer = null;
          console.log('Session timer đã dừng.');
        }
      },
      
      clearAuthData() {
        this.user = null;
        this.token = null;
        this.expiresAt = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiresAt');
        this.stopSessionTimer();
      },
  },
});