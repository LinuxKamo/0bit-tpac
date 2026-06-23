"use client";
export default function Page() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: "var(--color-content-bg)" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Communications</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Send messages and announcements</p>
      </div>
      <div style={{ background: "var(--color-content-card)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "#1e8c6e18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#1e8c6e" }} />
        </div>
        <div style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Coming Soon</div>
        <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>This section is being built with Figma designs</div>
      </div>
    </div>
  );
}
