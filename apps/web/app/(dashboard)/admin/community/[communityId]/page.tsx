"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Hash, Bell, Send, Users, Search, Smile, Paperclip, ChevronDown, ChevronRight, Megaphone, CheckSquare, FileText, Wrench, UploadCloud } from "lucide-react";

const BG = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

const DEMO_PROGRAMS = [
  { id: "1", title: "Web Development Bootcamp", color: "#5b4fcf", short: "WD" },
  { id: "2", title: "Data Science Fundamentals", color: "#1e8c6e", short: "DS" },
  { id: "3", title: "UI/UX Design Masterclass", color: "#b86e00", short: "UI" },
  { id: "4", title: "Mobile App Development", color: "#1b5ea6", short: "MD" },
  { id: "5", title: "Cloud Computing Basics", color: "#c0392b", short: "CC" },
];

const MOCK_CATEGORIES = [
  {
    id: "c1",
    name: "WELCOME",
    groups: [
      { id: "g1", name: "announcements", unread: 3, icon: "Megaphone" },
      { id: "g2", name: "welcome", unread: 0, icon: "Hash" },
      { id: "g3", name: "rules", unread: 0, icon: "CheckSquare" }
    ]
  },
  {
    id: "c2",
    name: "COURSE WORK",
    groups: [
      { id: "g4", name: "assignments", unread: 12, icon: "FileText" },
      { id: "g5", name: "resources", unread: 0, icon: "Wrench" },
      { id: "g6", name: "submissions", unread: 0, icon: "UploadCloud" }
    ]
  },
  {
    id: "c3",
    name: "DISCUSSIONS",
    groups: [
      { id: "g7", name: "general", unread: 0, icon: "Hash" },
      { id: "g8", name: "q-and-a", unread: 0, icon: "Hash" }
    ]
  }
];

const ALL_GROUPS = MOCK_CATEGORIES.flatMap(c => c.groups);

const MOCK_MESSAGES = [
  { id: 1, user: "Sarah Jenkins", role: "Mentor", time: "Today at 9:41 AM", content: "Welcome everyone to the new cohort! Please introduce yourselves.", color: "#5b4fcf" },
  { id: 2, user: "Alex Kumar", role: "Member", time: "Today at 10:15 AM", content: "Hi! I'm Alex. Super excited to start learning React and Next.js.", color: "#1e8c6e" },
  { id: 3, user: "Mia Wong", role: "Member", time: "Today at 11:30 AM", content: "Hello! Quick question, where can I find the syllabus for week 1?", color: "#b86e00" },
  { id: 4, user: "David Lee", role: "Mentor", time: "Today at 11:35 AM", content: "Hi Mia, it's pinned in the #announcements channel.", color: "#1b5ea6" },
];

const MOCK_COMMUNITY_MEMBERS = Array.from({ length: 20 }).map((_, i) => ({
  id: `m${i}`,
  name: `Member ${i + 1}`,
  role: i % 5 === 0 ? "Mentor" : "Member",
  color: ["#5b4fcf", "#1e8c6e", "#b86e00", "#1b5ea6", "#c0392b"][i % 5]
}));

