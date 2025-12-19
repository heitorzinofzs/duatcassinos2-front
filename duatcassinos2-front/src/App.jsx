import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import Home from './pages/Home';
import CardGamePage from './pages/CardGamePage';
import NumberGamePage from './pages/NumberGamePage';  


function App() {
  return (
    <PlayerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/cards" element={<CardGamePage />} />
          <Route path="/game/number" element={<NumberGamePage />} />
        </Routes>
      </Router>
    </PlayerProvider>
  );
}

export default App;