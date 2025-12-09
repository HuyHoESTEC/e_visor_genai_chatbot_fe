import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '../stores/auth';
import LoginPage from "../views/auth/LoginPage.vue";
import RegisterPage from "../views/auth/RegisterPage.vue";
// import ContractReviewPage from "../views/main/ContractReviewPage.vue";
// import DashboardPage from "../views/main/DashboardPage.vue";
import ChatPage from "../views/main/ChatPage.vue";
// import ContractsPage from "../views/main/ContractsPage.vue";
// import SettingsPage from "../views/main/SettingsPage.vue";
// import ProfilePage from '../views/profile/ProfilePage.vue';
// import { onAuthStateChanged, auth } from "../firebase";
import MesxDashboard from "../views/WorkShop/mesxDashboard.vue";
import WmsxDashboard from "../views/WMSX/wmsxDashboard.vue";
import QmsxDashboard from "../views/QMSX/qmsxDashboard.vue";
import MmsxDashboard from "../views/MMSX/mmsxDashboard.vue";
import PmsxDashboard from "../views/PMSX/pmsxDashboard.vue";
import TimeTrackingPage from "../views/time-tracking/TimeTrackingPage.vue";
import SummaryDashboard from "../views/dashboard/SummaryDashboard.vue";
import RnDDashboard from "../views/RnD/RnDDashboard.vue";
import RndWorkManagement from "../views/RnD/RndWorkManagement.vue";
import WorkManagementKHTC from "../views/time-tracking/WorkManagementKHTC.vue";
import CreateProdutionOrdersProjects from "../views/WorkShop/CreateProdutionOrdersProjects.vue";
import RndWorkReport from "../views/RnD/RndWorkReport.vue";
import ProductionStageManagement from "../views/WorkShop/ProductionStageManagement.vue";
import WarehouseManagementDashboard from "../views/WorkShop/Warehouse/WarehouseManagementDashboard.vue";
import ImportedGoodsManagment from "../views/WorkShop/Warehouse/ImportedGoodsManagment.vue";
import ExportedGoodsManagement from "../views/WorkShop/Warehouse/ExportedGoodsManagement.vue";
import ExportedNewGoodsManagement from "../views/WorkShop/Warehouse/ExportedNewGoodsManagement.vue";
import { DEPARTMENTS } from "../constants/departmentList";
import { USER_ROLES } from "../constants/roleList";
import { ElMessage } from "element-plus";

