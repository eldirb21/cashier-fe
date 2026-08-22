import { MENU_CONFIG, MenuItem } from "./menu-config";
import { RoleType } from "./roles";

// flatten semua path + roles (termasuk sub menu) jadi map path->roles
function flattenMenu(items: MenuItem[]): { path: string; roles: RoleType[] }[] {
  return items.flatMap((item) => {
    const current = item.path ? [{ path: item.path, roles: item.roles }] : [];
    const subs = item.sub ? flattenMenu(item.sub) : [];
    return [...current, ...subs];
  });
}

const FLAT_ROUTES = flattenMenu(MENU_CONFIG);

export function isRouteAllowed(pathname: string, role: RoleType): boolean {
  const matched = FLAT_ROUTES.find((r) => pathname.startsWith(r.path));
  if (!matched) return true; // route yang tidak terdaftar, default lolos (misal /unauthorized)
  return matched.roles.includes(role);
}

// helper untuk filter menu sesuai role (dipakai di Sidebar)
export function getMenuForRole(role: RoleType): MenuItem[] {
  return MENU_CONFIG.filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      sub: item.sub?.filter((s) => s.roles.includes(role)),
    }))
    .filter((item) => !item.hasSub || (item.sub && item.sub.length > 0));
}
