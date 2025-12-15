import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { cardGameService } from '../services/cardGameService';

const CardGamePage = () => {
  const navigate = useNavigate();
  const { player, updatePlayer } = usePlayer();
  
  const [betAmount, setBetAmount] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [symbols, setSymbols] = useState(['?', '?', '?']);
  const [error, setError] = useState('');

  // Mapear símbolos do backend para emojis
  const symbolMap = {
    'FLAME': '🔥',
    'ANKH': '☥',
    'EYE': '👁',
    'SCARAB': '🐞',
    'MOON': '🌙',
    'STAR': '⭐'
  };

  const handleSpin = async () => {
    if (!player) {
      setError('Você precisa estar logado!');
      return;
    }

    if (betAmount < 5) {
      setError('Aposta mínima: R$ 5');
      return;
    }

    if (betAmount > player.balance) {
      setError('Saldo insuficiente!');
      return;
    }

    setError('');
    setResult(null);
    setSpinning(true);

    // Animação de spinning
    const spinInterval = setInterval(() => {
      setSymbols([
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
      ]);
    }, 100);

    try {
      // Chamar API
      const response = await cardGameService.playRound(player.id, betAmount);

      // Parar animação após 2 segundos
      setTimeout(() => {
        clearInterval(spinInterval);
        
        // Mostrar resultado real
        const finalSymbols = response.symbols.map(s => symbolMap[s] || '?');
        setSymbols(finalSymbols);
        setResult(response);
        setSpinning(false);

        // Atualizar saldo do jogador
        updatePlayer({
          balance: response.newBalance,
          totalGames: response.totalGames,
          wins: response.wins,
          losses: response.losses,
          winRate: response.winRate
        });
      }, 2000);

    } catch (err) {
      clearInterval(spinInterval);
      setError(err.message || 'Erro ao jogar');
      setSpinning(false);
      setSymbols(['?', '?', '?']);
    }
  };

  const getRandomSymbol = () => {
    const symbols = Object.values(symbolMap);
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-purple-500/30 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition"
            >
              <span className="text-2xl">←</span>
              <span>Voltar</span>
            </button>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎰 Jogo das Cartas
            </h1>

            {player && (
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-lg px-4 py-2">
                <p className="text-purple-300 text-xs">Saldo</p>
                <p className="text-xl font-bold text-green-400">
                  R$ {player.balance?.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Slot Machine */}
          <div className="bg-gradient-to-br from-purple-900/50 to-black border-2 border-purple-500 rounded-3xl p-8 mb-6 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl" />
            
            {/* Symbols Display */}
            <div className="relative grid grid-cols-3 gap-4 mb-6">
              {symbols.map((symbol, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square bg-black/50 border-2 border-purple-500 rounded-2xl 
                    flex items-center justify-center text-8xl
                    ${spinning ? 'animate-pulse' : ''}
                  `}
                >
                  {symbol}
                </div>
              ))}
            </div>

            {/* Bet Controls */}
            <div className="relative space-y-4">
              <div>
                <label className="block text-purple-300 mb-2 text-center">
                  Valor da Aposta: R$ {betAmount.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="5"
                  max={Math.min(player?.balance || 1000, 500)}
                  step="5"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={spinning}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-purple-400 mt-1">
                  <span>R$ 5</span>
                  <span>R$ {Math.min(player?.balance || 1000, 500)}</span>
                </div>
              </div>

              <button
                onClick={handleSpin}
                disabled={spinning || !player}
                className={`
                  w-full py-4 rounded-xl font-bold text-xl transition-all
                  ${spinning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                  }
                `}
              >
                {spinning ? 'GIRANDO...' : '🎰 GIRAR'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Result Message */}
          {result && !spinning && (
            <div className={`
              border-2 rounded-xl p-6 mb-6 text-center animate-pulse
              ${result.won 
                ? 'bg-green-500/20 border-green-500' 
                : 'bg-red-500/20 border-red-500'
              }
            `}>
              <p className="text-2xl font-bold mb-2">
                {result.won ? '🎉 VOCÊ GANHOU!' : '😔 NÃO FOI DESSA VEZ'}
              </p>
              <p className="text-lg mb-2">{result.message}</p>
              {result.won && (
                <p className="text-3xl font-bold text-green-400">
                  + R$ {result.winAmount.toFixed(2)}
                </p>
              )}
              {!result.won && (
                <p className="text-3xl font-bold text-red-400">
                  - R$ {betAmount.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Game Rules */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-center">📜 Como Jogar</h3>
            <div className="space-y-2 text-sm text-purple-200">
              <p>• <strong>Três símbolos iguais:</strong> Ganho MÁXIMO (multiplicador dobrado)</p>
              <p>• <strong>Dois símbolos iguais:</strong> Ganho baseado no símbolo</p>
              <p>• <strong>Nenhum símbolo igual:</strong> Você perde a aposta</p>
              <div className="mt-4 pt-4 border-t border-purple-500/30">
                <p className="font-bold mb-2">Multiplicadores:</p>
                <div className="grid grid-cols-2 gap-2">
                  <p>🔥 Chama: 2x</p>
                  <p>☥ Ankh: 3x</p>
                  <p>👁 Olho: 4x</p>
                  <p>🐞 Escaravelho: 5x</p>
                  <p>🌙 Lua: 6x</p>
                  <p>⭐ Estrela: 10x</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CardGamePage;