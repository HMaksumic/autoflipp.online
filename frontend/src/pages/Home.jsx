import CarList from "../components/CarList";
import "../pages/Home.css"


export default function Home() {

  return (
    <div className="home-container">
      <h1 className="header">
      ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ Šrili Search ‎ 
        <img src="/icon.png" alt="missing" className="logo" />
      </h1>
      <CarList />
    </div>
  );
}