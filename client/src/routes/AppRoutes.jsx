import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../pages/AdminDashboard";
import DoctorDashboard from "../pages/DoctorDashboard";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import PatientDashboard from "../pages/PatientDashboard";
import PharmacyDashboard from "../pages/PharmacyDashboard";
import RegisterPage from "../pages/RegisterPage";
import { getHomeRouteForRole } from "../utils/format";

const AppRoutes = () => {
  const { session } = useAuth();
  const homeRoute = session ? getHomeRouteForRole(session.user.role) : "/login";

  return (
    <Routes>
      <Route element={<Navigate replace to={homeRoute} />} path="/" />
      <Route
        element={session ? <Navigate replace to={homeRoute} /> : <LoginPage />}
        path="/login"
      />
      <Route
        element={session ? <Navigate replace to={homeRoute} /> : <RegisterPage />}
        path="/register"
      />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminDashboard />} path="/admin" />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
        <Route element={<DoctorDashboard />} path="/doctor" />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["pharmacy"]} />}>
        <Route element={<PharmacyDashboard />} path="/pharmacy" />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route element={<PatientDashboard />} path="/patient" />
      </Route>

      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
};

export default AppRoutes;
