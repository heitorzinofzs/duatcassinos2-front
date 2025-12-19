import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { numberGameService } from '../services/numberGameService';

const NumberGamePage = () => {
  const navigate = useNavigate();
  const { player, updatePlayer } = usePlayer();
  
  // Estado do jogo
  const [betAmount, setBetAmount] = useState(10);
  const [guess, setGuess] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [history, setHistory] = useState([]); // Histórico de tentativas
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    if (!player) {
      setError('Você precisa estar logado!');
      return;
    }

    if (betAmount < 10) {
      setError('Aposta mínima: R$ 10');
      return;
    }

    if (betAmount > player.balance) {
      setError('Saldo insuficiente!');
      return;
    }

    setGameStarted(true);
    setError('');
    setHistory([]);
    setResult(null);
    setSessionId(null);
    setAttemptsLeft(5);
  };

  const handleGuess = async () => {
    const guessNumber = parseInt(guess);

    if (!guessNumber || guessNumber < 1 || guessNumber > 100) {
      setError('Digite um número entre 1 e 100!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await numberGameService.playRound(
        player.id,
        betAmount,
        guessNumber,
        sessionId
      );

      // Atualizar estado
      setSessionId(response.sessionId);
      setAttemptsLeft(response.attemptsLeft);
      
      // Adicionar ao histórico
      setHistory(prev => [...prev, {
        guess: guessNumber,
        hint: response.hint,
        won: response.won
      }]);

      // Se o jogo acabou
      if (response.gameOver) {
        setResult(response);
        setGameStarted(false);
        
        // Atualizar saldo do jogador
        updatePlayer({
          balance: response.newBalance,
          totalGames: response.totalGames,
          wins: response.wins,
          losses: response.losses,
          winRate: response.winRate
        });
      }

      setGuess(''); // Limpar input

    } catch (err) {
      setError(err.message || 'Erro ao processar tentativa');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      if (!gameStarted) {
        handleStartGame();
      } else {
        handleGuess();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-amber-500/30 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-amber-300 hover:text-amber-100 transition"
            >
              <span className="text-2xl">←</span>
              <span>Voltar</span>
            </button>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              🔢 Número do Faraó
            </h1>

            {player && (
              <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/50 rounded-lg px-4 py-2">
                <p className="text-amber-300 text-xs">Saldo</p>
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
          
          {/* Game Box */}
          <div className="bg-gradient-to-br from-amber-900/50 to-black border-2 border-amber-500 rounded-3xl p-8 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 blur-3xl" />
            
            <div className="relative space-y-6">
              {/* Tentativas restantes */}
              {gameStarted && (
                <div className="text-center">
                  <p className="text-amber-300 text-sm mb-2">Tentativas Restantes</p>
                  <div className="flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold
                          ${i < attemptsLeft 
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300' 
                            : 'border-gray-600 bg-gray-800 text-gray-600'
                          }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input de aposta (só mostra se não começou) */}
              {!gameStarted && !result && (
                <div>
                  <label className="block text-amber-300 mb-2 text-center">
                    Valor da Aposta: R$ {betAmount.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max={Math.min(player?.balance || 1000, 500)}
                    step="10"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-amber-400 mt-1">
                    <span>R$ 10</span>
                    <span>R$ {Math.min(player?.balance || 1000, 500)}</span>
                  </div>
                </div>
              )}

              {/* Input do número */}
              {gameStarted && (
                <div>
                  <label className="block text-amber-300 mb-2 text-center text-lg">
                    Qual é o número? (1 - 100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    placeholder="Digite um número..."
                    className="w-full bg-black/50 border-2 border-amber-500/50 rounded-xl px-6 py-4 text-white text-center text-2xl font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Botão principal */}
              <button
                onClick={gameStarted ? handleGuess : handleStartGame}
                disabled={loading || (!gameStarted && !player)}
                className={`
                  w-full py-4 rounded-xl font-bold text-xl transition-all
                  ${loading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transform hover:scale-105'
                  }
                `}
              >
                {loading ? 'PROCESSANDO...' : gameStarted ? '🎯 CHUTAR' : '🎮 COMEÇAR JOGO'}
              </button>

              {/* Histórico de tentativas */}
              {history.length > 0 && (
                <div className="bg-black/30 border border-amber-500/30 rounded-xl p-4">
                  <h3 className="text-amber-300 font-bold mb-3 text-center">📊 Suas Tentativas</h3>
                  <div className="space-y-2">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-black/50 rounded-lg p-3"
                      >
                        <span className="text-lg font-bold">Tentativa {index + 1}:</span>
                        <span className="text-2xl font-bold text-amber-300">{item.guess}</span>
                        {item.hint && (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold
                            ${item.hint === 'MAIOR' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}
                          `}>
                            {item.hint === 'MAIOR' ? '⬆️ MAIOR' : '⬇️ MENOR'}
                          </span>
                        )}
                        {item.won && (
                          <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-500/20 text-green-300">
                            ✅ ACERTOU!
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Result Message */}
          {result && (
            <div className={`
              border-2 rounded-xl p-6 mb-6 text-center animate-pulse
              ${result.won 
                ? 'bg-green-500/20 border-green-500' 
                : 'bg-red-500/20 border-red-500'
              }
            `}>
              <p className="text-2xl font-bold mb-2">
                {result.won ? '🎉 VOCÊ ACERTOU!' : '😔 VOCÊ PERDEU'}
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
              <button
                onClick={() => {
                  setResult(null);
                  setHistory([]);
                  setBetAmount(10);
                }}
                className="mt-4 bg-amber-600 hover:bg-amber-700 px-6 py-2 rounded-lg font-bold transition"
              >
                Jogar Novamente
              </button>
            </div>
          )}

          {/* Game Rules */}
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-center">📜 Como Jogar</h3>
            <div className="space-y-2 text-sm text-amber-200">
              <p>• Adivinhe o número secreto entre <strong>1 e 100</strong></p>
              <p>• Você tem <strong>5 tentativas</strong></p>
              <p>• A cada erro, recebe uma dica: MAIOR ou MENOR</p>
              <div className="mt-4 pt-4 border-t border-amber-500/30">
                <p className="font-bold mb-2">💰 Multiplicadores:</p>
                <div className="space-y-1">
                  <p>🥇 Acertar de <strong>1ª</strong>: <span className="text-green-400 font-bold">10x</span></p>
                  <p>🥈 Acertar de <strong>2ª</strong>: <span className="text-green-400 font-bold">6x</span></p>
                  <p>🥉 Acertar de <strong>3ª</strong>: <span className="text-green-400 font-bold">4x</span></p>
                  <p>4️⃣ Acertar de <strong>4ª</strong>: <span className="text-green-400 font-bold">2x</span></p>
                  <p>5️⃣ Acertar de <strong>5ª</strong>: <span className="text-green-400 font-bold">1.5x</span></p>
                  <p className="text-red-300">❌ Errar tudo: <strong>Perde a aposta</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NumberGamePage;