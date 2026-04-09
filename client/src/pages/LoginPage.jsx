import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { extractApiError, getHomeRouteForRole } from "../utils/format";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const session = await login(form);
      navigate(getHomeRouteForRole(session.user.role), { replace: true });
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-aside">
        <p className="eyebrow">{t("loginHeroEyebrow")}</p>
        <h1>{t("loginHeroTitle")}</h1>
        <p>{t("loginHeroDescription")}</p>
      </section>

      <section className="auth-card">
        <div className="section-heading">
          <div>
            <h2>{t("loginTitle")}</h2>
            <p>{t("loginDesc")}</p>
          </div>
        </div>

        <form className="stack-lg" onSubmit={handleSubmit}>
          <label>
            {t("email")}
            <input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="doctor@clinic.uz / seva"
              type="text"
              value={form.email}
            />
          </label>

          <label>
            {t("password")}
            <input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="password"
              type="password"
              value={form.password}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button" disabled={submitting} type="submit">
            {submitting ? t("loginLoading") : t("loginBtn")}
          </button>
        </form>

        <p className="auth-link">
          {t("noAccount")} <Link to="/register">{t("createOne")}</Link>
        </p>
      </section>
    </div>
  );
};

export default LoginPage;
