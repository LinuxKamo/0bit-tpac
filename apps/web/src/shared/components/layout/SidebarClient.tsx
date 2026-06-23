"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { useRouter } from "next/navigation";
import { NAV_CONFIG } from "@/shared/config/nav.config";
import { BRAND } from "@/shared/config/branding.config";
import {
  LayoutDashboard, ScrollText, Shield, ToggleLeft, Zap, Plug, Settings,
  Globe, Layers, GraduationCap, Users, UsersRound, Building2, TrendingUp,
  Megaphone, BarChart3, MessageSquare, UserCheck, Calendar, BookOpen,
  Briefcase, FileText, Receipt, Star, UserCircle, LogOut, Heart,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  LayoutDashboard, ScrollText, Shield, ToggleLeft, Zap, Plug, Settings,
  Globe, Layers, GraduationCap, Users, UsersRound, Building2, TrendingUp,
  Megaphone, BarChart3, MessageSquare, UserCheck, Calendar, BookOpen,
  Briefcase, FileText, Receipt, Star, UserCircle, LogOut, Heart,
};

interface Props {
  collapsed: boolean;
}

export default function SidebarClient({ collapsed }: Props) {
  const pathname = usePathname();
  const { user }  = useAuth();

  const role   = user?.role ?? "";
  const groups = NAV_CONFIG[role] ?? [];

  const W = collapsed ? "64px" : "var(--sidebar-width)";

  return (
    <aside style={{
      width:           W,
      minWidth:        W,
      height:          "100vh",
      backgroundColor: "var(--color-sidebar-bg)",
      borderRight:     "1px dashed var(--color-sidebar-border)",
      display:         "flex",
      flexDirection:   "column",
      flexShrink:      0,
      overflow:        "hidden",
      zIndex:          20,
      fontFamily:      "'Inter', sans-serif",
      transition:      "width 0.2s ease, min-width 0.2s ease, background-color 0.2s ease",
    }}>

      {/* ── Logo ───────────────────────────────────────────────────────────── */}
      <div style={{
        display:    "flex",
        alignItems: "center",
        gap:        "12px",
        padding:    collapsed ? "20px 14px" : "20px",
        flexShrink: 0,
        height:     "var(--topnav-height)",
      }}>
        <div style={{
          width:          "36px",
          height:         "36px",
          borderRadius:   "8px",
          background:     "#5b4fcf",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
        }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: "16px", fontFamily: "'DM Sans', sans-serif" }}>
            {BRAND.logoMark}
          </span>
        </div>
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ color: "var(--color-sidebar-text-active)", fontWeight: 700, fontSize: "13px", lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>
              {BRAND.name}
            </div>
            <div style={{ color: "var(--color-sidebar-group-label)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em" }}>
              {BRAND.subtitle}
            </div>
          </div>
        )}
      </div>

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav style={{
        flex:      1,
        padding:   collapsed ? "12px 8px" : "12px",
        overflowY: "auto",
        overflowX: "hidden",
      }}>
        {groups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: "20px" }}>
            {group.label && !collapsed && (
              <div style={{
                color:         "var(--color-sidebar-group-label)",
                fontSize:      "10px",
                fontWeight:    600,
                letterSpacing: "0.08em",
                padding:       "0 12px",
                marginBottom:  "4px",
              }}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const isActive =
                pathname === item.href ||
                (item.href.split("/").length > 2 && pathname.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap:            "10px",
                    padding:        collapsed ? "10px" : "8px 12px",
                    borderRadius:   "8px",
                    marginBottom:   "2px",
                    textDecoration: "none",
                    borderLeft:     !collapsed && isActive ? "3px solid var(--color-sidebar-indicator)" : "3px solid transparent",
                    paddingLeft:    !collapsed && isActive ? "9px" : collapsed ? undefined : "12px",
                    background:     isActive ? "var(--color-sidebar-item-active-bg)" : "transparent",
                    transition:     "background 0.12s ease",
                  }}
                  className="sidebar-nav-link"
                >
                  {Icon && (
                    <Icon
                      size={16}
                      style={{
                        color:    isActive ? "var(--color-sidebar-icon-active)" : "var(--color-sidebar-icon)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {!collapsed && (
                    <span style={{
                      color:      isActive ? "var(--color-sidebar-text-active)" : "var(--color-sidebar-text)",
                      fontSize:   "13px",
                      fontWeight: isActive ? 600 : 400,
                      flex:       1,
                    }}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span style={{
                      background:   "#5b4fcf",
                      color:        "#fff",
                      fontSize:     "10px",
                      fontWeight:   700,
                      borderRadius: "999px",
                      padding:      "2px 7px",
                      minWidth:     "18px",
                      textAlign:    "center",
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

    </aside>
  );
}
