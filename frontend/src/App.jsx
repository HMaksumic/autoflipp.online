import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home'
import NoPage from './pages/NoPage'
import AudiPage from './pages/AudiPage';
import BMWPage from './pages/BMWPage';
import MercedesPage from './pages/MercedesPage';
import PeugeotPage from './pages/PeugeotPage';
import VolvoPage from './pages/VolvoPage';
import VWPage from './pages/VWPage';
import OtherPage from './pages/OtherPage';

function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route index element = {<Home />} />
            <Route path="/other" element = {<OtherPage />} />
            <Route path="/home" element = {<Home />} />
            <Route path="/audi" element = {<AudiPage />} />
            <Route path="/bmw" element = {<BMWPage />} />
            <Route path="/mercedes" element = {<MercedesPage />} />
            <Route path="/peugeot" element = {<PeugeotPage />} />
            <Route path="/volvo" element = {<VolvoPage />} />
            <Route path="/volkswagen" element = {<VWPage />} />
            <Route path="*" element = {<NoPage />} />

          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
