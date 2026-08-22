const id = {
  // ── Auth / Login ────────────────────────────────────────────
  login: {
    title: "Login Kasir",
    subtitle: "Masukkan akun Anda untuk mengakses sistem kasir",
    identifierLabel: "Email / Nomor HP",
    identifierPlaceholder: "contoh@mail.com atau 08123456789",
    identifierError: "Masukkan email atau nomor HP yang valid",
    passwordLabel: "Password",
    passwordPlaceholder: "Masukkan password",
    passwordError: "Password minimal 6 karakter",
    forgotPassword: "Lupa Password?",
    submit: "Masuk ke Kasir",
    loading: "Memuat...",
    noAccount: "Belum punya akun?",
    register: "Daftar Sekarang",
  },

  // ── Header / Navigation ─────────────────────────────────────
  nav: {
    home: "HOME",
    master: "MASTER",
    categories: "KATEGORI",
    product: "PRODUK",
    supplier: "SUPPLIER",
    customers: "PELANGGAN",
    transactions: "TRANSAKSI",
    report: "LAPORAN",
    profit: "LABA",
    sales: "PENJUALAN",
    shift: "SHIFT KASIR",
    stockMutasi: "STOK & MUTASI",
    voidReturn: "VOID / RETUR",
    memberPoin: "MEMBER / POIN",
    discountPromo: "DISKON & PROMO",
    scan: "SCAN",
    history: "RIWAYAT",
    profile: "PROFIL",
    users: "PENGGUNA",
  },

  // ── Profile / Dropdown ──────────────────────────────────────
  profile: {
    viewProfile: "Lihat Profil",
    logout: "Keluar",
    username: "Username",
    email: "Email",
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    copyright: "© 2026 Eldir telp/wa: +62 813 1018 1765",
  },

  // ── Dashboard ──────────────────────────────────────────────
  dashboard: {
    title: "Dashboard",
    welcome: "Selamat datang kembali",
    todaySales: "Penjualan Hari Ini",
    totalTransactions: "Total Transaksi",
    totalProducts: "Total Produk",
    totalCustomers: "Total Pelanggan",
  },

  // ── Language Switcher ───────────────────────────────────────
  language: {
    label: "Bahasa",
    id: "Indonesia",
    en: "English",
    zh: "中文",
  },
};

export default id;
export type Translations = typeof id;
