import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import CreateIssuePage from "./pages/CreateIssuePage";
import DashboardPage from "./pages/DashboardPage";
import IssueDetailsPage from "./pages/IssueDetailsPage";
import IssuesPage from "./pages/IssuesPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="issues" element={<IssuesPage />} />

          <Route path="issues/new" element={<CreateIssuePage />} />

          <Route path="issues/:issueNumber" element={<IssueDetailsPage />} />

          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
