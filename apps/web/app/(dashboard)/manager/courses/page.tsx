"use client";
export default function ManagerCourseCatalogPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: "var(--color-content-bg)" }}>
      <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Course Catalog</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>View, build and submit courses for review</p>
      <div style={{ marginTop: 32, background: "var(--color-content-card)", borderRadius: 12, border: "1px solid var(--color-content-border)", padding: 40, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
        Building now…
      </div>
    </div>
  );
}
