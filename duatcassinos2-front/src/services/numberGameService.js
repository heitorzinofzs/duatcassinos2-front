import api from './api';

export const numberGameService = {
  /**
   * Fazer uma tentativa no jogo
   * @param {number} playerId - ID do jogador
   * @param {number} betAmount - Valor da aposta
   * @param {number} guess - Número chutado (1-100)
   * @param {string|null} sessionId - ID da sessão (null pra nova partida)
   */
  async playRound(playerId, betAmount, guess, sessionId = null) {
    const payload = {
      playerId,
      betAmount,
      guess,
    };
    
    // Só inclui sessionId se não for a primeira tentativa
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    
    return api.post('/games/number/play', payload);
  },
};

export default numberGameService;