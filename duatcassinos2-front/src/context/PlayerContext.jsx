import { createContext, useContext, useState, useEffect } from 'react';
import { playerService } from '../services/playerService';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Criar jogador guest
  const createGuest = async (nickname, initialBalance = 1000) => {
    setLoading(true);
    try {
      const newPlayer = await playerService.createGuest(nickname, initialBalance);
      setPlayer(newPlayer);
      localStorage.setItem('playerId', newPlayer.id);
      return newPlayer;
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar jogador existente
  const loadPlayer = async (playerId) => {
    setLoading(true);
    try {
      const playerData = await playerService.getPlayer(playerId);
      setPlayer(playerData);
      return playerData;
    } catch (error) {
      console.error('Erro ao carregar jogador:', error);
      localStorage.removeItem('playerId');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados do jogador após jogada
  const updatePlayer = (updatedData) => {
    setPlayer(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  // Logout
  const logout = () => {
    setPlayer(null);
    localStorage.removeItem('playerId');
  };

  // Tentar carregar jogador salvo ao montar
  useEffect(() => {
    const savedPlayerId = localStorage.getItem('playerId');
    if (savedPlayerId) {
      loadPlayer(Number(savedPlayerId)).catch(() => {
        // Se falhar, limpa o storage
        localStorage.removeItem('playerId');
      });
    }
  }, []);

  return (
    <PlayerContext.Provider value={{
      player,
      loading,
      createGuest,
      loadPlayer,
      updatePlayer,
      logout
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer deve ser usado dentro de PlayerProvider');
  }
  return context;
};