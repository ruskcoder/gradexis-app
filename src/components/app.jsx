import React, { useState, useEffect } from "react";
import { terminal } from 'virtual:terminal';
import { StatusBar, Style } from "@capacitor/status-bar";
import { App as CapacitorApp } from '@capacitor/app';
import {
  f7,
  f7ready,
  App,
  ListItem,
  Views,
  View,
  Popup,
  Page,
  Navbar,
  Toolbar,
  NavRight,
  Link,
  Block,
  BlockTitle,
  LoginScreen,
  LoginScreenTitle,
  List,
  Button,
  ListInput,
  ListButton,
  BlockFooter,
  useStore
} from "framework7-react";
import PropTypes from 'prop-types';
import routes from "../js/routes";
import store from "../js/store";
import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { updateStatusBars } from "../pages/settings";
import { show } from "dom7";

CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    CapacitorApp.exitApp();
  } else {
    window.history.back();
  }
});
export const primaryFromColor = (theme) => {
  return (store.state.currentUser.layout == "md" ? hexFromArgb(themeFromSourceColor(argbFromHex(theme), []).schemes[store.state.currentUser.scheme].primary) : theme)
}
export const mdThemeFromColor = (theme) => {
  return themeFromSourceColor(argbFromHex(theme), []).schemes[store.state.currentUser.scheme]
}
export const initEmits = (f7, f7router) => {
  f7.on('/grades/', () => {
    f7router.navigate('/grades/')
  })
  f7.on('/', () => {
    f7router.navigate('/')
  })
  f7.on('/todo/', () => {
    f7router.navigate('/todo/')
  })
  f7.on('/settings/', () => {
    f7router.navigate('/settings/')
  })
}
export const errorDialog = (err = "") => {
  f7.dialog.create({
    title: 'Error',
    text: 'There was an error while fetching your data. Please restart the app and try again. <br> Error: ' + err,
    buttons: [
      {
        text: 'OK',
        onClick: () => {
          f7.dialog.close()
        }
      },
      { text: 'Restart', onClick: () => { window.location.reload() } },
    ]
  }).open()
}
export const updateRouter = (f7router) => {
  window.router = f7router;
  window.onpopstate = function (event) {
    if (window.f7alert.opened == true) {
      window.f7alert.close()
    }
    else {
      f7router.back();
      history.pushState(null, null, f7router.url);
    }
  };
}

const Gradexis = ({ f7router }) => {
  var f7params = {
    name: "Gradexis",
    theme: store.state.currentUser.layout,
    pushState: true,
    browserHistory: true,
    touch: {
      tapHold: true,
    },
    view: {
      // history: true,
      // browserHistory: true,
    },
    store: store,
    routes: routes,
  };
  const [showLogin, setShowLogin] = useState(store.state.users.length == 0);

  f7ready(async () => {
    if (store.state.currentUser.layout === "ios") {
      document.documentElement.style.setProperty(
        "--f7-navbar-large-title-padding-vertical",
        "10px"
      );
      document.documentElement.style.setProperty(
        "--f7-navbar-large-title-height",
        "64px"
      );
    }

    f7.setColorTheme(store.state.currentUser.theme);
    f7.setDarkMode(store.state.currentUser.scheme === "dark");

    const hideTabsRoutes = routes.filter((route) => route.hideTabbar == true).map((route) => route.path);
    f7.on("routeChange", (route) => {
      setShowTabbar(!hideTabsRoutes.includes(route.route.path));
      let invalid = ["/", "/grades/", "/todo/", "/settings/", "/login/"]
      if (!invalid.includes(route.url)) {
        history.pushState(null, null, route.url);
      }
    });
    f7.on('login', () => {
      setShowLogin(false)
    })
    updateStatusBars();
    await StatusBar.show();

  });

  const [showTabbar, setShowTabbar] = useState(true);

  return (
    <App {...f7params} store={store}>
      {!showTabbar &&
        <style>
          {`
        .page-content {
          padding-bottom: 0px;
        }
      `}
        </style>
      }

      <View url="/login/" className={`login ${showLogin ? "" : "login-hidden"}`}></View>
      <Views className="safe-areas" tabs>

        <Toolbar tabbar icons bottom className={`tabbar ${showTabbar ? "" : "tabbar-hidden"}`}>
          <Link
            tabLink="#view-home"
            tabLinkActive
            iconIos="f7:house_fill"
            iconMd="material:home"
            text="Home"
            onClick={() => { f7.emit('/') }}
          />
          <Link
            tabLink="#view-grades"
            iconIos="material:school "
            iconMd="material:school"
            text="Grades"
            onClick={() => { f7.emit('/grades/') }}
          />
          <Link
            tabLink="#view-todo"
            iconIos="f7:checkmark_2"
            iconMd="material:done_all"
            text="Todo"
            onClick={() => { f7.emit('/todo/') }}
          />
          <Link
            tabLink="#view-settings"
            iconIos="f7:gear_alt_fill"
            iconMd="material:settings"
            text="Settings"
            onClick={() => { f7.emit('/settings/') }}
          />
        </Toolbar>

        <View id="view-home" tab tabActive main url="/" />

        <View id="view-grades" name="grades" tab url="/grades/" />

        <View id="view-todo" name="todo" tab url="/todo/" />

        <View id="view-settings" name="settings" tab url="/settings/" />
      </Views>
    </App>
  );
};
Gradexis.propTypes = {
  f7router: PropTypes.any,
};
export default Gradexis;