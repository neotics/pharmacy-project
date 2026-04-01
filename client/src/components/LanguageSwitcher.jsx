import { useLanguage } from "../context/LanguageContext";

const LanguageSwitcher = () => {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="language-switcher">
      <label>
        {t("appLang")}
        <select
          onChange={(event) => changeLanguage(event.target.value)}
          value={language}
        >
          <option value="uz">{t("langUz")}</option>
          <option value="ru">{t("langRu")}</option>
          <option value="en">{t("langEn")}</option>
        </select>
      </label>
    </div>
  );
};

export default LanguageSwitcher;
