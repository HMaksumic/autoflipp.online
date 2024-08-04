import { Link } from 'react-router-dom';

export default function NoPage() {
    return (
        <>
            <header style={headerStyle}>
        <h1 style={titleStyle}>
          autoflipp.online
          <img src="/icon-white.png" alt="" style={logoStyle} />
        </h1>
            </header>
            <p> This page no does not exist. Go back to the <Link to="/home" > home page </Link> </p>
        
        </>
    )
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