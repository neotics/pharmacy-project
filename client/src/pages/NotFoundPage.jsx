import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const NotFoundPage = () => {
  const { t } = useLanguage();

  return (
    <div className="screen-state">
      <div className="screen-card">
        <p className="eyebrow">404</p>
        <h2>{t("pageNotFound")}</h2>
        <p>{t("pageNotFoundDesc")}</p>
        <Link className="button" to="/">
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
