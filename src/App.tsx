import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement";
import CategoryManagement from "./pages/CategoryManagement";
import MediaDetail from "./pages/MediaDetail";

import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import { useAuth } from "./hooks/useAuth";
import Settings from "./pages/Settings";

// Admin page example
const AdminPage = () => <div>Admin Page - Only for administrators</div>;

// Settings page placeholder

// Component to handle public routes (login, register) with redirection
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex-col gap-4 w-full flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
            <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Redirection de la racine vers la page de connexion */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes with authentication check */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        {/* <Route path="/users" element={<UserManagement />} /> */}
      </Route>

      {/* Protected routes with role requirements - Admin only */}
      <Route element={<ProtectedRoute requiredRoles={["ROLE_ADMIN", "admin"]} />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/users" element={<UserManagement />} />
      </Route>

      {/* Protected routes with role requirements - Admin and Operator */}
      <Route element={<ProtectedRoute requiredRoles={["ROLE_ADMIN", "ROLE_OPERATOR", "admin", "operator"]} />}>
        <Route path="/categories" element={<CategoryManagement />} />
        <Route path="/media/:id" element={<MediaDetail />} />
      </Route>

      {/* Redirection des routes inconnues vers la page de connexion */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <AppRoutes />
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
