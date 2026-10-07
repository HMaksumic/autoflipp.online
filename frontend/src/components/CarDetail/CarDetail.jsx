import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './CarDetail.module.css';
import { useTranslation } from 'react-i18next';
import { getCarDataUrl } from '../../data/carData';
import { turnToBAM } from '../../utils/currency';

export default function CarDetail() {
  const { brand, identifier } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyData, setCurrencyData] = useState(null);
  const { t } = useTranslation();

  useEffect( () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0].replace(/-/g, '');
    const url = `https://cdn.jsdelivr.net/gh/prebid/currency-file@1/latest.json?date=${formattedDate}`;

    axios.get(url)
    .then(response => {
      setCurrencyData(response.data)
    })
    .catch(() => setCurrencyData(null));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setCar(null);

    const fetchCarDetail = async () => {
      try {
        const response = await axios.get(getCarDataUrl(brand));
        if (!active) return;
        const foundCar = response.data.find(car => car.regno === identifier || car.car_name === identifier);
        if (foundCar) {
          setCar(foundCar);
        } else {
          setError('no_car_found');
        }
        setLoading(false);
      } catch (err) {
        if (!active) return;
        console.error("Error fetching car details:", err);
        setError('error_loading');
        setLoading(false);
      }
    };

    fetchCarDetail();
    return () => { active = false; };
  }, [brand, identifier]);

  if (loading) return <div>{t('car_list_intro')}</div>;
  if (error) return <div>{t(error)}</div>;
  if (!car) return <div> {t('no_car_found')} </div>;

  function TurnToBAM(parameter) {
    return turnToBAM(parameter, currencyData);
  }

  const sortedOlxPrices = car.olx_prices
  .map((price, index) => ({
    price,
    id: car.olx_ids[index],
    name: car.olx_names?.[index] || `OLX.ba #${car.olx_ids[index]}`,
    image: car.olx_images?.[index],
    mileage: car.olx_mileages?.[index] == null
      ? null
      : parseInt(String(car.olx_mileages[index]).replace(/\./g, ''), 10)
  }))
  .sort((a, b) => {
    if (a.price === 0 && b.price === 0) return 0;
    if (a.price === 0) return 1;
    if (b.price === 0) return -1;
    return a.price - b.price;
  });

    const handleGoBack = () => {
      if (window.history.length > 2) {
        window.history.back();
      } else {
        const url = new URL(window.location.href);
        const brandPage = url.origin + url.pathname.split('/').slice(0, 2).join('/');
        window.location.href = brandPage;
      }
    };

    const validOlxPrices = sortedOlxPrices.filter(car => car.price > 0); 
    const validOlxMileages = sortedOlxPrices.filter(car => car.mileage > 0 && car.mileage < 500000);
    
    const averageOlxMileage = validOlxMileages.length
      ? validOlxMileages.reduce((sum, car) => sum + car.mileage, 0) / validOlxMileages.length
      : null;
    
    const finnPriceBAM = parseInt(TurnToBAM(car.finn_price - (car.tax_return ?? 0)), 10);
    const averageOlxPrice = validOlxPrices.length
      ? validOlxPrices.reduce((sum, car) => sum + car.price, 0) / validOlxPrices.length
      : null;

    return (
      <>
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          <Link to='/home' style={linkStyle}>
            autoflipp.online
            <img src="/icon-white.png" alt="Home" style={logoStyle} />
          </Link>
        </h1>
      </header>
        <div className={styles.pageContainer}>
          <div className={styles.carDetailContainer}>
            <main className={styles.mainStyle}>
              <img src={car.image_url} alt={car.car_name} className={styles.carDetailImage} />
              <h2>
                {car.car_name.length > 40 
                  ? `${car.car_name.substring(0, car.car_name.lastIndexOf(' ', 40))}` 
                  : car.car_name}
              </h2>
              <div className={styles.carInfo}>
                <p style={{fontSize: '25px'}}><strong>{t('finn_price')}</strong> {car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM</p>
                <p><strong>Finn.no link: </strong> <a href={car.finn_link} target="_blank" rel="noopener noreferrer">{t('view_on_finn_no')}</a></p>
                <p><strong>{t('year')}</strong> {car.year}</p>
                <p><strong>{t('mileage')}</strong> {car.mileage == null ? t('not_available') : `${car.mileage} km`}</p>
                {car.tax_return > 0 && (
                  <p><strong>{t('tax_return_simple')}</strong> {car.tax_return} NOK / {TurnToBAM(car.tax_return)} BAM</p>
                )}
                
                <div className={styles.comparisonContainer}>
                  <h3>{t('compare_all_matches')}</h3>
                  {averageOlxPrice != null ? <p className={`${styles.comparisonDifference} ${averageOlxPrice - finnPriceBAM > 0 ? styles.priceGain : styles.priceLoss}`}>
                    {averageOlxPrice - finnPriceBAM > 0 ? '+' : ''}{(averageOlxPrice - finnPriceBAM).toFixed(0)} BAM
                  </p> : <p>{t('not_available')}</p>}
                  {averageOlxMileage != null && car.mileage != null && <p className={`${styles.comparisonDifference} ${averageOlxMileage - car.mileage > 0 ? styles.mileageGain : styles.mileageLoss}`}>
                  {averageOlxMileage - car.mileage > 0 ? '-' : '+'}{Math.abs(averageOlxMileage - car.mileage).toFixed(0)} km
                  </p>}
                </div>
              </div>
              <button className={styles.backButton} onClick={handleGoBack}>{t('back_to_list')}</button>
            </main>
          </div>
          <h2 className={styles.olxListingsTitle}> {t('olx_ba_listings')} </h2>
          <div className={styles.olxPricesContainer}>
            {sortedOlxPrices.map(({ price, id, name, image, mileage }, index) => (
              <div key={index} className={styles.olxCard}>
                <a href={`https://olx.ba/artikal/${id}`} target="_blank" rel="noopener noreferrer" className={styles.olxLink}>
                  {image && <img src={image} alt={name} className={styles.olxImage} />}
                  <p><strong>{name.length > 20 ? `${name.substring(0, 20)}...` : name}</strong></p>
                  <p>{price === 0 ? 'Na upit' : `${price} BAM`}</p>
                  {Number.isFinite(mileage) && <p>{mileage} km</p>}
                  {price > 0 && (
                    <p className={`${styles.priceDifference} ${price - finnPriceBAM > 0 ? styles.priceGain : styles.priceLoss}`}>
                      {price - finnPriceBAM > 0 ? '+' : ''}{(price - finnPriceBAM).toFixed(0)} BAM
                    </p>
                  )}
                </a>
              </div>
            ))}
          </div>
        </div>
      </>
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
