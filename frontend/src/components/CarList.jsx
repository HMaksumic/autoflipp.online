import './CarList.css';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CarList = () => {
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    //axios.get('http://127.0.0.1:8080/api/olx_finn_data') //for dev testing
    axios.get('https://autoflipp-online.onrender.com/api/olx_finn_data') //above api hosted by third party
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
    return (parameter / 5.85).toFixed(0)
  }
  const BaseOLXUrl = "https://olx.ba/artikal/";

  return (
    <div className="car-list">
      {carData.map((car, index) => (
        <div key={index} className="car-card">
          <h2>{car.car_name}</h2>
          <img src={car.image_url} alt={car.car_name} className="car-image" />

          <p><strong>finn.no link:</strong> <a href={car.finn_link} target="_blank" rel="noopener noreferrer">{car.finn_link}</a></p>
          <p><strong>finn.no price:</strong> {car.finn_price} NOK / {TurnToBAM(car.finn_price)} BAM </p>

          <p><strong>OLX.ba prices:</strong> {
            car.olx_prices
              .map((price, i) => (
                <span key={i}>
                  <a href={`${BaseOLXUrl}${car.olx_ids[i]}`} target="_blank" rel="noopener noreferrer" className="olx-link">
                    {price === 0 ? 'Na upit' : `${price}`}
                  </a>
                  {i < car.olx_prices.length - 1 && ', '}
                  
                </span>
              ))
          }&nbsp; </p>
    
          <p><strong>year:</strong> {car.year}</p>
        </div>
      ))}
    </div>
  );
};

export default CarList;
