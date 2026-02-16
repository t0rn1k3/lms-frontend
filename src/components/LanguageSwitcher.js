import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ka", label: "KA" },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-1">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
            i18n.language === code || i18n.language?.startsWith(code)
              ? "bg-slate-600 text-white"
              : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
          }`}
          aria-label={`Switch to ${code === "en" ? "English" : "Georgian"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
