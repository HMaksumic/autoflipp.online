import Header from '../components/Header'
import { useNavigate } from 'react-router-dom';


export default function Home() {
    const navigate = useNavigate();
    function goToMarket() {
        navigate('/market');
      }
    
      return (
        <div>
          <h1>Home Page</h1>
          <button onClick={goToMarket}>Go to Market</button>
        </div>
      );
}