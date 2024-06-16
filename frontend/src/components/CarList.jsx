import './CarList.css';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CarList = () => {
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    //axios.get('http://127.0.0.1:8080/api/olx_finn_data')
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

function formatCarName(name) {
    return name.replace(/([a-z])([A-Z])/g, '$1 $2')
               .replace(/(\d)/g, ' $1 ')             
               .replace(/ {2,}/g, ' ')               
               .trim();                              
}

  return (
    <div className="car-list">
      {carData.map((car, index) => (
        <div key={index} className="car-card">
          <h2>{formatCarName(car.car_name)}</h2>
          <p><strong>finn.no link:</strong> <a href={car.finn_link} target="_blank" rel="noopener noreferrer">{car.finn_link}</a></p>
          <p><strong>finn.no price:</strong> {car.finn_price} NOK</p>
          <p><strong>OLX.ba prices:</strong> {car.olx_prices.join(', ')} BAM/KM</p>
          <p><strong>year:</strong> {car.year}</p>
        </div>
      ))}
    </div>
  );
};

export default CarList;
