import React, { useState, useEffect } from "react";

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
} from "framework7-react";

import $ from "dom7";
import routes from "../js/routes";
import store from "../js/store";

export function getColorTheme() {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve($("html").css("--f7-color-primary").trim());
    } else {
      window.addEventListener("load", () => {
        resolve($("html").css("--f7-color-primary").trim());
      });
    }
  });
}
var isDark;
var isLight;
var isIos;
var isMd;

const Gradexis = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginScreenOpened, setLoginScreenOpened] = useState(localStorage.getItem("username") != null);

  var f7params = {
    name: "Gradexis",
    theme: localStorage.getItem("appTheme") || "auto",

    pushState: true,
    touch: {
      tapHold: true,
    },
    store: store,
    routes: routes,
  };

  const alertLoginData = () => {
    f7.dialog.alert(
      "Username: " + username + "<br>Password: " + password,
      () => {
        f7.loginScreen.close();
      }
    );
  };

  // useEffect(() => {
  //   if (!localStorage.getItem("username")) {
  //     f7.views.main.router.navigate("/login/");
  //   }
  // }, []);

  f7ready(() => {
    isDark = f7.darkMode;
    isLight = !f7.darkMode;
    isIos = f7.theme === "ios";
    isMd = f7.theme === "md";

    if (isIos) {
      document.documentElement.style.setProperty(
        "--f7-navbar-large-title-padding-vertical",
        "10px"
      );
      document.documentElement.style.setProperty(
        "--f7-navbar-large-title-height",
        "64px"
      );
    }

    // f7.setColorTheme("#007aff");
    // f7.setColorTheme("#e08b00");
    f7.setColorTheme(localStorage.getItem("themeColor") || "#007aff");
    f7.setDarkMode(localStorage.getItem("theme") === "dark");
  });
  const [isLoading1, setIsLoading1] = useState(false);

  const load1 = () => {
    if (isLoading1) return;
    setIsLoading1(true);
    setTimeout(() => {
      setIsLoading1(false);
      f7.dialog.alert("Incorrect username or password")
    }, 4000);
  };

  return (
    <App {...f7params}>
      <Views tabs className="safe-areas">
        <Toolbar tabbar icons bottom>
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

        <View id="view-home" main tab tabActive url="/" />

        <View id="view-grades" name="grades" tab url="/grades/" />

        <View id="view-gpa" name="gpa" tab url="/gpa/" />

        <View id="view-settings" name="settings" tab url="/settings/" />
      </Views>

      <LoginScreen id="my-login-screen" opened={true}>
        <View>
          <Page loginScreen>
            <LoginScreenTitle>Login</LoginScreenTitle>
            <List form>
              <ListInput
                outline
                floatingLabel
                label="Username"
                type="text"
                name="username"
                placeholder="Your username"
                value={username}
                onInput={(e) => setUsername(e.target.value)}
              ></ListInput>

              <ListInput
                outline
                floatingLabel
                label="Password"
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onInput={(e) => setPassword(e.target.value)}
                className=""
              ></ListInput>
            </List>
            <Block>
              <Button preloader loading={isLoading1} onClick={load1} large fill>
                Login
              </Button>
            </Block>
            <List>
              <ListItem></ListItem>
              <BlockFooter>
                Login information may be stored on this
                <br />
                device.
              </BlockFooter>
            </List>
          </Page>
        </View>
      </LoginScreen>
    </App>
  );
};
export default Gradexis;
export { isDark, isLight, isIos, isMd };
