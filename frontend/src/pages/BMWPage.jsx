import React from 'react';
import CarList from "../components/CarList";
import "../pages/Home.css";
import { Link } from 'react-router-dom';

export default function BMWPage() {
  const URL = "https://autoflipp-backend.online/api/olx_bmw"

  return (
    <div className="home-container">
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          <Link to='/home' style={linkStyle}>
            autoflipp.online
            <img src="/icon-white.png" alt="Home" style={logoStyle} />
          </Link>
        </h1>
      </header>
      <main style={mainStyle}>
        <CarList url={URL} audi='none' bmw='bold' mercedes='none' other='none' peugeot='none' volvo='none' volkswagen='none' brandName='bmw' />
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
  color: "#FFF",
  fontWeight: 'bold',
};

const linkStyle = {
  textDecoration: 'none',
  color: "#FFF",
  fontWeight: 'bold',
};

const logoStyle = {
  marginLeft: '0px',
  height: '35px',
};

const mainStyle = {
  paddingTop: '35px', 
};
