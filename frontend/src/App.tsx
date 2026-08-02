import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import CreateIssuePage from "./pages/CreateIssuePage";
import DashboardPage from "./pages/DashboardPage";
import IssueDetailsPage from "./pages/IssueDetailsPage";
import IssuesPage from "./pages/IssuesPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import UserManagementPage from "./pages/UserManagementPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="issues" element={<IssuesPage />} />

          <Route path="issues/new" element={<CreateIssuePage />} />

          <Route path="issues/:issueNumber" element={<IssueDetailsPage />} />

          <Route path="users" element={<UserManagementPage />} />

          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
