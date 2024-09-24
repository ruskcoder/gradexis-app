import { createStore } from 'framework7/lite';
import {login} from './platform-routing.js';

const store = createStore({
  state: {
    users: JSON.parse(localStorage.getItem("users")) || [],
  },
  getters: {
    users({ state }) {
      return state.users;
    },
  },
  actions: {
    async addUser({ state }, loginData) {
      const userData = await login(loginData);
      
      if (userData) {
        state.users = [...state.users, userData];
        console.log(state.users);
        localStorage.setItem("users", JSON.stringify(state.users));
      } else {
        return false;
      }
    },
    removeUser({ state }, username) {
      state.users = state.users.filter((user) => user.username !== username);
    },
  },
});
export default store;
