import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home'
import NoPage from './pages/NoPage'
import After2015 from './pages/After2015';



function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route index element = {<Home />} />
            <Route path="/home" element = {<Home />} />
            <Route path="/after2015" element = {<After2015 />} />
            <Route path="*" element = {<NoPage />} />

          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
