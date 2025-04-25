import { createStore } from 'framework7/lite';
import {login} from './grades-api.js';
import {Card, f7} from 'framework7-react';
import { terminal } from 'virtual:terminal'

const defaultpfp = "data:image/webp;base64,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";
var users = JSON.parse(localStorage.getItem("users"));
var currentUserNumber = localStorage.getItem('currentUserNumber');
if (!users) {
  localStorage.setItem("users", JSON.stringify([]));
  users = [];
}
if (!currentUserNumber) {
  localStorage.setItem("currentUserNumber", -1);
  currentUserNumber = -1;
}
if (currentUserNumber >= users.length) {
  currentUserNumber = users.length - 1;
}
const defaultUser = {
  pfp: defaultpfp,
  scheme: 'dark',
  theme: '#007aff',
  layout: 'md',
  term: -1,
  termList: [],
  gradelist: {},
  scoresIncluded: false,
  stream: true,
  gradesView: 'card',
  roundGrades: false,
  pageTransition: 'f7-parallax'
};
const store = createStore({
  state: {
    users: users,
    currentUser: users.length != 0 ? users[currentUserNumber] : defaultUser,
    currentUserNumber: currentUserNumber,
    scoresIncluded: false,
    useCache: false,
    loaded: false,
    activeButtonIndex: -1,
    session: {}
  },
  getters: {
    users({ state }) {
      return state.users;
    },
    currentUser({ state }) {
      return state.currentUser;
    },
    classes({ state }) {
      return state.classes;
    },
    session({ state }) {
      return state.session;
    }
  },
  actions: {
    async addUser({ state }, loginData) {
      const userData = await login(loginData)
      if (userData.success !== false) {
        state.users = [...state.users, {...userData, ...defaultUser}];
        localStorage.setItem("users", JSON.stringify(state.users));
        
        if (state.currentUserNumber == -1) {
          localStorage.setItem('currentUserNumber', 0);
          state.currentUserNumber = 0;
          state.currentUser = state.users[0];
        }
        
        return userData;
      } else {
        f7.dialog.alert(userData.message, "Login Failed");
        return false;
      }
    },
    removeUser({ state }, username) {
      state.users = state.users.filter((user) => user.username !== username);
      localStorage.setItem("users", JSON.stringify(state.users));
      if (state.currentUser.username === username) {
        if (state.users.length === 0) {
          // state.currentUser = {};
          state.currentUserNumber = -1;
          localStorage.setItem('currentUserNumber', -1);
        } else {
          state.currentUser = state.users[0];
          state.currentUserNumber = 0;
        }
      }
    },
    changeUserData({ state }, { userNumber, item, value }) {
      state.users[userNumber][item] = value;

      localStorage.setItem("users", JSON.stringify(state.users));
      if (state.currentUserNumber === userNumber) {
        state.currentUser = state.users[userNumber];
      }
    },
    switchUser({ state }, userNumber) {
      if (userNumber < state.users.length) {
        state.currentUser = state.users[userNumber];
        state.currentUserNumber = userNumber;
      }
      localStorage.setItem('currentUserNumber', state.currentUserNumber); 
      store.dispatch('setClasses', []);
      store.dispatch('setTerm', -1);
      store.dispatch('setSession', {});
      f7.setColorTheme(state.currentUser.theme);
      f7.setDarkMode(state.currentUser.scheme === "dark");
    },
    setClasses({ state }, classes) {
      state.classes = classes;
    },
    setTerm({ state }, term) {
      state.currentUser.term = term;
    },
    setSession({ state }, session) {
      state.session = session;  
    },
  }
});
export default store;
