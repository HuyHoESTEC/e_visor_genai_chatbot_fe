/**
 * Import các icon bạn cần sử dụng từ Element Plus
 * Lưu ý: Bạn sẽ cần import và đăng ký chúng trong SideBar.vue
 * hoặc sử dụng một cách tiếp cận linh hoạt hơn nếu số lượng icon lớn
 * Đối với ví dụ này, chúng ta chỉ cần tên của component icon
 * import { ChatDotRound, Timer, TrendCharts, OfficeBuilding, Box, DataAnalysis, Cpu, ShoppingTrolley } from "@element-plus/icons-vue";
 */

import { DEPARTMENTS } from "./departmentList";

const MENU_ITEMS = [
  {
    name: "summary-dashboard",
    label: "Thống kê",
    labelKey: "SummaryDashboard",
    iconComponent: "Histogram",
    routeName: "SummaryDashboard",
    requiredDepartments: [],
    isActive: false,
  },
  // -----KHTC Department-----
  {
    name: "KHTC",
    label: "Kế hoạch tổ chức",
    labelKey: "OrganizationalPlan",
    iconComponent: "UserFilled",
    routeName: null,
    isActive: false,
    isDropdown: true,
    requiredDepartments: [DEPARTMENTS.HUMAN_RESOURCES_AND_ADMINISTRATOR_HCM],
    children: [
      {
        name: "time-tracking",
        label: "Quản lý kế hoạch làm việc",
        labelKey: "TimekeepingManagement",
        iconComponent: "List",
        routeName: "TimeTracking",
        requiredDepartments: [DEPARTMENTS.HUMAN_RESOURCES_AND_ADMINISTRATOR_HCM],
        isActive: false,
      },
      {
        name: "khtc-work-management",
        label: "Quản lý công việc",
        labelKey: "KHTCWorkManagement",
        iconComponent: "Briefcase",
        routeName: "KHTCWorkManagement",
        requiredDepartments: [DEPARTMENTS.HUMAN_RESOURCES_AND_ADMINISTRATOR_HCM],
        isActive: false,
      }
    ]
  },
  // -----RnD Department-----
  {
    name: "RND",
    label: "Nghiên cứu và phát triển",
    iconComponent: "Compass",
    routeName: null,
    isDropdown: true,
    requiredDepartments: [DEPARTMENTS.ESTEC_DIGITAL_DN, DEPARTMENTS.ESTEC_DIGITAL_HCM],
    children: [
      {
        name: "rnd-dashboard",
        label: "Thống kê",
        labelKey: "workManagementDashboard",
        iconComponent: "Histogram",
        routeName: "RndDashboard",
        requiredDepartments: [DEPARTMENTS.ESTEC_DIGITAL_DN, DEPARTMENTS.ESTEC_DIGITAL_HCM],
        isActive: false,
      },
      {
        name: "rnd-work-tracking",
        label: "Quản lý công việc",
        labelKey: "workManagementTitle",
        iconComponent: "List",
        routeName: "RndWorkTracking",
        requiredDepartments: [DEPARTMENTS.ESTEC_DIGITAL_DN, DEPARTMENTS.ESTEC_DIGITAL_HCM],
        isActive: false,
      },
      {
        name: "rnd-work-report",
        label: "Báo cáo công việc",
        labelKey: "workReport",
        iconComponent: "EditPen",
        routeName: "RndWorkReport",
        requiredDepartments: [DEPARTMENTS.ESTEC_DIGITAL_DN, DEPARTMENTS.ESTEC_DIGITAL_HCM],
        isActive: false,
      },
    ]
  },
  // -----WorkShop Department-----
  {
    name: "WorkShop",
    label: "Xưởng sản xuất",
    iconComponent: "OfficeBuilding",
    routeName: "WorkShop",
    isActive: false,
    isDropdown: true,
    requiredDepartments: [DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN, DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM],
    children: [
      {
        name: "WarehouseManagement",
        label: "Quản lý kho",
        routeName: null,
        isDropdown: true,
        requiredDepartments: [DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN, DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM],
        iconComponent: "Box",
        children: [
          {
            name: "WarehouseDashboard",
            label: "Thống kê",
            routeName: "WarehouseDashboardRoute",
            iconComponent: "List",
            isActive: false,
            requiredDepartments: [DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN, DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM],
          },
          {
            name: "ImportWarehouse",
            label: "Nhập kho",
            routeName: "ImportWarehouseRoute",
            iconComponent: "ShoppingCart",
            isActive: false,
            requiredDepartments: [DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN, DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM],
          },

          {
            name: "ExportWarehouse",
            label: "Xuất kho",
            routeName: "ExportWarehouseRoute",
            iconComponent: "Van",
            isActive: false,
            requiredDepartments: [DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN, DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM],
          },

          {
            name: "InstallationWarehouse",
            label: "Lắp đặt",
            routeName: "InstallationWarehouseRoute",
            iconComponent: "Cpu",
            isActive: false,
            requiredDepartments: [DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN, DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM],
          },
        ],
      },
      {
        name: "ConstructionManagement",
        label: "Thiết kế thi công",
        routeName: null,
        isDropdown: true,
        requiredDepartments: [DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN, DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM],
        iconComponent: "AddLocation",
        children: [
          {
            name: "ConstructionDashboard",
            label: "Thống kê",
            routeName: "ConstructioDashboardRoute",
            iconComponent: "List",
            isActive: false,
            requiredDepartments: [DEPARTMENTS.M_AND_E_FLENDER_GEAR_BOXES_REPAIRING_SERVICES_DN, DEPARTMENTS.M_AND_E_TECHNICIAN_TEAM_HCM],
          },
        ],
      },
    ],
  },
  // {
  //   name: "chat",
  //   label: "ESTEC AI",
  //   iconComponent: "ChatLineSquare",
  //   routeName: "Chat",
  //   isActive: false,
  // },
];

export { MENU_ITEMS };