const routes = [
  {
    path: '/',
    redirect: '/summary-dashboard',
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
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/NotFoundPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/NotFoundPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mesx',
    name: 'MESX',
    component: MesxDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/wmsx',
    name: 'WMSX',
    component: WmsxDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/qmsx',
    name: 'QMSX',
    component: QmsxDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/mmsx',
    name: 'MMSX',
    component: MmsxDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/pmsx',
    name: 'PMSX',
    component: PmsxDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/summary-dashboard',
    name: 'SummaryDashboard',
    component: SummaryDashboard,
    meta: { 
      requiresAuth: true,
      titleKey: 'SummaryDashboard' 
    }
  },
  // -----KHTC-----
  {
    path: '/time-tracking',
    name: 'TimeTracking',
    component: TimeTrackingPage,
    meta: { 
      requiresAuth: true,
      // Only allow access with HR or Director Department
      allowedDepartments: [
        DEPARTMENTS.HUMAN_RESOURCES_AND_ADMINISTRATOR_DN,
        DEPARTMENTS.HUMAN_RESOURCES_AND_ADMINISTRATOR_HCM,
        DEPARTMENTS.BOARD_OF_DIRECTOR_DN,
        DEPARTMENTS.BOARD_OF_DIRECTOR_HCM,
      ],
      // Only allow access with Admin Role
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  {
    path: '/work-management-khtc',
    name: 'KHTCWorkManagement',
    component: WorkManagementKHTC,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.HUMAN_RESOURCES_AND_ADMINISTRATOR_DN,
        DEPARTMENTS.HUMAN_RESOURCES_AND_ADMINISTRATOR_HCM,
        DEPARTMENTS.BOARD_OF_DIRECTOR_DN,
        DEPARTMENTS.BOARD_OF_DIRECTOR_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  // -----RND-----
  {
    path: '/rnd-dashboard',
    name: 'RndDashboard',
    component: RnDDashboard,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.ESTEC_DIGITAL_DN,
        DEPARTMENTS.ESTEC_DIGITAL_HCM,
        DEPARTMENTS.RND_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  {
    path: '/rnd-work-tracking',
    name: 'RndWorkTracking',
    component: RndWorkManagement,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.ESTEC_DIGITAL_DN,
        DEPARTMENTS.ESTEC_DIGITAL_HCM,
        DEPARTMENTS.RND_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  {
    path: '/rnd-work-report',
    name: 'RndWorkReport',
    component: RndWorkReport,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.ESTEC_DIGITAL_DN,
        DEPARTMENTS.ESTEC_DIGITAL_HCM,
        DEPARTMENTS.RND_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  // -----WorkShop-----
  {
    path: '/workshop-summary-dashboard',
    name: 'WorkshopDashboard',
    component: SummaryDashboard,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN,
        DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  {
    path: '/create-production-orders-project',
    name: 'CreateProdutionOrdersProjects',
    component: CreateProdutionOrdersProjects,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN,
        DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  {
    path: '/production-stage-management',
    name: 'ProductionStageManagement',
    component: ProductionStageManagement,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN,
        DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  {
    path: '/warehouse-dashboard',
    name: 'WarehouseDashboardRoute',
    component: WarehouseManagementDashboard,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN,
        DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  {
    path: '/import-warehouse',
    name: 'ImportWarehouseRoute',
    component: ImportedGoodsManagment,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN,
        DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  {
    path: '/export-warehouse',
    name: 'ExportWarehouseRoute',
    component: ExportedNewGoodsManagement,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN,
        DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  {
    path: '/installation-warehouse',
    name: 'InstallationWarehouseRoute',
    component: ExportedGoodsManagement,
    meta: { 
      requiresAuth: true,
      allowedDepartments: [
        DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN,
        DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM,
      ],
      allowedRoles: [
        USER_ROLES.ADMIN,
        USER_ROLES.DIRECTOR,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.EMPLOYEE,
      ]
    }
  },
  // -----NotFound-----
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue') // Lazy load 404 page
  },
  {
    path: '/forbiddent',
    name:'Forbiddent',
    component: () => import('../views/Forbidden.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  // 0. If the route is Forbidden, allow it to continue (to display an error page)
  if (to.name === 'Forbidden') {
    return next();
  }
  // Đảm bảo authStore đã sẵn sàng. Nếu chưa, chạy checkAuth.
  // Điều này cần thiết cho lần đầu tải trang hoặc khi refresh.
  if (!authStore.authReady) {
    await authStore.checkAuth();
  }

  const isLoggedIn = authStore.isLoggedIn;
  const isTokenStillValid = authStore.isTokenValid;

  // 1. Nếu route yêu cầu xác thực
  // if (to.meta.requiresAuth && !authStore.isLoggedIn) {
  //   if (!isLoggedIn || !isTokenStillValid) {
  //     console.log('Router Guard: Chưa đăng nhập hoặc token đã hết hạn. Chuyển hướng về Login.');
      
  //     // Gọi handleSessionExpired để hiển thị popup (nếu cần) và xóa dữ liệu
  //     // handleSessionExpired đã có logic kiểm tra to.name !== 'Login' và .el-overlay-message-box
  //     await authStore.handleSessionExpired(); 
      
  //     next('/login'); // Chắc chắn chuyển hướng về trang login
  //   } else {
  //     // Đã đăng nhập và token còn hạn, cho phép đi tiếp
  //     console.log('Router Guard: Đã đăng nhập và token còn hạn. Cho phép truy cập.');
  //     next();
  //   }
  // } 
  // // 2. Nếu route là login/register và người dùng đã đăng nhập (và token còn hạn)
  // else if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn && isTokenStillValid) {
  //   console.log('Router Guard: Đã đăng nhập và token còn hạn. Chuyển hướng từ Login/Register về Dashboard.');
  //   next('/summary-dashboard');
  // } 
  // // 3. Các trường hợp còn lại (route không yêu cầu xác thực)
  // else {
  //   console.log('Router Guard: Cho phép truy cập route không yêu cầu xác thực hoặc đã xử lý.');
  //   next();
  // }

  // 1. Authentication Check
  if (to.meta.requiresAuth && (!isLoggedIn || !isTokenStillValid)) {
    console.log('Router Guard: Chưa đăng nhập hoặc token đã hết hạn. Chuyển hướng về Login.');
    await authStore.handleSessionExpired();
    return next('/login');
  }
  // 2. Check the Login/Register route when logged in
  if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn && isTokenStillValid) {
    console.log('Router Guard: Đã đăng nhập và token còn hạn. Chuyển hướng về Dashboard.');
    return next('/summary-dashboard');
  }
  // 3. Authorization Check
  if (to.meta.requiresAuth && isLoggedIn && isTokenStillValid) {
    const userDepartmentId = authStore.userDepartmentId;
    const userRoleId = authStore.userRoleId;
    // Skip permission checks for Admin and Director (as defined in the new getter)
    if (authStore.isAdminOrDirector) {
      console.log('Router Guard: User là Admin hoặc Director. Cho phép truy cập.');
      return next();
    }

    const allowedDepartments = to.meta.allowedDepartments;
    const allowedRoles = to.meta.allowedRoles;
    let isAuthorized = true;
    // 3.1. Check permissions by Department
    if (allowedDepartments && allowedDepartments.length > 0) {
      if (!allowedDepartments.includes(userDepartmentId)) {
        isAuthorized = false;
        ElMessage.error('Phòng ban của bạn không được phép truy cập vào trang này.');
        console.log(`Authoriaztion Failed: Department ID ${userDepartmentId} not allowed in ${to.path}.`);
      }
    }
    // 3.2. Check permissions by Role (Only check if Department has passed or does not require Department check)
    if (isAuthorized && allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRoleId)) {
        isAuthorized = false;
        ElMessage.error('Vai trò (Role) của bạn không được phép truy cập trang này.');
        console.log(`Authorization Failed: Role ID ${userRoleId} not allowed in ${to.path}.`);
      }
    }
    // If there is no permission (Authorization Failed)
    if (!isAuthorized) {
      return next('/forbiddent');
    }
  }
  // 4. Allow forwarding for the remaining routes (all checks have passed, or no checks are required)
  console.log('Router Guard: Cho phép truy cập.');
  next();
});


export default router;