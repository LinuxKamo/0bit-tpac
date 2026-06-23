"use client";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

const BG   = "var(--color-content-bg)"; const CARD = "var(--color-content-card)"; const BORD = "var(--color-content-border)";

const INTEGRATIONS = [
  { name: "Supabase",   category: "Database",      status: "connected", detail: "postgresql://...supabase.co:5432/postgres" },
  { name: "Railway",    category: "API Hosting",   status: "connected", detail: "https://0bit-tpac-api.up.railway.app"      },
  { name: "Vercel",     category: "Web Hosting",   status: "connected", detail: "https://tpac.tshimologong.co.za"           },
  { name: "Resend",     category: "Email",         status: "connected", detail: "From: noreply@tshimologong.co.za"          },
  { name: "Paystack",   category: "Payments",      status: "pending",   detail: "API key not verified"                     },
  { name: "Google SSO", category: "Auth",          status: "connected", detail: "Client ID: 4918...apps.googleusercontent"  },
  { name: "Cloudinary", category: "File Storage",  status: "error",     detail: "Upload preset misconfigured"              },
  { name: "OpenAI",     category: "AI / Matching", status: "connected", detail: "gpt-4o-mini, embeddings"                  },
];

export default function IntegrationsPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Integrations</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>Connected services and third-party APIs</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {INTEGRATIONS.map(int => {
          const ok  = int.status === "connected";
          const err = int.status === "error";
          const c   = ok ? "#1e8c6e" : err ? "#c0392b" : "#b86e00";
          return (
            <div key={int.name} style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, padding: 20, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {ok ? <CheckCircle size={18} style={{ color: c }} /> : err ? <XCircle size={18} style={{ color: c }} /> : <RefreshCw size={18} style={{ color: c }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 700 }}>{int.name}</span>
                  <span style={{ background: `${c}18`, color: c, fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 9px" }}>{int.status}</span>
                </div>
                <div style={{ color: "#5b4fcf", fontSize: 11, fontWeight: 600, marginTop: 2 }}>{int.category}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: 11, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{int.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
