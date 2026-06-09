export interface NavItem {
  href:   string;
  label:  string;
  icon:   string;
  badge?: string;
}

export interface NavGroup {
  label?: string;
  items:  NavItem[];
}

export const NAV_CONFIG: Record<string, NavGroup[]> = {

  SUPER_ADMIN: [
    {
      label: "OVERVIEW",
      items: [
        { href: "/super-admin",              label: "Dashboard",      icon: "LayoutDashboard" },
        { href: "/super-admin/audit",        label: "Activity Logs",  icon: "ScrollText"      },
      ],
    },
    {
      label: "PLATFORM MANAGEMENT",
      items: [
        { href: "/super-admin/admins",       label: "Admin Accounts", icon: "Shield"          },
        { href: "/super-admin/flags",        label: "Feature Flags",  icon: "ToggleLeft"      },
        { href: "/super-admin/system",       label: "System Health",  icon: "Zap"             },
        { href: "/super-admin/integrations", label: "Integrations",   icon: "Plug"            },
      ],
    },
    {
      label: "CONFIGURATION",
      items: [
        { href: "/settings",                 label: "Settings",       icon: "Settings"        },
      ],
    },
  ],

  ADMIN: [
    {
      label: "OVERVIEW",
      items: [
        { href: "/admin",                  label: "Dashboard",          icon: "LayoutDashboard" },
        { href: "/admin/analytics",        label: "Analytics",          icon: "BarChart3"       },
        { href: "/admin/activity",         label: "Activity Logs",      icon: "ScrollText"      },
      ],
    },
    {
      label: "SETUP",
      items: [
        { href: "/admin/countries",        label: "Country Management", icon: "Globe"           },
        { href: "/admin/tiers",            label: "Tier & Pricing",     icon: "Layers"          },
      ],
    },
    {
      label: "LEARNING",
      items: [
        { href: "/admin/programmes",       label: "Programmes",         icon: "GraduationCap"   },
        { href: "/admin/enrolments",       label: "Enrolments",         icon: "UsersRound"      },
        { href: "/admin/courses",          label: "Course Catalog",     icon: "BookOpen"        },
        { href: "/admin/mentors",          label: "Mentors",            icon: "UserCheck"       },
      ],
    },
    {
      label: "COMMUNITY",
      items: [
        { href: "/admin/community",        label: "Community",          icon: "MessageSquare"   },
        { href: "/admin/mentorship",       label: "Mentorship",         icon: "Heart"           },
        { href: "/admin/events",           label: "Events",             icon: "Calendar"        },
        { href: "/admin/opportunities",    label: "Opportunities",      icon: "Briefcase"       },
      ],
    },
    {
      label: "ACCOUNTS",
      items: [
        { href: "/admin/managers",         label: "Manager Accounts",   icon: "UsersRound"      },
        { href: "/admin/members",          label: "Members",            icon: "Users"           },
        { href: "/admin/corporate",        label: "Corporate Accounts", icon: "Building2"       },
      ],
    },
    {
      label: "REPORTING",
      items: [
        { href: "/admin/revenue",          label: "Revenue",            icon: "TrendingUp"      },
        { href: "/admin/comms",            label: "Communications",     icon: "Megaphone"       },
      ],
    },
    {
      label: "SETTINGS",
      items: [
        { href: "/settings",               label: "Settings",           icon: "Settings"        },
      ],
    },
  ],

  MANAGER: [
    {
      label: "OVERVIEW",
      items: [
        { href: "/manager",                  label: "Dashboard",      icon: "LayoutDashboard" },
      ],
    },
    {
      label: "PROGRAMMES",
      items: [
        { href: "/manager/programmes",       label: "Programmes",     icon: "GraduationCap"   },
        { href: "/manager/enrolments",       label: "Enrolments",     icon: "UsersRound"      },
        { href: "/manager/courses",          label: "Course Catalog", icon: "BookOpen"        },
      ],
    },
    {
      label: "COMMUNITY",
      items: [
        { href: "/manager/members",          label: "Members",        icon: "Users"           },
        { href: "/manager/community",        label: "Community",      icon: "MessageSquare"   },
        { href: "/manager/mentorship",       label: "Mentorship",     icon: "UserCheck"       },
        { href: "/manager/events",           label: "Events",         icon: "Calendar"        },
      ],
    },
    {
      label: "OPPORTUNITIES",
      items: [
        { href: "/manager/opportunities",    label: "Opportunities",  icon: "Briefcase"       },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { href: "/manager/comms",            label: "Communications", icon: "Megaphone"       },
        { href: "/settings",                 label: "Settings",       icon: "Settings"        },
      ],
    },
  ],

  CORPORATE_ADMIN: [
    {
      label: "OVERVIEW",
      items: [
        { href: "/corporate",             label: "Dashboard",          icon: "LayoutDashboard" },
      ],
    },
    {
      label: "TEAM",
      items: [
        { href: "/corporate/team",        label: "Team Members",       icon: "Users"           },
        { href: "/corporate/progress",    label: "Engagement",         icon: "BarChart3"       },
        { href: "/corporate/compliance",  label: "Compliance Reports", icon: "FileText"        },
        { href: "/corporate/events",      label: "Events",             icon: "Calendar"        },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { href: "/corporate/billing",     label: "Billing",            icon: "Receipt"         },
        { href: "/settings",              label: "Settings",            icon: "Settings"       },
      ],
    },
  ],

  MENTOR: [
    {
      label: "OVERVIEW",
      items: [
        { href: "/mentor",           label: "Dashboard",  icon: "LayoutDashboard" },
      ],
    },
    {
      label: "MENTORING",
      items: [
        { href: "/mentor/mentees",   label: "My Mentees", icon: "Users"           },
        { href: "/mentor/sessions",  label: "Sessions",   icon: "Calendar"        },
        { href: "/mentor/cohorts",   label: "Cohort Support", icon: "GraduationCap" },
      ],
    },
    {
      label: "PLATFORM",
      items: [
        { href: "/mentor/community", label: "Community",  icon: "MessageSquare"   },
        { href: "/mentor/learn",     label: "Learn",      icon: "BookOpen"        },
        { href: "/mentor/opportunities", label: "Opportunities", icon: "Briefcase" },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { href: "/mentor/profile",   label: "My Profile", icon: "Star"            },
        { href: "/settings",         label: "Settings",   icon: "Settings"        },
      ],
    },
  ],

  MEMBER: [
    {
      label: "OVERVIEW",
      items: [
        { href: "/member",                label: "Dashboard",     icon: "LayoutDashboard" },
      ],
    },
    {
      label: "LEARN & GROW",
      items: [
        { href: "/member/learn",          label: "Learn",         icon: "BookOpen"        },
        { href: "/member/community",      label: "Community",     icon: "MessageSquare"   },
        { href: "/member/mentorship",     label: "Mentorship",    icon: "UserCheck"       },
        { href: "/member/opportunities",  label: "Opportunities", icon: "Briefcase"       },
        { href: "/member/events",         label: "Events",        icon: "Calendar"        },
        { href: "/member/programmes",     label: "Programmes",    icon: "GraduationCap"   },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        { href: "/member/upgrade",        label: "Upgrade",       icon: "TrendingUp"      },
        { href: "/profile",               label: "Profile",       icon: "UserCircle"      },
        { href: "/settings",              label: "Settings",      icon: "Settings"        },
      ],
    },
  ],
};
