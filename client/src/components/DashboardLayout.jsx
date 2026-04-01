import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getRoleLabel } from "../utils/format";
import Badge from "./Badge";

const DashboardLayout = ({ title, description, stats = [], children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="page-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">{t("qrEyebrow")}</p>
          <h1>{title}</h1>
          <p className="hero-copy">{description}</p>
        </div>
        <div className="hero-panel">
          <Badge tone="accent">{getRoleLabel(user.role, t)}</Badge>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div className="hero-actions">
            <Link className="button button-ghost" to="/">
              {t("home")}
            </Link>
            <button className="button button-secondary" onClick={logout}>
              {t("logout")}
            </button>
          </div>
        </div>
      </header>

      {stats.length > 0 ? (
        <section className="stats-grid">
          {stats.map((item) => (
            <article className="stat-card" key={item.label}>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.hint}</span>
            </article>
          ))}
        </section>
      ) : null}

      <main className="dashboard-grid">{children}</main>
    </div>
  );
};

export default DashboardLayout;
