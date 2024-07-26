import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './PersonalCarList.css';
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
  const [sortBy, setSortBy] = useState('Calculated profit rate');
  const [viewMode, setViewMode] = useState('regular');
  const [currencyData, setCurrencyData] = useState([]);

  useEffect( () => {
    axios.get('https://cdn.jsdelivr.net/gh/prebid/currency-file@1/latest.json')
    .then(response => {
      setCurrencyData(response.data)
    })
  }, []);

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
          fetchedFavorites.reverse(); // for displaying the newly favorited cars first

          setFavorites(fetchedFavorites);
          setCarData(fetchedFavorites);
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
    const nokToUsd = currencyData.conversions.USD.NOK;
    const eurToUsd = currencyData.conversions.USD.EUR;
    const bamToEurRate = 0.51; //BAM is a pinned currency

    const nokToEur = nokToUsd / eurToUsd;
    const bamToNok = bamToEurRate * nokToEur;
    const resultInBAM = parameter / bamToNok;

    return resultInBAM.toFixed(0);
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
    <div className={viewMode === 'regular' ? "car-list" : "car-list-personal"}>
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
                <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky', fontWeight: 'bold' }}>
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
      <div className="sort-bar-container">
        <div className="sort-bar">
          <label style={{ marginRight: '20px', fontSize: '17px' }}>Sort by:</label>
          <button className={`sort-button ${sortBy === 'Calculated profit rate' ? 'selected' : ''}`} onClick={() => setSortBy('Calculated profit rate')}>Profit potential</button>
          <button className={`sort-button ${sortBy === 'Highest tax-return' ? 'selected' : ''}`} onClick={() => setSortBy('Highest tax-return')}>Highest tax-return</button>
          <button className={`sort-button ${sortBy === 'Newest first' ? 'selected' : ''}`} onClick={() => setSortBy('Newest first')}>Newest first</button>
          <button className={`sort-button ${sortBy === 'Most matches' ? 'selected' : ''}`} onClick={() => setSortBy('Most matches')}>Most matches</button>
          <button className="favorite-button" onClick={() => setViewMode(viewMode === 'regular' ? 'simple' : 'regular')} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            {viewMode === 'regular' ? 'Switch to Simple View' : 'Switch to Regular View'}
          </button>
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
        viewMode === 'regular' ? (
          <div key={index} className="car-card">
            <div className="car-name-container">
              <h2 className="car-name">{car.car_name}</h2>
            </div>
            <img src={car.image_url} alt={car.car_name} className="car-image" />
            <p><strong>Finn.no price:</strong> <a href={car.finn_link} target="_blank" rel="noopener noreferrer">{car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM</a></p>
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
              <div className="favorite-button-container" onClick={() => handleRemoveFavorite(car.id)}>
                <button className="favorite-button">Remove</button>
              </div>
            )}
          </div>
        ) : (
          <a key={index} href={car.finn_link} target="_blank" rel="noopener noreferrer" className="car-bar-personal">
            <img src={car.image_url} alt={car.car_name} />
            <div className="car-details-personal">
              <p><strong>{car.car_name}</strong></p>
              <p>Finn.no price: {car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM</p>
              <p>Average OLX.ba price: {Math.round(car.olx_prices.reduce((a, b) => a + b, 0) / car.olx_prices.length)} BAM</p>
              <p>Year: {car.year}</p>
              {car.tax_return > 0 && (
                <p>Tax return: {car.tax_return} NOK / {TurnToBAM(car.tax_return)} BAM</p>
              )}
            </div>
          </a>
        )
      ))}
      {filteredCars.length === 0 && (
        <p>All saved cars will be displayed here</p>
      )}
    </div>
  );
};

export default PersonalCarList;
