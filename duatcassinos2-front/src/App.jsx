import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import Home from './pages/Home';
import CardGamePage from './pages/CardGamePage';

function App() {
  return (
    <PlayerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/cards" element={<CardGamePage />} />
          {/* Adicione outras rotas aqui futuramente */}
        </Routes>
      </Router>
    </PlayerProvider>
  );
}

export default App;