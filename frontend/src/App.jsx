import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import PrincipalDashboard from "./pages/principal/Dashboard";
import ManagerDashboard from "./pages/manager/Dashboard";
import TeacherDashboard from "./pages/teacher/Dashboard";

import TimetableViewPage from "./pages/shared/TimetableViewPage";
import Editor from "./pages/manager/Editor";
import GenerateWizard from "./pages/manager/GenerateWizard";
import ConflictsPage from "./pages/shared/ConflictsPage";
import ClassesPage from "./pages/shared/ClassesPage";
import TeachersPage from "./pages/shared/TeachersPage";
import SubjectsPage from "./pages/shared/SubjectsPage";
import RoomsPage from "./pages/shared/RoomsPage";
import AssignmentsPage from "./pages/shared/AssignmentsPage";
import ConstraintsPage from "./pages/shared/ConstraintsPage";
import ApprovalPage from "./pages/principal/ApprovalPage";
import ReportsPage from "./pages/principal/ReportsPage";
import NotificationsPage from "./pages/shared/NotificationsPage";
import SettingsPage from "./pages/shared/SettingsPage";
import AccountsPage from "./pages/shared/AccountsPage";

import TeacherTimetable from "./pages/teacher/Timetable";
import TeacherClasses from "./pages/teacher/Classes";
import TeacherProfile from "./pages/teacher/Profile";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const user = useAuthStore((state) => state.user);
  const hydrateFromApi = useAppStore((state) => state.hydrateFromApi);

  useEffect(() => {
    document.title = user?.school?.name ? `Table Table — ${user.school.name}` : "Table Table";
  }, [user?.school?.name]);

  useEffect(() => {
    if (user) hydrateFromApi().catch((error) => console.error("Failed to load app data:", error));
  }, [user, hydrateFromApi]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Principal */}
        <Route element={<ProtectedRoute allowedRoles={["principal"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
            <Route path="/principal/timetable" element={<TimetableViewPage role="principal" />} />
            <Route path="/principal/classes" element={<ClassesPage />} />
            <Route path="/principal/teachers" element={<TeachersPage />} />
            <Route path="/principal/subjects" element={<SubjectsPage />} />
            <Route path="/principal/rooms" element={<RoomsPage />} />
            <Route path="/principal/assignments" element={<AssignmentsPage />} />
            <Route path="/principal/constraints" element={<ConstraintsPage role="principal" />} />
            <Route path="/principal/conflicts" element={<ConflictsPage role="principal" />} />
            <Route path="/principal/approval" element={<ApprovalPage />} />
            <Route path="/principal/reports" element={<ReportsPage />} />
            <Route path="/principal/notifications" element={<NotificationsPage />} />
            <Route path="/principal/settings" element={<SettingsPage />} />
            <Route path="/principal/accounts" element={<AccountsPage />} />
            <Route path="/principal/profile" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Manager */}
        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/timetable" element={<TimetableViewPage role="manager" />} />
            <Route path="/manager/editor" element={<Editor />} />
            <Route path="/manager/generate" element={<GenerateWizard />} />
            <Route path="/manager/conflicts" element={<ConflictsPage role="manager" />} />
            <Route path="/manager/classes" element={<ClassesPage />} />
            <Route path="/manager/teachers" element={<TeachersPage />} />
            <Route path="/manager/subjects" element={<SubjectsPage />} />
            <Route path="/manager/rooms" element={<RoomsPage />} />
            <Route path="/manager/assignments" element={<AssignmentsPage />} />
            <Route path="/manager/constraints" element={<ConstraintsPage role="manager" />} />
            <Route path="/manager/notifications" element={<NotificationsPage />} />
            <Route path="/manager/settings" element={<SettingsPage />} />
            <Route path="/manager/accounts" element={<AccountsPage />} />
            <Route path="/manager/profile" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Teacher */}
        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/timetable" element={<TeacherTimetable />} />
            <Route path="/teacher/classes" element={<TeacherClasses />} />
            <Route path="/teacher/notifications" element={<NotificationsPage />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
