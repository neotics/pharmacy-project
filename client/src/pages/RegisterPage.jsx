import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { extractApiError, getHomeRouteForRole } from "../utils/format";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const session = await register(form);
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
        <p className="eyebrow">{t("registerHeroEyebrow")}</p>
        <h1>{t("registerHeroTitle")}</h1>
        <p>{t("registerHeroDescription")}</p>
      </section>

      <section className="auth-card">
        <div className="section-heading">
          <div>
            <h2>{t("registerTitle")}</h2>
            <p>{t("registerDesc")}</p>
          </div>
        </div>

        <form className="stack-lg" onSubmit={handleSubmit}>
          <label>
            {t("fullName")}
            <input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Ali Valiyev"
              type="text"
              value={form.name}
            />
          </label>

          <label>
            {t("email")}
            <input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="name@example.com"
              type="email"
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
              placeholder="At least 6 characters"
              type="password"
              value={form.password}
            />
          </label>

          <label>
            {t("role")}
            <select
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value,
                }))
              }
              value={form.role}
            >
              <option value="doctor">{t("roleDoctor")}</option>
              <option value="pharmacy">{t("rolePharmacy")}</option>
              <option value="patient">{t("rolePatient")}</option>
            </select>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button" disabled={submitting} type="submit">
            {submitting ? t("creating") : t("createAccount")}
          </button>
        </form>

        <p className="auth-link">
          {t("hasAccount")} <Link to="/login">{t("goLogin")}</Link>
        </p>
      </section>
    </div>
  );
};

export default RegisterPage;
