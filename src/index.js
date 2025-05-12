import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import ProfilePage from './pages/ProfilePage';
import ImagePage from './pages/ImagePage';
import FinalPage from './pages/FinalPage';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<ProfilePage />} />
      <Route path="/image" element={<ImagePage />} />
      <Route path="/final" element={<FinalPage />} />
    </Routes>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);