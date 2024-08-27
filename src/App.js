import './assets/App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Waiting from './components/WaitingRoom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={< Home />} />
          <Route path="/waiting/:roomID" element = { < Waiting /> } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
