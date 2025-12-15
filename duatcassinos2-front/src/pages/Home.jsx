import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const Home = () => {
  const navigate = useNavigate();
  const { player, createGuest } = usePlayer();
  const [nickname, setNickname] = useState('');
  const [initialBalance, setInitialBalance] = useState(1000);
  const [showModal, setShowModal] = useState(!player);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('Digite um nickname!');
      return;
    }

    if (initialBalance < 100 || initialBalance > 10000) {
      setError('Saldo inicial deve estar entre R$ 100 e R$ 10.000');
      return;
    }

    setLoading(true);
    try {
      await createGuest(nickname, initialBalance);
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Erro ao criar jogador');
    } finally {
      setLoading(false);
    }
  };

  const games = [
    {
      id: 'cards',
      name: 'Jogo das Cartas',
      description: 'Slot místico com símbolos egípcios',
      icon: '🎰',
      path: '/game/cards',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'number',
      name: 'Número do Faraó',
      description: 'Adivinhe o número em 5 tentativas',
      icon: '🔢',
      path: '/game/number',
      color: 'from-blue-600 to-cyan-600',
      disabled: true
    },
    {
      id: 'sync',
      name: 'Sincronia Cósmica',
      description: 'Clique no momento exato',
      icon: '⏱️',
      path: '/game/sync',
      color: 'from-amber-600 to-orange-600',
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-purple-500/30 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🌌 DUAT CASSINOS II
              </h1>
              <p className="text-purple-300 text-sm mt-1">O purgatorio do destino</p>
            </div>
            
            {player && (
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-lg px-6 py-3">
                <p className="text-purple-300 text-sm">Jogador</p>
                <p className="text-xl font-bold">{player.nickname}</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  R$ {player.balance?.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Escolha seu Destino</h2>
          <p className="text-purple-300">
            Você está no Duat... não sabe se vai explodir ou afundar
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => !game.disabled && navigate(game.path)}
              disabled={game.disabled}
              className={`
                relative overflow-hidden rounded-xl p-6 
                transform transition-all duration-300 
                ${game.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 cursor-pointer'
                }
                bg-gradient-to-br ${game.color}
                border border-white/10
              `}
            >
              <div className="text-6xl mb-4">{game.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
              <p className="text-white/80 text-sm">{game.description}</p>
              
              {game.disabled && (
                <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-xs">
                  Em breve
                </div>
              )}

              {!game.disabled && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
              )}
            </button>
          ))}
        </div>

        {/* Player Stats */}
        {player && player.totalGames > 0 && (
          <div className="mt-12 max-w-2xl mx-auto bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-center">Suas Estatísticas</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-purple-300 text-sm">Jogadas</p>
                <p className="text-3xl font-bold">{player.totalGames}</p>
              </div>
              <div>
                <p className="text-green-300 text-sm">Vitórias</p>
                <p className="text-3xl font-bold text-green-400">{player.wins}</p>
              </div>
              <div>
                <p className="text-red-300 text-sm">Derrotas</p>
                <p className="text-3xl font-bold text-red-400">{player.losses}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-purple-300 text-sm">Taxa de Vitória</p>
              <p className="text-2xl font-bold text-yellow-400">
                {player.winRate?.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modal - Criar Jogador */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900 to-black border-2 border-purple-500 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Bem-vindo ao Duat
            </h2>
            
            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div>
                <label className="block text-purple-300 mb-2">Seu Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-black/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Digite seu nome..."
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-2">
                  Saldo Inicial: R$ {initialBalance}
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-purple-400 mt-1">
                  <span>R$ 100</span>
                  <span>R$ 10.000</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-bold transition-all"
              >
                {loading ? 'Criando...' : 'Entrar no Cassino'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;