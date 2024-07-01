import React from 'react';
import "../pages/HomeActual.css";
import { Link } from 'react-router-dom';

export default function Home() {
  const categories = [
    { name: 'Volkswagen', link: '/volkswagen', image: 'volkswagen.jpg' },
    { name: 'Audi', link: '/audi', image: 'audi.jpg' },
    { name: 'BMW', link: '/bmw', image: 'bmw.jpg' },
    { name: 'Mercedes-Benz', link: '/mercedes', image: 'mercedes.jpg' },
    { name: 'Peugeot', link: '/peugeot', image: 'peugeot.webp' },
    { name: 'Volvo', link: '/volvo', image: 'volvo.jpg' },
    { name: 'Other', link: '/other', image: 'other.jpg' }
  ];

  return (
    <div className="home-container">
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          autoflipp.online
          <img src="/icon-white.png" alt="" style={logoStyle} />
        </h1>
      </header>
      
      <main className="main">
        <div className="intro-text">
        <h2> Welcome to autoflipp.online!</h2>
        Simplify your search and check out our comprehensive listings.
        </div>
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
  textAlign: 'center',
};

const titleStyle = {
  margin: 0,
  fontSize: '24px',
  color: "#FFF"
};

const logoStyle = {
  marginLeft: '0px',
  height: '35px',
};