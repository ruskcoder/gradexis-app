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
import registerSW from "../js/register-sw";
import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { updateStatusBars } from "../pages/settings";
import { show } from "dom7";

export const roundGrade = (grade, letters = true) => {
  if (grade == "" || grade == "0.00") return letters ? "···" : "0.00";
  if (store.state.currentUser.roundGrades && !isNaN(parseFloat(grade))) {
    return Math.round(parseFloat(grade))
  }
  else if (store.state.currentUser.letterGrades && !isNaN(parseFloat(grade)) && letters) {
    const num = parseFloat(grade);
    if (num >= 97) return "A+";
    else if (num >= 93) return "A";
    else if (num >= 90) return "A-";
    else if (num >= 87) return "B+";
    else if (num >= 83) return "B";
    else if (num >= 80) return "B-";
    else if (num >= 77) return "C+";
    else if (num >= 73) return "C";
    else if (num >= 70) return "C-";
    else if (num >= 67) return "D+";
    else if (num >= 63) return "D";
    else if (num >= 60) return "D-";
    else return "F";
  }
  else return grade;
}

export const primaryFromColor = (theme) => {
  return (store.state.currentUser.layout == "md" ? hexFromArgb(themeFromSourceColor(argbFromHex(theme), []).schemes[store.state.currentUser.scheme].primary) : theme)
}
export const mdThemeFromColor = (theme, value) => {
  let mdTheme = themeFromSourceColor(argbFromHex(theme), []).schemes[store.state.currentUser.scheme];
  console.log(hexFromArgb(mdTheme[value]))
}

export const errorDialog = (err = "") => {
  console.log(err)
  if (err.includes("not valid JSON") || err.includes("Failed to fetch") || err.includes('<html')) {
    err = "Unable to fetch server. Perhaps it is blocked?"
  }
  let text = `An error occurred. Please restart the app and try again. ${err ? "<br> Error: " + err : ""}`;
  let title = "Error";
  if (err.includes("404")) { 
    text = "This feature is still in progress! Please try again later.";
    title = "Work in Progress";
  }

  window.f7alert = f7.dialog.create({
    title: title,
    text: text,
    cssClass: "error-dialog",
    buttons: [
      {
        text: 'OK',
        onClick: () => {
          window.f7alert.close()
        }
      },
      { text: 'Restart', onClick: () => { location.href = "/" } },
    ]
  })
  window.f7alert.open();
}
export const updateRouter = (f7router) => {
  window.router = f7router;
  window.onpopstate = function (event) {
    if (!window.closingDialog) {
      if (window.f7alert && window.f7alert.opened === true) {
        window.f7alert.close();
        window.closingDialog = true;
        history.forward(1);
      } else {
        window.backing = true;
        if (location.pathname == "/" && ['/', '/grades/', '/todo/', '/settings/'].includes(f7router.currentRoute.url)) {
          document.querySelector('a[data-tab="#view-home"]').click();
        } else if (location.pathname == "/home/") {
          CapacitorApp.exitApp();
          history.back();
        } else {
          f7router.back();
          if (location.pathname == "/") {
            history.pushState({ url: "/home/" }, null, "/home/");
          }
        }
      }
    }
    else {
      window.closingDialog = false;
    }
  };
};

const Gradexis = ({ f7router }) => {
  var f7params = {
    name: "Gradexis",
    theme: store.state.currentUser.layout,
    touch: {
      tapHold: true,
    },
    store: store,
    routes: routes,
  };
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapacitorApp.exitApp();
      } else {
        history.back();
      }
    });

    return () => {
      backButtonListener.remove();
    };
  }, [f7router]);

  const [showLogin, setShowLogin] = useState(store.state.users.length == 0);
  f7ready(async () => {
    if (!window.init) {
      window.init = true;
      history.replaceState(null, null, "/");
      // if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && !window.navigator.standalone) {
      registerSW();
      
      {/*if (localStorage.getItem('appPopupDismissed') != "true") {
        window.f7alert = f7.dialog.create({
          title: 'Add to Home Screen',
          text: `To use this as an app 
                  <br> <b>For iOS: </b>
                  <br> 1. Press the share icon
                  <br> 2. Press Add to Home Screen
                  <br>
                  <br> <b>For Android (and PC): </b>
                  <br> Wait for the following popup
            `,
          buttons: [
            {
              text: 'OK',
              onClick: async () => {
                if (window.deferredPrompt !== null && window.deferredPrompt !== undefined) {
                  window.deferredPrompt.prompt();
                  const { outcome } = await window.deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    window.deferredPrompt = null;
                  }
                }
                window.f7alert.close()
                localStorage.setItem('appPopupDismissed', "true")
              }
            },
          ]
        })
        window.f7alert.open()
      } */}

      if ("Notification" in window && localStorage.getItem('notifications') != "dontshow") {
        if (Notification.permission === "denied") {
          localStorage.setItem('notifications', "dontshow");
          window.f7alert = f7.dialog.alert("Please enable notifications to get the best experience", "Notifications");
        } else if (Notification.permission !== "granted") {
          window.f7alert = f7.dialog.confirm(
            "This app uses notifications to notify you of new grades and assignments.",
            "Notifications",
            () => {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  window.f7alert = f7.dialog.alert("Notifications enabled successfully", "Notifications");
                } else {
                  localStorage.setItem('notifications', "dontshow");
                  window.f7alert = f7.dialog.alert("Notifications not enabled. You can enable them in your system settings later on.", "Notifications");
                }
              });
            },
            () => {
              localStorage.setItem('notifications', "dontshow");
              window.f7alert = f7.dialog.alert("You can enable notifications in your system settings later on.", "Notifications");
            }
          );
        }
      }


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

      if (store.state.currentUser.anim) { 
        document.documentElement.classList.add("animated");
      }

      const hideTabsRoutes = routes.filter((route) => route.hideTabbar == true).map((route) => route.path);
      f7.on("routeChange", (route) => {
        setShowTabbar(!hideTabsRoutes.includes(route.route.path));
        let invalid = ["/", "/grades/", "/todo/", "/settings/", "/login/"]
        if (!invalid.includes(route.url) && !window.backing) {
          history.pushState({ url: route.url }, null, route.url);
        }
        else if (window.backing) {
          window.backing = false;
        }
      });
      f7.on('login', () => {
        setShowLogin(false)
      })
      updateStatusBars();
    }

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
            iconIos="material:checklist"
            iconMd="material:checklist"
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

        <View iosSwipeBack={true} id="view-home" tab tabActive main url="/" />

        <View iosSwipeBack={true} id="view-grades" name="grades" tab url="/grades/" />

        <View iosSwipeBack={true} id="view-todo" name="todo" tab url="/todo/" />

        <View iosSwipeBack={true} id="view-settings" name="settings" tab url="/settings/" />
      </Views>
    </App>
  );
};
Gradexis.propTypes = {
  f7router: PropTypes.any,
};
export default Gradexis;
