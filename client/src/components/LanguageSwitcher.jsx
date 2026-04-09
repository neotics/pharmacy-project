import { useLanguage } from "../context/LanguageContext";

const languageOptions = ["uz", "ru", "en"];

const LanguageSwitcher = () => {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div aria-label={t("appLang")} className="language-switcher" role="group">
      <span className="language-switcher-label">{t("appLang")}</span>
      <div className="language-switcher-options">
        {languageOptions.map((option) => (
          <button
            className={`language-switcher-button${
              language === option ? " is-active" : ""
            }`}
            key={option}
            onClick={() => changeLanguage(option)}
            type="button"
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
