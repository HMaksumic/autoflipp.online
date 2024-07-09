import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './CarList.css';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PersonalCarList = () => {
  const { user, removeFavorite, logout } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPrices, setShowAllPrices] = useState({});

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get('https://autoflipp-backend.online/favorites', {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
          },
        });
        if (response.data.success) {
          const fetchedFavorites = response.data.favorites;
          fetchedFavorites.reverse(); //for displaying the newly favorited cars first

          setFavorites(response.data.favorites);
          setCarData(response.data.favorites);
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.access_token) {
      fetchFavorites();
    }
  }, [user]);

  if (loading) return <p>This should not take more than 50 seconds...</p>;
  if (error) {
    if (error.response && error.response.status === 401) {
      return (
        <div>
          <p>Session expired... You were logged out</p>
          <p>Log in again at the <Link to="/home">home page</Link></p>
        </div>
      );
    } else {
      return (
        <div>
          <p>Error loading data: {error.message}</p>
        </div>
      );
    }
  }


  function TurnToBAM(parameter) {
    return (parameter / 5.85).toFixed(0);
  }


  const toggleShowPrices = (id) => {
    setShowAllPrices(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRemoveFavorite = async (carId) => {
    try {
      const response = await axios.delete(
        `https://autoflipp-backend.online/favorites/${carId}`,
        {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
          },
        }
      );
      if (response.data.success) {
        setCarData(carData.filter(car => car.id !== carId));
        console.log('Car unfavorited successfully');
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('Error removing favorite:', error.response ? error.response.data : error.message);
    }
  };

  const BaseOLXUrl = "https://olx.ba/artikal/";

  const filteredCars = carData.filter(car => car.car_name.toLowerCase().includes(searchTerm));

  return (
    <div className="car-list">
    <div className="buttonbar">
        <div className="button">
          <Link to="/volkswagen" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' }}>
              Volkswagen
            </button>
          </Link>

          <Link to="/audi" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' }}>
              Audi
            </button>
          </Link>

          <Link to="/bmw" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' }}>
              BMW
            </button>
          </Link>

          <Link to="/mercedes" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' }}>
              Mercedes-Benz
            </button>
          </Link>

          <Link to="/peugeot" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' }}>
              Peugeot
            </button>
          </Link>

          <Link to="/volvo" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' }}>
              Volvo
            </button>
          </Link>

          <Link to="/other" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' }}>
              Other
            </button>
          </Link>

          {user && (
            <>
              <Link to="/personal" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' , fontWeight: 'bold'}}>
                  Personal
                </button>
              </Link>
              <Link to="/home">
              <button onClick={logout} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky', backgroundColor: 'lightsteelblue' }}>
                Logout
              </button>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          className="search-bar"
        />
        <div className="result-count">Results: {filteredCars.length}</div>
      </div>
      {filteredCars.map((car, index) => (
        <div key={index} className="car-card">
          <div className="car-name-container">
          <h2 className="car-name">{car.car_name}</h2>
          </div>
          <img src={car.image_url} alt={car.car_name} className="car-image" />
          <p><strong>Finn.no link:</strong> <a href={car.finn_link} target="_blank" rel="noopener noreferrer">{car.finn_link}</a></p>
          <p><strong>Finn.no price:</strong> {car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM</p>
          <p><strong>OLX.ba prices:</strong> {
            car.olx_prices
              .map((price, i) => ({ price, url: `${BaseOLXUrl}${car.olx_ids[i]}` }))
              .sort((a, b) => b.price - a.price)
              .slice(0, showAllPrices[car.car_name] ? car.olx_prices.length : 5)
              .map((item, i, arr) => (
                <span key={i}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="olx-link">
                    {item.price === 0 ? 'Na upit' : item.price}
                  </a>
                  {i < arr.length - 1 && ', '}
                </span>
              ))
          }
            {car.olx_prices.length > 5 && (
              <button onClick={() => toggleShowPrices(car.car_name)} className="more-button">
                {showAllPrices[car.car_name] ? 'Less' : 'Show more...'}
              </button>
            )}
          </p>
          <p><strong>Year:</strong> {car.year}</p>
          {car.tax_return > 0 && (
            <p><strong>Norwegian tax return estimate:</strong> {car.tax_return} NOK / {TurnToBAM(car.tax_return)} BAM</p>
          )}
          {user && (
            <button onClick={() => handleRemoveFavorite(car.id)} className="favorite-button">
              Remove
            </button>
          )}
        </div>
      ))}
      {filteredCars.length == 0 && (
        <p>All saved cars will be displayed here</p>
      )
      }
    </div>
  );
};

export default PersonalCarList;