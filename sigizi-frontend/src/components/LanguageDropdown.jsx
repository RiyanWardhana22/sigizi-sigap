import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

// Gunakan CDN flagcdn.com (lebih ringan dan stabil)
const FLAG_BASE_URL = "https://flagcdn.com";

export default function LanguageDropdown() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: "id", label: "Indonesia", flagCode: "id", flagEmoji: "🇮🇩" },
    { code: "en", label: "English", flagCode: "us", flagEmoji: "🇺🇸" },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all text-sm font-medium text-gray-700"
      >
        <img
          src={`${FLAG_BASE_URL}/${currentLang.flagCode}.svg`}
          alt={currentLang.label}
          className="w-5 h-4 object-cover rounded-sm shadow-sm"
          onError={(e) => {
            e.target.style.display = "none";
            const parent = e.target.parentElement;
            if (parent && parent.querySelector(".emoji-fallback")) {
              parent.querySelector(".emoji-fallback").style.display = "inline-block";
            }
          }}
        />
        <span className="emoji-fallback" style={{ display: "none" }}>
          {currentLang.flagEmoji}
        </span>
        <span className="hidden sm:inline">{currentLang.label}</span>
        <span className="sm:hidden">{currentLang.flagEmoji}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                language === lang.code
                  ? "bg-emerald-50 text-emerald-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <img
                src={`${FLAG_BASE_URL}/${lang.flagCode}.svg`}
                alt={lang.label}
                className="w-5 h-4 object-cover rounded-sm shadow-sm"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "inline-block";
                }}
              />
              <span className="hidden" style={{ display: "none" }}>
                {lang.flagEmoji}
              </span>
              <span className="flex items-center gap-1">
                <span>{lang.label}</span>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {lang.code === "id" ? "(ID)" : "(EN)"}
                </span>
              </span>
              {language === lang.code && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}