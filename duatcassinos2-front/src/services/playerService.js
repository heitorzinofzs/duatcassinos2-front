import api from './api';

export const playerService = {
  async createGuest(nickname, balance = 1000) {
    return api.post(`/players/guest?nickname=${nickname}&balance=${balance}`);
  },

  async getPlayer(id) {
    return api.get(`/players/${id}`);
  },

  async getPlayerByNickname(nickname) {
    return api.get(`/players/by-nickname?nickname=${nickname}`);
  },
};