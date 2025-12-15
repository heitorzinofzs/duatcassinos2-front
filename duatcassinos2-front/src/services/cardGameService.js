import api from './api';

export const cardGameService = {
  async playRound(playerId, betAmount) {
    return api.post('/games/cards/play', {
      playerId,
      betAmount,
    });
  },
};

export default cardGameService;