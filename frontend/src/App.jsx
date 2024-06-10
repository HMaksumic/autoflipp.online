import { useState , useEffect} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home'
import About from './pages/About'
import Market from './pages/Market'
import NoPage from './pages/NoPage'


function App() {
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

  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route index element = {<Home />} />
            <Route path="/home" element = {<Home />} />
            <Route path="/About" element = {<About />} />
            <Route path="/Market" element = {<Market />} />

            <Route path="*" element = {<NoPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
