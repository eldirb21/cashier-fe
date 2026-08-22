import { ROLE, RoleType } from "./roles";
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineShoppingCart,
  HiOutlineChartBar,
  HiOutlineTag,
  HiOutlineTruck,
  HiOutlineTrendingUp,
  HiOutlinePresentationChartLine,
  HiOutlineClock,
  HiOutlineDatabase,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlineTicket,
  HiOutlineCreditCard,
  HiOutlineDocumentReport,
} from "react-icons/hi";

export type MenuItem = {
  key: string; // untuk t.nav.xxx
  path?: string;
  icon: keyof typeof ICONS;
  roles: RoleType[]; // siapa saja yang boleh lihat/akses
  hasSub?: boolean;
  sub?: MenuItem[];
  section?: string;
};

export const ICONS = {
  home: HiOutlineHome,
  cube: HiOutlineCube,
  userGroup: HiOutlineUserGroup,
  cart: HiOutlineShoppingCart,
  chart: HiOutlineChartBar,
  tag: HiOutlineTag,
  truck: HiOutlineTruck,
  trending: HiOutlineTrendingUp,
  sales: HiOutlinePresentationChartLine,
  clock: HiOutlineClock,
  database: HiOutlineDatabase,
  refresh: HiOutlineRefresh,
  sparkles: HiOutlineSparkles,
  ticket: HiOutlineTicket,
  creditCard: HiOutlineCreditCard,
  doc: HiOutlineDocumentReport,
};

const ALL_INTERNAL: RoleType[] = [
  ROLE.OWNER,
  ROLE.MANAGER,
  ROLE.ADMIN,
  ROLE.SPV,
  ROLE.CASHIER,
];

export const MENU_CONFIG: MenuItem[] = [
  {
    key: "home",
    path: "/dashboard",
    icon: "home",
    section: "Main",
    roles: ALL_INTERNAL,
  },
  {
    key: "transactions",
    path: "/transactions",
    icon: "cart",
    section: "Main",
    roles: ALL_INTERNAL,
  },
  {
    key: "master",
    icon: "cube",
    section: "Master Data",
    hasSub: true,
    roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN],
    sub: [
      {
        key: "categories",
        path: "/categories",
        icon: "tag",
        roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN],
      },
      {
        key: "product",
        path: "/products",
        icon: "cube",
        roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN],
      },
      {
        key: "supplier",
        path: "/supplier",
        icon: "truck",
        roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN],
      },
    ],
  },
  {
    key: "customers",
    path: "/customers",
    icon: "userGroup",
    section: "Master Data",
    roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN, ROLE.SPV],
  },
  {
    key: "report",
    icon: "chart",
    section: "Reports & Analytics",
    hasSub: true,
    roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN, ROLE.SPV],
    sub: [
      {
        key: "profit",
        path: "/report/profit",
        icon: "trending",
        roles: [ROLE.OWNER, ROLE.MANAGER],
      },
      {
        key: "sales",
        path: "/report/sales",
        icon: "sales",
        roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN, ROLE.SPV],
      },
      {
        key: "shiftKasir",
        path: "/report/shift-kasir",
        icon: "clock",
        roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.SPV],
      },
      {
        key: "stockMutasi",
        path: "/report/stock-dan-mutasi",
        icon: "database",
        roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN],
      },
      {
        key: "voidReturn",
        path: "/report/void-return",
        icon: "refresh",
        roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.SPV],
      },
      {
        key: "supplier",
        path: "/report/supplier",
        icon: "truck",
        roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN],
      },
      {
        key: "memberPoin",
        path: "/report/member-poin",
        icon: "sparkles",
        roles: [ROLE.OWNER, ROLE.MANAGER, ROLE.ADMIN],
      },
      {
        key: "discountPromo",
        path: "/report/discont-promo",
        icon: "ticket",
        roles: [ROLE.OWNER, ROLE.MANAGER],
      },
      {
        key: "paymentMethod",
        path: "/report/payment-report",
        icon: "creditCard",
        roles: [ROLE.OWNER, ROLE.MANAGER],
      },
    ],
  },
];
