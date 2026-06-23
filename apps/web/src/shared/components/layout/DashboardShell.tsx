"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import SidebarClient from "./SidebarClient";
import TopNav from "./TopNav";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div style={{
        display:         "flex",
        height:          "100vh",
        alignItems:      "center",
        justifyContent:  "center",
        backgroundColor: "var(--color-bg)",
      }}>
        <div style={{
          width:        "24px",
          height:       "24px",
          border:       "2px solid var(--color-accent)",
          borderTop:    "2px solid transparent",
          borderRadius: "50%",
          animation:    "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      display:         "flex",
      height:          "100vh",
      overflow:        "hidden",
      backgroundColor: "var(--color-bg)",
    }}>
      <SidebarClient collapsed={collapsed} />

      <div style={{
        flex:          1,
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",
        minWidth:      0,
      }}>
        <TopNav collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <main style={{ flex: 1, overflowY: "auto", padding: "0" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
