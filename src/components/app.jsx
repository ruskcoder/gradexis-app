import React, { useState, useEffect } from 'react';

import {
  f7,
  f7ready,
  App,
  Panel,
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
  ListItem,
  ListInput,
  ListButton,
  BlockFooter
} from 'framework7-react';

import $ from 'dom7';
import routes from '../js/routes';
import store from '../js/store';

export function getColorTheme() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve($('html').css('--f7-color-primary').trim());
    } else {
      window.addEventListener('load', () => {
        resolve($('html').css('--f7-color-primary').trim());
      });
    }
  });
}
var isDark;
var isLight;
var isIos;
var isMd;

const MyApp = () => {
  // Login screen demo data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  // Framework7 Parammdeters
  var f7params = {
    name: 'Gradexis',
    theme: 'md',

    pushState: true,
    touch: {
      tapHold: true
    },
    store: store,
    routes: routes,
  };
  const alertLoginData = () => {
    f7.dialog.alert('Username: ' + username + '<br>Password: ' + password, () => {
      f7.loginScreen.close();
    });
  }

  f7ready(() => {
    isDark = f7.darkMode;
    isLight = !f7.darkMode;
    isIos = f7.theme === "ios";
    isMd = f7.theme === "md";

    if (isIos) {
      document.documentElement.style.setProperty('--f7-navbar-large-title-padding-vertical', '10px');
      document.documentElement.style.setProperty('--f7-navbar-large-title-height', '64px');
    }

    // f7.setColorTheme("#007aff");
    f7.setColorTheme("#e08b00");
    // f7.setDarkMode(true);

  });

  return (
    <App {...f7params}>
      {/* Views/Tabs container */}
      <Views tabs className="safe-areas">
        {/* Tabbar for switching views-tabs */}
        <Toolbar tabbar icons bottom>
          <Link tabLink="#view-home" tabLinkActive iconIos="f7:house_fill" iconMd="material:home" text="Home" />
          <Link tabLink="#view-grades" iconIos="material:school" iconMd="material:school" text="Grades" />
          <Link tabLink="#view-gpa" iconIos="f7:chart_bar_alt_fill" iconMd="material:bar_chart" text="GPA" />
          <Link tabLink="#view-settings" iconIos="f7:gear_alt_fill" iconMd="material:settings" text="Settings" />

        </Toolbar>

        <View id="view-home" main tab tabActive url="/" />

        <View id="view-grades" name="grades" tab url="/grades/" />

        <View id="view-gpa" name="gpa" tab url="/gpa/" />

        <View id="view-settings" name="settings" tab url="/settings/" />

      </Views>

      {/* Popup */}
      <Popup id="my-popup">
        <View>
          <Page>
            <Navbar title="Popup">
              <NavRight>
                <Link popupClose>Close</Link>
              </NavRight>
            </Navbar>
            <Block>
              <p>Popup content goes here.</p>
            </Block>
          </Page>
        </View>
      </Popup>

      <LoginScreen id="my-login-screen">
        <View>
          <Page loginScreen>
            <LoginScreenTitle>Login</LoginScreenTitle>
            <List form>
              <ListInput
                type="text"
                name="username"
                placeholder="Your username"
                value={username}
                onInput={(e) => setUsername(e.target.value)}
              ></ListInput>
              <ListInput
                type="password"
                name="password"
                placeholder="Your password"
                value={password}
                onInput={(e) => setPassword(e.target.value)}
              ></ListInput>
            </List>
            <List>
              <ListButton title="Sign In" onClick={() => alertLoginData()} />
              <BlockFooter>
                Some text about login information.<br />Click Sign In to close Login Screen
              </BlockFooter>
            </List>
          </Page>
        </View>
      </LoginScreen>
    </App>
  )
}
export default MyApp;
export { isDark, isLight, isIos, isMd };
