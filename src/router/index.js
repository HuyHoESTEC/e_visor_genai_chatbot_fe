import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '../stores/auth';
import LoginPage from "../views/auth/LoginPage.vue";
import RegisterPage from "../views/auth/RegisterPage.vue";
import ContractReviewPage from "../views/main/ContractReviewPage.vue";
import DashboardPage from "../views/main/DashboardPage.vue";
import ChatPage from "../views/main/ChatPage.vue";
import ContractsPage from "../views/main/ContractsPage.vue";
import SettingsPage from "../views/main/SettingsPage.vue";
import { onAuthStateChanged, auth } from "../firebase";

const routes = [
  {
    path: '/',
    redirect: '/contract-review',
    meta: { requiresAuth: true } // Request login to access the default routes
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { guestOnly: true } // Only allow guest (do not login) accept
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { guestOnly: true } // Only allow guest (do not login) accept
  },
  {
    path: '/contract-review',
    name: 'ContractReview',
    component: ContractReviewPage,
    meta: { requiresAuth: true } // Login request
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/contract',
    name: 'Contract',
    component: ContractsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue') // Lazy load 404 page
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global Navigation Guard
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();
//   /**
//    * Ensure the user status is checked (for example, from localstorage)
//    * Before Route Guard runs if you load the page
//    * The better way is to perform the token check in the Pinia Store when the app starts.
//    */
//   if (!authStore.isLoggedIn && authStore.token) {
//     await authStore.checkAuth(); // Check the token if it is in localstorage but not login
//   }

//   const isLoggedIn = authStore.isLoggedIn;
  
//   if (to.meta.requiresAuth && !isLoggedIn) {
//     // If router request login but user do not login, redirect to login page
//     next({ name: 'Login' });
//   } else if (to.meta.guestOnly && isLoggedIn) {
//     // If the route is only for guests (login/register) that users have logged in, shifted to the main page
//     next({ name: 'Chat' }); // Or can redirect to dashboard page
//   } else {
//     next(); // Allow accept to system
//   }
// });

// Global Navigation Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Đợi cho trạng thái Firebase Auth được khởi tạo (onAuthStateChanged đã chạy lần đầu)
  if (!authStore.authReady) {
    // Nếu authReady là false, đợi một chút (hoặc sử dụng Promise)
    // Cách này không lý tưởng cho production nhưng đơn giản cho debug
    await new Promise(resolve => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Ngừng lắng nghe sau khi trạng thái được xác định
            resolve();
        });
    });
  }

  const isLoggedIn = authStore.isLoggedIn; // Sau khi đợi, isLoggedIn sẽ chính xác

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login' });
  } else if (to.meta.guestOnly && isLoggedIn) {
    next({ name: 'Chat' });
  } else {
    next();
  }
});

export default router;