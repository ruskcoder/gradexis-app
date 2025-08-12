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
  if (err.includes('Invalid Session') || err.includes('Invalid')) { 
    f7.views.current.router.navigate('/login/#relogin');
    return;
  }
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
      history.replaceState({ path: "/" }, "", "/");

      const hideTabsRoutes = routes.filter((route) => route.hideTabbar == true).map((route) => route.path);
      f7.on("routeChange", (route) => {
        setShowTabbar(!hideTabsRoutes.includes(route.route.path));
        if (route.path == f7?.views?.current?.router?.previousRoute.path || store.state.refreshing) { 
          return;
        }
        if (store.state.loadedCounter >= 5) {
          if (store.state.backing) {
            store.state.backing = false;
          }
          else if (f7.views.current.router.history[f7.views.current.router.history.length - 1] == route.path && !store.state.refreshing) {
            store.state.backing = true;
            history.back();
            setTimeout(() => {
              store.state.backing = false;
            }, 100);
          }
          else {
            history.pushState({}, "", route.path);
          }
        }
        store.state.loadedCounter = (store.state.loadedCounter || 0) + 1;
      });
      ['#view-home', '#view-todo', '#view-grades', '#view-settings'].forEach(id => {
        f7.$(id).on("tab:show", function () {
          const path = f7.views.current.router.currentRoute.path;
          if (store.state.backing) {
            store.state.backing = false;
          } else {
            history.pushState({}, "", path);
          }
        });
      });
      window.onpopstate = (event) => {
        const path = event.target.location.pathname;
        const tabsRoutes = ["/", "/grades/", "/todo/", "/settings/"];
        const current = f7.views.current.router.currentRoute.path;
        if (window?.f7alert?.opened) {
          window.f7alert.close();
          setTimeout(() => {
            history.pushState({}, "", current);
          }, 10);
        }
        else {
          if (tabsRoutes.includes(path) && tabsRoutes.includes(current)) {
            if (current == "/" && !store.state.backing) {
              console.log('Exiting App')
              window.close();
              CapacitorApp.exitApp();
            } else {
              store.state.backing = true;
              f7.tab.show(f7.views.find(view => view.router.initialUrl === path).el);
            }
          }
          else {
            store.state.backing = true;
            f7.views.current.router.back();
          }
        }
      }

      f7.on('login', () => {
        setShowLogin(false);
        updateStatusBars();
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
