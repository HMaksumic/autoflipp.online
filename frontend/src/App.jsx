import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './i18n';
import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home'
import NoPage from './pages/NoPage'
import AudiPage from './pages/AudiPage';
import BMWPage from './pages/BMWPage';
import MercedesPage from './pages/MercedesPage';
import PeugeotPage from './pages/PeugeotPage';
import VolvoPage from './pages/VolvoPage';
import VWPage from './pages/VWPage';
import OtherPage from './pages/OtherPage';
import { AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PersonalPage from './pages/PersonalPage';
import CarDetail from './components/CarDetail/CarDetail';
import CarDetailProtected from './components/CarDetail/CarDetailProtected';

function App() {
    const { i18n } = useTranslation();
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/other" element={<OtherPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/audi" element={<AudiPage />} />
          <Route path="/bmw" element={<BMWPage />} />
          <Route path="/mercedes" element={<MercedesPage />} />
          <Route path="/peugeot" element={<PeugeotPage />} />
          <Route path="/volvo" element={<VolvoPage />} />
          <Route path="/volkswagen" element={<VWPage />} />
          <Route path="/personal" element={<ProtectedRoute component={PersonalPage} />} />
          <Route path="/:brand/:identifier" element={<CarDetail />} />
          <Route path="/personal/:identifier" element={<ProtectedRoute component={CarDetailProtected} />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
