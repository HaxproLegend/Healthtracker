import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import FloatingNav from "./components/FloatingNav.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LogEntryPage from "./pages/LogEntryPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

function ProtectedShell() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="auth-screen">
        <p className="loading-line">Loading VITALS</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="shell">
      <FloatingNav />
      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/log" element={<LogEntryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Link to="/log" className="fab" title="Log entry">
        +
      </Link>
    </div>
  );
}

export default function App() {
  return <ProtectedShell />;
}
