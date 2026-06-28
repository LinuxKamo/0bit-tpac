"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, ArrowDownAZ, ArrowUpZA, Search } from "lucide-react";

const BG = "var(--color-content-bg)";
const CARD = "var(--color-content-card)";
const BORD = "var(--color-content-border)";

type ProgramStatus = "Upcoming" | "Active" | "Completed";

const DEMO_PROGRAMS: {
  id: string;
  title: string;
  mentors: string[];
  modulesCount: number;
  iconColor: string;
  status: ProgramStatus;
}[] = [
  { id: "1", title: "Web Development Bootcamp", mentors: ["Sarah Jenkins", "David Lee"], modulesCount: 12, iconColor: "#5b4fcf", status: "Active" },
  { id: "2", title: "Data Science Fundamentals", mentors: ["Dr. Alan Turing"], modulesCount: 8, iconColor: "#1e8c6e", status: "Upcoming" },
  { id: "3", title: "UI/UX Design Masterclass", mentors: ["Alice Wong", "Bob Smith"], modulesCount: 10, iconColor: "#b86e00", status: "Completed" },
  { id: "4", title: "Mobile App Development", mentors: ["John Doe"], modulesCount: 15, iconColor: "#1b5ea6", status: "Active" },
  { id: "5", title: "Cloud Computing Basics", mentors: ["Emily Chen", "Mark Spencer"], modulesCount: 6, iconColor: "#c0392b", status: "Completed" },
];

const STATUS_COLORS: Record<ProgramStatus, string> = {
  Upcoming: "#1e8c6e",
  Active: "#5b4fcf",
  Completed: "#b86e00",
};

export default function UserCommunityProgramsPage() {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const displayedPrograms = useMemo(() => {
    let filtered = DEMO_PROGRAMS;
    
    if (statusFilter !== "All") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => 
        p.title.toLowerCase().includes(lowerQuery) || 
        p.mentors.some(m => m.toLowerCase().includes(lowerQuery))
      );
    }
    
    return filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  }, [sortOrder, statusFilter, searchQuery]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filterOptions: (ProgramStatus | "All")[] = ["All", "Upcoming", "Active", "Completed"];

  return (
    <div style={{ minHeight: "100vh", padding: 32, background: BG }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "var(--color-text-primary)", fontWeight: 800, fontSize: 24, margin: 0 }}>Community Programs</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
            Manage and view all community programs here.
          </p>
        </div>
        <button
          onClick={toggleSort}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: CARD,
            border: `1px solid ${BORD}`,
            borderRadius: 8,
            color: "var(--color-text-primary)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {sortOrder === "asc" ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
          Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* Controls Row (Filters & Search) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 12 }}>
          {filterOptions.map((opt) => {
            const isActive = statusFilter === opt;
            return (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 99,
                  border: `1px solid ${isActive ? "transparent" : BORD}`,
                  background: isActive ? "#5b4fcf" : CARD,
                  color: isActive ? "#fff" : "var(--color-text-secondary)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", width: 280 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
          <input
            type="text"
            placeholder="Search programs or mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 16px 8px 36px",
              background: CARD,
              border: `1px solid ${BORD}`,
              borderRadius: 8,
              color: "var(--color-text-primary)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Programs List */}
      <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
        {displayedPrograms.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
            No programs found matching your criteria.
          </div>
        ) : (
          displayedPrograms.map((prog, index) => (
            <div
              key={prog.id}
              onClick={() => router.push(`/admin/community/${prog.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: index === displayedPrograms.length - 1 ? "none" : `1px solid ${BORD}`,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-subtle)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Leading Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${prog.iconColor}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 20,
                  flexShrink: 0,
                }}
              >
                <BookOpen style={{ color: prog.iconColor }} size={24} />
              </div>

              {/* Content (Title & Subtitle) */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: 16 }}>
                    {prog.title}
                  </div>
                  <span
                    style={{
                      background: `${STATUS_COLORS[prog.status]}18`,
                      color: STATUS_COLORS[prog.status],
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      padding: "2px 8px",
                    }}
                  >
                    {prog.status}
                  </span>
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                  Mentors: <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>{prog.mentors.join(", ")}</span> • {prog.modulesCount} Modules
                </div>
              </div>

              {/* Trailing Icon */}
              <ChevronRight style={{ color: "var(--color-text-muted)" }} size={20} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
