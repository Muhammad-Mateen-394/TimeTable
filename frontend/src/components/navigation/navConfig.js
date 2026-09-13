import {
  LayoutGrid, CalendarDays, PenSquare, Zap, AlertTriangle, GraduationCap,
  Users, BookOpen, Building2, Link2, SlidersHorizontal, CheckCircle2,
  BarChart3, Bell, Settings, User,
  UserCog,
} from "lucide-react";

export const NAV_BY_ROLE = {
  principal: [
    { to: "/principal/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/principal/timetable", label: "Timetable", icon: CalendarDays },
    { to: "/principal/classes", label: "Classes", icon: GraduationCap },
    { to: "/principal/teachers", label: "Teachers", icon: Users },
    { to: "/principal/subjects", label: "Subjects", icon: BookOpen },
    { to: "/principal/rooms", label: "Rooms & Labs", icon: Building2 },
    { to: "/principal/assignments", label: "Assignments", icon: Link2 },
    { to: "/principal/constraints", label: "Constraints", icon: SlidersHorizontal },
    { to: "/principal/conflicts", label: "Conflicts", icon: AlertTriangle },
    { to: "/principal/approval", label: "Approval", icon: CheckCircle2 },
    { to: "/principal/reports", label: "Reports", icon: BarChart3 },
    { to: "/principal/notifications", label: "Notifications", icon: Bell },
    { to: "/principal/accounts", label: "Accounts", icon: UserCog },
    { to: "/principal/settings", label: "Settings", icon: Settings },
  ],
  manager: [
    { to: "/manager/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/manager/timetable", label: "Timetable", icon: CalendarDays },
    { to: "/manager/editor", label: "Editor", icon: PenSquare },
    { to: "/manager/generate", label: "Auto-Generate", icon: Zap },
    { to: "/manager/conflicts", label: "Conflicts", icon: AlertTriangle },
    { to: "/manager/classes", label: "Classes", icon: GraduationCap },
    { to: "/manager/teachers", label: "Teachers", icon: Users },
    { to: "/manager/subjects", label: "Subjects", icon: BookOpen },
    { to: "/manager/rooms", label: "Rooms & Labs", icon: Building2 },
    { to: "/manager/assignments", label: "Assignments", icon: Link2 },
    { to: "/manager/constraints", label: "Constraints", icon: SlidersHorizontal },
    { to: "/manager/notifications", label: "Notifications", icon: Bell },
    { to: "/manager/accounts", label: "Accounts", icon: UserCog },
  ],
  teacher: [
    { to: "/teacher/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/teacher/timetable", label: "My Timetable", icon: CalendarDays },
    { to: "/teacher/classes", label: "My Classes", icon: GraduationCap },
    { to: "/teacher/notifications", label: "Notifications", icon: Bell },
    { to: "/teacher/profile", label: "Profile", icon: User },
  ],
};

export const ROLE_LABEL = {
  principal: "Principal",
  manager: "Timetable Manager",
  teacher: "Teacher",
};