export default function ProgramCommunityPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.communityId as string;
  
  const [activeGroupId, setActiveGroupId] = useState("g7");
  const [message, setMessage] = useState("");
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  
  const program = DEMO_PROGRAMS.find(p => p.id === programId) || { title: "Unknown Program", short: "??", color: "#000" };
  const activeGroup = ALL_GROUPS.find(g => g.id === activeGroupId);

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  return (
    <div style={{ height: "100vh", padding: "32px 32px 0 32px", background: BG, display: "flex", flexDirection: "column" }}>
      {/* Top Navigation */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20, flexShrink: 0 }}>
        <button
          onClick={() => router.push("/admin/community")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontWeight: 600, padding: 0 }}
        >
          <ArrowLeft size={16} /> Back to Programs
        </button>
      </div>

      {/* Main App Container (Discord Style) */}
      <div style={{ flex: 1, background: CARD, borderRadius: "12px 12px 0 0", border: `1px solid ${BORD}`, borderBottom: "none", display: "flex", overflow: "hidden" }}>
        
        {/* Far Left Sidebar (Communities / Servers List) */}
        <div style={{ width: 72, background: "var(--color-content-bg)", borderRight: `1px solid ${BORD}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 12, overflowY: "auto", flexShrink: 0 }}>
          {DEMO_PROGRAMS.map(p => {
            const isActive = p.id === programId;
            return (
              <div key={p.id} style={{ position: "relative", display: "flex", justifyContent: "center", width: "100%" }}>
                {/* Active Indicator (left pill) */}
                {isActive && (
                  <div style={{ position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)", width: 8, height: 32, background: p.color, borderRadius: "0 8px 8px 0" }} />
                )}
                {/* Community Icon */}
                <button
                  onClick={() => router.push(`/admin/community/${p.id}`)}
                  title={p.title}
                  style={{
                    width: 48, 
                    height: 48, 
                    borderRadius: isActive ? 16 : 24,
                    background: isActive ? p.color : `${p.color}20`,
                    color: isActive ? "#fff" : p.color,
                    border: "none", 
                    cursor: "pointer",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontWeight: 800, 
                    fontSize: 16, 
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderRadius = "16px";
                      e.currentTarget.style.background = p.color;
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderRadius = "24px";
                      e.currentTarget.style.background = `${p.color}20`;
                      e.currentTarget.style.color = p.color;
                    }
                  }}
                >
                  {p.short}
                </button>
              </div>
            );
          })}
        </div>

        {/* Inner Sidebar (Channels List) */}
        <div style={{ width: 260, borderRight: `1px solid ${BORD}`, background: "var(--color-bg-subtle)", display: "flex", flexDirection: "column" }}>
          {/* Sidebar Header */}
          <div style={{ padding: "20px 16px", borderBottom: `1px solid ${BORD}`, fontWeight: 800, color: "var(--color-text-primary)", fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 0 }}>
            {program.title}
          </div>
          
          {/* Groups List */}
          <div style={{ padding: "16px 8px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            {MOCK_CATEGORIES.map((category) => {
              const isCollapsed = collapsedCategories[category.id];
              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <div 
                    onClick={() => toggleCategory(category.id)}
                    style={{ 
                      display: "flex", alignItems: "center", gap: 4, 
                      fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", 
                      textTransform: "uppercase", marginBottom: 6, paddingLeft: 4,
                      cursor: "pointer", letterSpacing: "0.5px"
                    }}
                  >
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    {category.name}
                  </div>
                  
                  {/* Category Groups */}
                  {!isCollapsed && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {category.groups.map(group => {
                        const isActive = activeGroupId === group.id;
                        
                        let IconComponent = Hash;
                        if (group.icon === "Megaphone") IconComponent = Megaphone;
                        if (group.icon === "CheckSquare") IconComponent = CheckSquare;
                        if (group.icon === "FileText") IconComponent = FileText;
                        if (group.icon === "Wrench") IconComponent = Wrench;
                        if (group.icon === "UploadCloud") IconComponent = UploadCloud;

                        return (
                          <div
                            key={group.id}
                            onClick={() => setActiveGroupId(group.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px 8px 16px",
                              borderRadius: 6,
                              cursor: "pointer",
                              background: isActive ? "rgba(91,79,207,0.12)" : "transparent",
                              color: isActive ? "#5b4fcf" : "var(--color-text-secondary)",
                              transition: "background 0.1s"
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) e.currentTarget.style.background = "var(--color-content-bg)";
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <IconComponent size={16} style={{ color: isActive ? "#5b4fcf" : "var(--color-text-muted)" }} />
                              <span style={{ fontWeight: isActive ? 700 : 500, fontSize: 14 }}>{group.name}</span>
                            </div>
                            {group.unread > 0 && (
                              <div style={{ background: "#c0392b", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 99 }}>
                                {group.unread}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: CARD }}>
          {/* Chat Header */}
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Hash size={24} style={{ color: "var(--color-text-muted)" }} />
              <span style={{ fontWeight: 800, color: "var(--color-text-primary)", fontSize: 17 }}>
                {activeGroup?.name}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, color: "var(--color-text-muted)" }}>
              <div title="Notifications" style={{ display: "flex", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}>
                <Bell size={20} />
              </div>
              
              {/* Members Icon & Dropdown */}
              <div style={{ position: "relative" }}>
                <div 
                  title="Members"
                  onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                  style={{ display: "flex", cursor: "pointer", transition: "color 0.2s", color: showMembersDropdown ? "var(--color-text-primary)" : "var(--color-text-muted)" }} 
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"} 
                  onMouseLeave={(e) => { if (!showMembersDropdown) e.currentTarget.style.color = "var(--color-text-muted)" }} 
                >
                  <Users size={20} />
                </div>
                
                {showMembersDropdown && (
                  <>
                    <div 
                      style={{ position: "fixed", inset: 0, zIndex: 9 }} 
                      onClick={() => setShowMembersDropdown(false)} 
                    />
                    <div style={{
                      position: "absolute",
                      top: 32,
                      right: 0,
                      width: 280,
                      background: CARD,
                      border: `1px solid ${BORD}`,
                      borderRadius: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      zIndex: 10,
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: 400,
                    }}>
                      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORD}`, fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>
                        Community Members
                      </div>
                      <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
                        {MOCK_COMMUNITY_MEMBERS.map(m => (
                          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${m.color}18`, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                              {m.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{m.name}</div>
                              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{m.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: 12, borderTop: `1px solid ${BORD}` }}>
                        <button
                          onClick={() => {
                            setShowMembersDropdown(false);
                            router.push("/admin/programmes");
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            background: "var(--color-bg-subtle)",
                            border: "none",
                            borderRadius: 6,
                            color: "var(--color-text-primary)",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(91,79,207,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "var(--color-bg-subtle)"}
                        >
                          See More
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div title="Search" style={{ display: "flex", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}>
                <Search size={20} />
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Welcome banner */}
            <div style={{ marginBottom: 24, marginTop: 12 }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--color-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Hash size={36} style={{ color: "var(--color-text-primary)" }} />
              </div>
              <h2 style={{ color: "var(--color-text-primary)", fontWeight: 800, margin: "0 0 8px 0", fontSize: 24 }}>Welcome to #{activeGroup?.name}!</h2>
              <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15 }}>This is the start of the #{activeGroup?.name} group in {program.title}.</p>
            </div>

            <div style={{ borderBottom: `1px solid ${BORD}`, margin: "10px 0" }}></div>

            {MOCK_MESSAGES.map((msg) => (
              <div key={msg.id} style={{ display: "flex", gap: 16, padding: "8px 0" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${msg.color}18`, color: msg.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {msg.user.charAt(0)}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: 15 }}>{msg.user}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: msg.role === "Mentor" ? "#5b4fcf18" : "var(--color-bg-subtle)", color: msg.role === "Mentor" ? "#5b4fcf" : "var(--color-text-muted)", padding: "2px 8px", borderRadius: 4 }}>
                      {msg.role}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{msg.time}</span>
                  </div>
                  <div style={{ color: "var(--color-text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ padding: "0 24px 32px 24px", flexShrink: 0 }}>
            <div style={{ background: "var(--color-bg-subtle)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <Paperclip size={22} style={{ color: "var(--color-text-muted)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"} />
              <input
                type="text"
                placeholder={`Message #${activeGroup?.name}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", color: "var(--color-text-primary)", fontSize: 15, outline: "none" }}
              />
              <Smile size={22} style={{ color: "var(--color-text-muted)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"} />
              <button
                style={{ background: message.trim() ? "#5b4fcf" : "var(--color-content-bg)", border: "none", color: message.trim() ? "#fff" : "var(--color-text-muted)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: message.trim() ? "pointer" : "default", transition: "all 0.2s" }}
              >
                <Send size={16} style={{ marginLeft: 2 }} />
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
