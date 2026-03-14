import { Route, Routes } from 'react-router-dom';

import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Register from '../pages/auth/Register';
import DashboardHome from '../pages/dashboard/DashboardHome';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import CalendarPage from '../pages/calendar/CalendarPage';
import OnboardingPage from '../pages/onboarding/OnboardingPage';
import SearchPage from '../pages/search/SearchPage';
import CreateProject from '../pages/projects/CreateProject';
import EditProject from '../pages/projects/EditProject';
import ProjectDetails from '../pages/projects/ProjectDetails';
import ProjectsList from '../pages/projects/ProjectsList';
import CreateTask from '../pages/tasks/CreateTask';
import EditTask from '../pages/tasks/EditTask';
import TaskBoard from '../pages/tasks/TaskBoard';
import TasksList from '../pages/tasks/TasksList';
import Home from '../pages/public/Home';
import Features from '../pages/public/Features';
import InviteMember from '../pages/team/InviteMember';
import TeamPage from '../pages/team/TeamPage';
import ProfilePage from '../pages/settings/ProfilePage';
import SettingsPage from '../pages/settings/SettingsPage';
import NotFoundPage from '../pages/system/NotFoundPage';
import UnauthorizedPage from '../pages/system/UnauthorizedPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/features" element={<Features />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/projects/new" element={<CreateProject />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/projects/:id/edit" element={<EditProject />} />
          <Route path="/tasks" element={<TasksList />} />
          <Route path="/tasks/board" element={<TaskBoard />} />
          <Route path="/tasks/new" element={<CreateTask />} />
          <Route path="/tasks/:id/edit" element={<EditTask />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/team/invite" element={<InviteMember />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
