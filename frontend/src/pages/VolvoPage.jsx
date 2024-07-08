import React from 'react';
import CarList from "../components/CarList";
import "../pages/Home.css";

export default function VolvoPage() {
  const URL = "https://backend-server-hcvn.onrender.com/api/olx_volvo"

  return (
    <div className="home-container">
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          autoflipp.online
          <img src="/icon-white.png" alt="" style={logoStyle} />
        </h1>
      </header>
      <main style={mainStyle}>
      <CarList url={URL} audi='none' bmw='none' mercedes='none' other='none' peugeot='none' volvo='bold' volkswagen='none'></CarList>
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

const mainStyle = {
  paddingTop: '35px', 
};