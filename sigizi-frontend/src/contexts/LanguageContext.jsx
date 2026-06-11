// src/contexts/LanguageContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import id from '../locales/id';
import en from '../locales/en';

const LanguageContext = createContext();

const translations = { id, en };

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('appLanguage');
    return savedLanguage === 'en' ? 'en' : 'id';
  });

  const [t, setT] = useState(translations[language]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
    setT(translations[language]);
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === 'id' || lang === 'en') {
      setLanguage(lang);
    }
  };

  const translate = (key, params = {}) => {
    // Split key by dot to navigate nested objects
    const keys = key.split('.');
    let value = t;
    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }
    if (typeof value !== 'string') return key;
    
    // Replace params like {{field}}
    let result = value;
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}