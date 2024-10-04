import React, { useState, useEffect } from "react";
import { terminal } from 'virtual:terminal';
import { StatusBar, Style } from "@capacitor/status-bar";

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

export const primaryFromColor = (theme) => {
  return (store.state.currentUser.layout == "md" ? hexFromArgb(themeFromSourceColor(argbFromHex(theme), []).schemes[store.state.currentUser.scheme].primary) : theme)
}

const Gradexis = ({ f7router }) => {
  // const users = useStore('users')
  
  var f7params = {
    name: "Gradexis",
    theme: store.state.currentUser.layout,
    pushState: true,
    browserHistory: true,
    touch: {
      tapHold: true,
    },
    store: store,
    routes: routes,
  };

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

    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: primaryFromColor(store.state.currentUser.theme) });
    await StatusBar.show();
  });

  const secondaryRoutes = ['/login/',
    ...routes
    .filter((route) => (route.path.slice(0, -1).match(/\//g) || []).length > 1)
    .map((route) => route.path)
  ];
  const [showTabbar, setShowTabbar] = useState(true);

  useEffect(() => {
    f7ready(() => {
      if (store.state.users.length == 0) {
        f7.views.main.router.navigate("/login/")
      }
      f7.on("routeChange", (route) => {
        setShowTabbar(!secondaryRoutes.includes(route.path));
      });
    });
  })

  return (
    <App {...f7params} store={store}>
      <Views className="safe-areas" tabs>

          <Toolbar tabbar icons bottom className={`tabbar ${showTabbar ? "" : "tabbar-hidden"}`}>
            <Link
              tabLink="#view-home"
              tabLinkActive
              iconIos="f7:house_fill"
              iconMd="material:home"
              text="Home"
            />
            <Link
              tabLink="#view-grades"
              iconIos="material:school "
              iconMd="material:school"
              text="Grades"
            />
            <Link
              tabLink="#view-gpa"
              iconIos="f7:chart_bar_alt_fill"
              iconMd="material:bar_chart"
              text="GPA"
            />
            <Link
              tabLink="#view-settings"
              iconIos="f7:gear_alt_fill"
              iconMd="material:settings"
              text="Settings"
            />
          </Toolbar>
          
          <View id="view-home" tab tabActive main url="/" />

          <View id="view-grades" name="grades" tab url="/grades/" />

          <View id="view-gpa" name="gpa" tab url="/gpa/" />

          <View id="view-settings" name="settings" tab url="/settings/" />
      </Views>
    </App>
  );
};
Gradexis.propTypes = {
  f7router: PropTypes.any,
};
export default Gradexis;