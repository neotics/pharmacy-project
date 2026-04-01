import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getHomeRouteForRole } from "../utils/format";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { initializing, session } = useAuth();
  const { t } = useLanguage();

  if (initializing) {
    return (
      <div className="screen-state">
        <div className="screen-card">
          <p className="eyebrow">{t("loadingSession")}</p>
          <h2>{t("preparingWorkspace")}</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    return <Navigate to={getHomeRouteForRole(session.user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
