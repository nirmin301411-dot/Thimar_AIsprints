import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LangProvider } from "./context/LangContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Farms from "./pages/Farms";
import Portfolio from "./pages/Portfolio";
import AiInsights from "./pages/AiInsights";
import Market from "./pages/Market";
import Notifications from "./pages/Notifications";
import Landing from "./pages/Landing";
import AiAssistantWidget from "./components/AiAssistantWidget";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-textSecondary text-sm font-medium animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      {!user && (
        <>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Landing />} />
        </>
      )}

      {/* Protected Routes */}
      {user && (
        <Route
          path="/*"
          element={
            <div className="app-layout flex min-h-screen bg-background text-textMain">
              <Sidebar />
              <main className="main-content flex-1 ml-[260px] p-8 max-w-full overflow-x-hidden rtl:ml-0 rtl:mr-[260px]">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/farms" element={<Farms />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/ai" element={<AiInsights />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </main>
              <AiAssistantWidget />
            </div>
          }
        />
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

