import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './PersonalCarList.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';

const PersonalCarList = () => {
  const { t } = useTranslation();
  const { user, removeFavorite, logout } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPrices, setShowAllPrices] = useState({});
  const [viewMode, setViewMode] = useState('regular');
  const [currencyData, setCurrencyData] = useState([]);

  useEffect(() => {
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

  if (loading) return <p>{t('loading_message')}</p>;
  if (error) {
    if (error.response && error.response.status === 401) {
      return (
        <div>
          <p>{t('session_expired')}</p>
          <p>{t('log_in_again')} <Link to="/home" onClick={logout}>{t('home_page')}</Link></p>
        </div>
      );
    } else {
      return (
        <div>
          <p>{t('error_loading')}: {error.message}</p>
        </div>
      );
    }
  }

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
        console.log(t('car_unfavorited'));
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error(t('error_removing_favorite'), error.response ? error.response.data : error.message);
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
                  {t('personal')}
                </button>
              </Link>
              <Link to="/home">
                <button onClick={logout} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', position: 'sticky', backgroundColor: 'lightsteelblue' }}>
                  {t('logout')}
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder={t('search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          className="search-bar"
        />
        <div className="result-count">{t('results')} {filteredCars.length}</div>
      </div>
      {filteredCars.map((car, index) => (
        viewMode === 'regular' ? (
          <div key={index} className="car-card">
            <Link to={`/personal/${car.regno ? car.regno : car.car_name}`} className="car-link">
              <div className="car-name-container">
                <h2 className="car-name">{car.car_name}</h2>
              </div>
              <img src={car.image_url} alt={car.car_name} className="car-image" />
            </Link>
            <p><strong>{t('finn_price')}:</strong> <a href={car.finn_link} target="_blank" rel="noopener noreferrer">{car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM</a></p>
            <p><strong>{t('olx_prices')}:</strong> {
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
                  {showAllPrices[car.car_name] ? t('less') : t('show_more')}
                </button>
              )}
            </p>
            <p><strong>{t('year')}:</strong> {car.year}</p>
            {car.tax_return > 0 && (
              <p><strong>{t('norwegian_tax_return_estimate')}:</strong> {car.tax_return} NOK / {TurnToBAM(car.tax_return)} BAM</p>
            )}
            {user && (
              <div className="favorite-button-container" onClick={() => handleRemoveFavorite(car.id)}>
                <button style={{color: 'red'}} className="favorite-button">{t('remove')}</button>
              </div>
            )}
          </div>
        ) : (
          <a key={index} href={car.finn_link} target="_blank" rel="noopener noreferrer" className="car-bar-personal">
            <img src={car.image_url} alt={car.car_name} />
            <div className="car-details-personal">
              <p><strong>{car.car_name}</strong></p>
              <p>{t('finn_price')}: {car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM</p>
              <p>{t('average_olx_price')}: {Math.round(car.olx_prices.reduce((a, b) => a + b, 0) / car.olx_prices.length)} BAM</p>
              <p>{t('year')}: {car.year}</p>
              {car.tax_return > 0 && (
                <p>{t('tax_return_simple')}: {car.tax_return} NOK / {TurnToBAM(car.tax_return)} BAM</p>
              )}
              {user && (
                <div className="favorite-button-container" onClick={() => handleRemoveFavorite(car.id)}>
                  <button style={{color: 'red'}} className="favorite-button">{t('remove')}</button>
                </div>
              )}
            </div>
          </a>
        )
      ))}
      {filteredCars.length === 0 && (
        <p>{t('no_saved_cars')}</p>
      )}
    </div>
  );
};

export default PersonalCarList;
