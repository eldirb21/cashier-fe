import type { Translations } from "./id";

const en: Translations = {
  // ── Auth / Login ────────────────────────────────────────────
  login: {
    title: "Cashier Login",
    subtitle: "Enter your account to access the cashier system",
    identifierLabel: "Email / Phone Number",
    identifierPlaceholder: "example@mail.com or 08123456789",
    identifierError: "Please enter a valid email or phone number",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    passwordError: "Password must be at least 6 characters",
    forgotPassword: "Forgot Password?",
    submit: "Sign In to Cashier",
    loading: "Loading...",
    noAccount: "Don't have an account?",
    register: "Register Now",
  },

  // ── Header / Navigation ─────────────────────────────────────
  nav: {
    home: "HOME",
    master: "MASTER",
    categories: "CATEGORIES",
    product: "PRODUCT",
    supplier: "SUPPLIER",
    customers: "CUSTOMERS",
    transactions: "TRANSACTIONS",
    report: "REPORT",
    profit: "PROFIT",
    sales: "SALES",
    shift: "CASHIER SHIFT",
    stockMutasi: "STOCK & MUTATION",
    voidReturn: "VOID / RETURN",
    memberPoin: "MEMBER / POINTS",
    discountPromo: "DISCOUNT & PROMO",
    paymentMethod: "PAYMENT METHOD",
    users: "USERS",
  },

  // ── Profile / Dropdown ──────────────────────────────────────
  profile: {
    viewProfile: "View Profile",
    logout: "Logout",
    username: "Username",
    email: "Email",
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    copyright: "© 2026 Eldir phone/wa: +62 813 1018 1765",
  },

  // ── Dashboard ──────────────────────────────────────────────
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome back",
    todaySales: "Today's Sales",
    totalTransactions: "Total Transactions",
    totalProducts: "Total Products",
    totalCustomers: "Total Customers",
  },

  // ── Language Switcher ───────────────────────────────────────
  language: {
    label: "Language",
    id: "Indonesia",
    en: "English",
    zh: "中文",
  },
};

export default en;
