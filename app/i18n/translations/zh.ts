import type { Translations } from "./id";

const zh: Translations = {
  // ── Auth / Login ────────────────────────────────────────────
  login: {
    title: "收银员登录",
    subtitle: "输入您的账户以访问收银系统",
    identifierLabel: "邮箱 / 手机号码",
    identifierPlaceholder: "example@mail.com 或 08123456789",
    identifierError: "请输入有效的邮箱或手机号码",
    passwordLabel: "密码",
    passwordPlaceholder: "输入您的密码",
    passwordError: "密码至少需要6个字符",
    forgotPassword: "忘记密码？",
    submit: "登录收银系统",
    loading: "加载中...",
    noAccount: "没有账户？",
    register: "立即注册",
  },

  // ── Header / Navigation ─────────────────────────────────────
  nav: {
    home: "首页",
    master: "主数据",
    categories: "分类",
    product: "产品",
    supplier: "供应商",
    customers: "客户",
    transactions: "交易",
    report: "报告",
    profit: "利润",
    sales: "销售",
    shift: "收银员班次",
    stockMutasi: "库存 & 变动",
    voidReturn: "作废 / 退货",
    memberPoin: "会员 / 积分",
    discountPromo: "折扣 & 促销",
    scan: "扫码",
    history: "历史记录",
    profile: "个人资料",
    users: "用户",
  },

  // ── Profile / Dropdown ──────────────────────────────────────
  profile: {
    viewProfile: "查看资料",
    logout: "退出登录",
    username: "用户名",
    email: "邮箱",
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    copyright: "© 2026 Eldir 电话/wa: +62 813 1018 1765",
  },

  // ── Dashboard ──────────────────────────────────────────────
  dashboard: {
    title: "仪表盘",
    welcome: "欢迎回来",
    todaySales: "今日销售额",
    totalTransactions: "总交易数",
    totalProducts: "总产品数",
    totalCustomers: "总客户数",
  },

  // ── Language Switcher ───────────────────────────────────────
  language: {
    label: "语言",
    id: "Indonesia",
    en: "English",
    zh: "中文",
  },
};

export default zh;
