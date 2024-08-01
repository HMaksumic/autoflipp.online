import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './CarList.css';
import './PersonalCarList.css';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { NumericFormat } from 'react-number-format';

const CarList = ({ url, audi, bmw, mercedes, peugeot, volvo, volkswagen, other }) => {
  const { user, favorites, addFavorite, removeFavorite, logout } = useContext(AuthContext);
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPrices, setShowAllPrices] = useState({});
  const [sortBy, setSortBy] = useState('Calculated profit rate');
  const [viewMode, setViewMode] = useState('regular');
  const [currencyData, setCurrencyData] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [minYear, setMinYear] = useState('2010');
  const [maxYear, setMaxYear] = useState('2024');
  const [kilometers, setKilometers] = useState(500000);

  useEffect( () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0].replace(/-/g, '');
    const url = `https://cdn.jsdelivr.net/gh/prebid/currency-file@1/latest.json?date=${formattedDate}`;

    axios.get(url)
    .then(response => {
      setCurrencyData(response.data)
    })
  }, []);

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
  }, [url]);

  if (loading) return <p>This should not take more than 50 seconds...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  function TurnToBAM(parameter) {
    if (!currencyData) {
      console.error('Currency data not available, using "1 BAM = 5.85 NOK" estimate instead');
      return (parameter / 5.85);
    }

    const nokToUsd = currencyData.conversions.USD.NOK;
    const eurToUsd = currencyData.conversions.USD.EUR;
    const bamToEurRate = 0.51; //BAM is a pinned currency

    const nokToEur = nokToUsd / eurToUsd;
    const bamToNok = bamToEurRate * nokToEur;
    const resultInBAM = parameter / bamToNok;

    return resultInBAM.toFixed(0);
  }

  const CalculateProfitRate = (olxPrices, finnPriceNOK, taxReturn = 0) => {
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

  const handleMinPriceChange = (values) => {
    const value = values.floatValue || 0;
    if (value <= 1000000) {
      setMinPrice(value);
    }
  };
  
  const handleMaxPriceChange = (values) => {
    const value = values.floatValue || 0;
    if (value >= 0) {
      setMaxPrice(value);
    }
  };

  const handleMinYearChange = (e) => {
    setMinYear(e.target.value);
  };

  const handleMaxYearChange = (e) => {
    setMaxYear(e.target.value);
  };


  const handleKilometersChange = (values) => {
    const value = values.floatValue || 0;
    if (value >= 0) {
      setKilometers(value);
    }
  };

  const filteredCars = carData.filter(car => 
    car.car_name.toLowerCase().includes(searchTerm) &&
    car.finn_price >= minPrice &&
    car.finn_price <= maxPrice &&
    car.year >= minYear &&
    car.year <= maxYear &&
    car.year >= minYear &&
    car.mileage < kilometers
  );
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
    <div className={viewMode === 'regular' ? "car-list" : "car-list-personal"}>
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
            <div className="filter-container">
              <div className="filters">
                <div className="price-filter">
                  <label style={{ marginRight: '10px' }}>Price in NOK:</label>
                  <NumericFormat
                    value={minPrice}
                    thousandSeparator=" "
                    onValueChange={handleMinPriceChange}
                    style={{ marginRight: '10px', width: '80px', padding: '5px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                    placeholder="Min"
                  />
                  <NumericFormat
                    value={maxPrice}
                    thousandSeparator=" "
                    onValueChange={handleMaxPriceChange}
                    style={{ marginRight: '10px', width: '80px', padding: '5px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                    placeholder="Max"
                  />
                </div>
                <div className="year-filter">
                  <label style={{ marginRight: '10px' }}>Year:</label>
                  <input
                    type="number"
                    value={minYear}
                    onChange={handleMinYearChange}
                    style={{ marginRight: '10px', width: '80px', padding: '5px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                    placeholder="Min Year"
                  />
                  <input
                    type="number"
                    value={maxYear}
                    onChange={handleMaxYearChange}
                    style={{ marginRight: '10px', width: '80px', padding: '5px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                    placeholder="Max Year"
                  />
                </div>
                <div className='kilometers-filter'>
                  <label style={{ marginRight: '10px' }}>Mileage limit:</label>
                  <NumericFormat
                    value={kilometers}
                    thousandSeparator=" "
                    onValueChange={handleKilometersChange}
                    style={{ marginRight: '10px', width: '80px', padding: '5px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
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
        <div className="result-count">Results: {sortedCarData.length}</div>
      </div>
      {sortedCarData.map((car, index) => (
        viewMode === 'regular' ? (
          <div key={index} className="car-card">
            <div className="car-name-container">
              <h2 className="car-name">{car.car_name}</h2>
            </div>
            <img src={car.image_url} alt={car.car_name} className="car-image" />
            <p><strong>Finn.no price:</strong> <a href={car.finn_link} target="_blank" rel="noopener noreferrer">{car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM </a></p>
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
              <div className="favorite-button-container" onClick={() => handleFavoriteClick(car)}>
                <button className="favorite-button"> Save </button>
              </div>
            )}
          </div>
        ) : (
          <a key={index} href={car.finn_link} target="_blank" rel="noopener noreferrer" className="car-bar-personal">
            <img src={car.image_url} alt={car.car_name} />
            <div className="car-details-personal">
              <p><strong>{car.car_name}</strong></p>
              <p>Finn.no price: {car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM</p>
              <p>Average OLX.ba price: {(car.olx_prices.filter(price => price !== 0).reduce((a, b) => a + b, 0) / (car.olx_prices.filter(price => price !== 0).length || 1)).toFixed(0)} BAM</p>
              <p>Year: {car.year}</p>
              {car.tax_return > 0 && (
                <p>Tax return: {car.tax_return} NOK / {TurnToBAM(car.tax_return)} BAM</p>
              )}
            </div>
          </a>
        )
      ))}
    </div>
  );
};

export default CarList;