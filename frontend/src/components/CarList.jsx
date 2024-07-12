import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './CarList.css';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const CarList = ({url, audi, bmw, mercedes, peugeot, volvo, volkswagen, other}) => {
  const { user, favorites, addFavorite, removeFavorite, logout} = useContext(AuthContext);
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPrices, setShowAllPrices] = useState({});
  const [sortBy, setSortBy] = useState('Calculated profit rate');

  useEffect(() => {
    axios.get(url)
      .then(response => {
        setCarData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>This should not take more than 50 seconds...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  function TurnToBAM(parameter) {
    return (parameter / 5.85).toFixed(0);
  }

  const CalculateProfitRate = (olxPrices, finnPriceNOK, taxReturn=0) => {
    const averageOLXPrice = olxPrices.reduce((sum, price) => sum + price, 0) / olxPrices.length;
    const finnPriceBAM = TurnToBAM(finnPriceNOK) - TurnToBAM(taxReturn);
    return finnPriceBAM / averageOLXPrice;
  };

  const toggleShowPrices = (id) => {
    setShowAllPrices(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const BaseOLXUrl = "https://olx.ba/artikal/";

  const sortCarData = (data, criteria) => {
    return data.sort((a, b) => {
      switch (criteria) {
        case 'Newest first':
          return b.year - a.year;
        case 'Most matches':
          return b.olx_prices.length - a.olx_prices.length;
        case 'Highest tax-return':
          return b.tax_return - a.tax_return;  
        case 'Calculated profit rate':
        default:
          return CalculateProfitRate(a.olx_prices, a.finn_price, a.tax_return) - CalculateProfitRate(b.olx_prices, b.finn_price, b.tax_return);
      }
    });
  };

  const filteredCars = carData.filter(car => car.car_name.toLowerCase().includes(searchTerm));
  const sortedCarData = sortCarData(filteredCars, sortBy);

  const isFavorited = (carId) => {
    return favorites.some(fav => fav.id === carId);
  };

  const handleFavoriteClick = async (car) => {
    if (isFavorited(car.id)) {
      try {
        const response = await axios.delete(
          `https://autoflipp-backend.online/favorites/${car.id}`,
          {
            headers: {
              'Authorization': `Bearer ${user.access_token}`,
            },
          }
        );
        if (response.data.success) {
          removeFavorite(car.id);
          console.log('Car unfavorited successfully');
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('Error unfavoriting car:', error.response ? error.response.data : error.message);
      }
    } else {
      try {
        const response = await axios.post(
          'https://autoflipp-backend.online/favorites',
          { car },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.access_token}`,
            },
          }
        );
        if (response.data.success) {
          addFavorite(car);
          console.log('Car favorited successfully');
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('Error favoriting car:', error.response ? error.response.data : error.message);
      }
    }
  };
  return (
    <div className="car-list">
      <div className="buttonbar">
        <div className="button">
          <Link to="/volkswagen" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky', fontWeight: volkswagen }}>
              Volkswagen
            </button>
          </Link>

          <Link to="/audi" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky', fontWeight: audi }}>
              Audi
            </button>
          </Link>

          <Link to="/bmw" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky', fontWeight: bmw }}>
              BMW
            </button>
          </Link>

          <Link to="/mercedes" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky', fontWeight: mercedes }}>
              Mercedes-Benz
            </button>
          </Link>

          <Link to="/peugeot" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky', fontWeight: peugeot }}>
              Peugeot
            </button>
          </Link>

          <Link to="/volvo" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky', fontWeight: volvo }}>
              Volvo
            </button>
          </Link>

          <Link to="/other" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' , fontWeight: other  }}>
              Other
            </button>
          </Link>

          {user && (
            <>
              <Link to="/personal" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky' }}>
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
      <div className="sort-bar">
        <button className={`sort-button ${sortBy === 'Calculated profit rate' ? 'selected' : ''}`} onClick={() => setSortBy('Calculated profit rate')}>Profit rate</button>
        <button className={`sort-button ${sortBy === 'Highest tax-return' ? 'selected' : ''}`} onClick={() => setSortBy('Highest tax-return')}>Highest tax-return</button>
        <button className={`sort-button ${sortBy === 'Newest first' ? 'selected' : ''}`} onClick={() => setSortBy('Newest first')}>Newest first</button>
        <button className={`sort-button ${sortBy === 'Most matches' ? 'selected' : ''}`} onClick={() => setSortBy('Most matches')}>Most matches</button>
      </div>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          className="search-bar"
        />
        <div className="result-count">Results: {sortedCarData.length}</div>
      </div>
      {sortedCarData.map((car, index) => (
        <div key={index} className="car-card">
          <div className="car-name-container">
            <h2 className="car-name">{car.car_name}</h2>
          </div>
          <img src={car.image_url} alt={car.car_name} className="car-image" />
          <p><strong>Finn.no link:</strong> <a href={car.finn_link} target="_blank" rel="noopener noreferrer">{car.finn_link}</a></p>
          <p><strong>Finn.no price:</strong> {car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM </p>
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
            <div className="favorite-button" onClick={() => handleFavoriteClick(car)}>
              <button> Save </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CarList;