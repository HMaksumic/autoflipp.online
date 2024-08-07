import React, {useState} from 'react';
import "../pages/HomeActual.css";
import { Link } from 'react-router-dom';
import AuthBox from "../components/AuthBox"
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher'; 

export default function Home() {

  const { t } = useTranslation();
  const categories = [
    { name: 'Volkswagen', link: '/volkswagen', image: 'cars/volkswagen.jpg' },
    { name: 'Audi', link: '/audi', image: 'cars/audi.jpg' },
    { name: 'BMW', link: '/bmw', image: 'cars/bmw.jpg' },
    { name: 'Mercedes-Benz', link: '/mercedes', image: 'cars/mercedes.jpg' },
    { name: 'Peugeot', link: '/peugeot', image: 'cars/peugeot.webp' },
    { name: 'Volvo', link: '/volvo', image: 'cars/volvo.jpg' },
    { name: t('other'), link: '/other', image: 'cars/other.jpg' }
  ];
  const [showAuthBox, setShowAuthBox] = useState(false);

  const handleLoginClick = () => {
    setShowAuthBox(!showAuthBox);
  };
  
  return (
    <div className="home-container">
  <header style={headerStyle}>
    <div style={headerContentStyle}>
      <div style={titleContainerStyle}>
        <h1 style={titleStyle}>
          autoflipp.online
          <img src="/icon-white.png" alt="" style={logoStyle} />
        </h1>
      </div>
      <div className='langmenu'>
        <LanguageSwitcher />
      </div>
    </div>
  </header>
      
      <main className="main">
        <div className="intro-text">
        <h2>{t('welcome')}</h2>
        {t('simplify_search')}
        </div>
        <div className="login-button">
          <button className="button_1" onClick={handleLoginClick}>{t('log_in')}</button>
        </div>
        {showAuthBox && (
          <div className="auth-box-container">
            <AuthBox />
          </div>
        )}
        <div className="category-container">
          {categories.map(category => (
            <Link to={category.link} className="category-card" key={category.name}>
              <img src={category.image} alt={category.name} />
              <div className="card-content">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
        <div className="text">
          {t('welcome_desc')}
        </div> 

      </main>
    </div>
  );
}

const headerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  backgroundColor: '#007bff',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
  padding: '10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '60px'
};

const titleContainerStyle = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
};

const headerContentStyle = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  justifyContent: 'space-between',
  position: 'relative',
};

const titleStyle = {
  margin: 0,
  fontSize: '24px',
  color: "#FFF",
  display: 'flex',
  alignItems: 'flex-end',
};

const logoStyle = {
  marginLeft: '0px',
  height: '35px',
  marginBottom: '6px',
};