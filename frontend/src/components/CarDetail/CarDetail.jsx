import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './CarDetail.module.css';

export default function CarDetail() {
  const { brand, regno } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyData, setCurrencyData] = useState([]);

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
    const fetchCarDetail = async () => {
      try {
        const response = await axios.get(`https://autoflipp-backend.online/api/olx_${brand}`);
        const foundCar = response.data.find(car => car.regno === regno);
        if (foundCar) {
          setCar(foundCar);
        } else {
          setError('Car not found');
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching car details:", err);
        setError('Error fetching car details');
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [brand, regno]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!car) return <div>No car found</div>;

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

  const sortedOlxPrices = car.olx_prices
    .map((price, index) => ({
      price,
      id: car.olx_ids[index],
      name: car.olx_names[index],
      image: car.olx_images[index],
      mileage: car.olx_mileages[index]
    }))
    .sort((a, b) => b.price - a.price);

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <header className={styles.headerStyle}>
        <h1 className={styles.titleStyle}>
          autoflipp.online
          <img src="/icon-white.png" alt="" className={styles.logoStyle} />
        </h1>
      </header>
      <div className={styles.pageContainer}>
        <div className={styles.carDetailContainer}>
          <main className={styles.mainStyle}>
            <img src={car.image_url} alt={car.car_name} className={styles.carDetailImage} />
            <h2>{car.car_name}</h2>
            <div className={styles.carInfo}>
              <p><strong>Finn.no Price:</strong> {car.finn_price} NOK</p>
              <p><strong>Finn.no Link:</strong> <a href={car.finn_link} target="_blank" rel="noopener noreferrer">View on Finn.no</a></p>
              <p><strong>Year:</strong> {car.year}</p>
              <p><strong>Mileage:</strong> {car.mileage} km</p>
              {car.tax_return && (
              <p><strong>Tax Return:</strong> {car.tax_return} NOK</p>
            )}
            </div>
            <button className={styles.backButton} onClick={handleGoBack}>Back to List</button>
          </main>
        </div>
        <div className={styles.olxPricesContainer}>
          {sortedOlxPrices.map(({ price, id, name, image, mileage }, index) => (
            <div key={index} className={styles.olxCard}>
              <a href={`https://olx.ba/artikal/${id}`} target="_blank" rel="noopener noreferrer" className={styles.olxLink}>
                <img src={image} alt={name} className={styles.olxImage} />
                <p><strong>{name}</strong></p>
                <p>{price === 0 ? 'Na upit' : `${price} BAM`}</p>
                <p>{parseInt(mileage.replace(/\./g, '')).toLocaleString()} km</p>
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
