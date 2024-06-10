import header from '../components/Header'
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Market() {
    const [count, setCount] = useState(0);
    const [array, setArray] = useState([]);
  
    const fetchAPI = async () => {
      const response = await axios.get("http://127.0.0.1:8080/api/search");
      console.log(response.data.search);
      setArray(response.data.search);
    };
  
    useEffect( () => {
      fetchAPI()
    }, []   )


    const products = [
        { id: 1, name: "placeholder1", price: "$1.00", imgSrc: "https://via.placeholder.com/150" },
        { id: 2, name: "placeholder2", price: "$0.50", imgSrc: "https://via.placeholder.com/150" },
        { id: 3, name: "placeholder3", price: "$0.30", imgSrc: "https://via.placeholder.com/150" },
    ];


    const navigate = useNavigate();
    function goToHome() {
        navigate('/home');
      }
    
    return (
        <>
            <div style={{ backgroundColor: '#333', color: 'white', textAlign: 'center', padding: '10px 0' }}>
                Parts
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', padding: '20px', background: '#f4f4f4' }}>
                {products.map(product => (
                    <div key={product.id} style={{ background: 'white', border: '1px solid #ddd', width: '200px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', padding: '10px', boxSizing: 'border-box' }}>
                        <div style={{ width: '100%', height: 'auto' }}>
                            <img src={product.imgSrc} alt={product.name} style={{ width: '100%' }} />
                        </div>
                        <div style={{ fontSize: '16px', color: '#333' }}>{product.name}</div>
                        <div style={{ color: '#888', fontSize: '14px' }}>{product.price}</div>
                    </div>
                ))}
            </div>
                <div>
                <br></br>
                <button onClick={goToHome}>Go back</button>
                </div>
              
        
        </>
    );
}