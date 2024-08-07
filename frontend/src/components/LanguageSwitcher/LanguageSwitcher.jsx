import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="language-switcher">
      <button onClick={() => changeLanguage('bs')}>
        <img src="/flags/bih.svg" alt="Bosanski" />
      </button>

      <button onClick={() => changeLanguage('en')}>
        <img src="/flags/en.svg" alt="English" />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
