import React, { useState, useEffect } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import subscribe from "../js/notifications.js";
import notificationHandler from "../js/notification-handler.js";
import {
  f7,
  f7ready,
  App,
  Views,
  View,
  Toolbar,
  Link,
  Icon,
  Button
} from "framework7-react";
import PropTypes from 'prop-types';
import routes from "../js/routes";
import store from "../js/store";
import registerSW from "../js/register-sw";
import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import { updateStatusBars } from "../pages/settings";
import { SafeAreaController } from '@aashu-dubey/capacitor-statusbar-safe-area';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

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
  return (hexFromArgb(mdTheme[value]))
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
    iosSwipeBack: false,
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
  const [locked, setLocked] = useState(store.state.currentUser.biometrics)
  if (store.state.users.length == 0) {
    history.pushState({ path: "/login/" }, "", "/login/");
  }
  const authenticate = async () => { 
    const biometryAvailable = await BiometricAuth.checkBiometry();
    if (biometryAvailable.isAvailable) {
      try {
        await BiometricAuth.authenticate({
          reason: '',
          cancelTitle: 'Cancel',
          allowDeviceCredential: false,
          iosFallbackTitle: 'Use passcode',
          androidTitle: 'Log in to Gradexis',
          androidSubtitle: '',
          androidConfirmationRequired: false,
          // androidBiometryStrength: AndroidBiometryStrength.weak,
        });
        setLocked(false);
      } catch (error) {
        console.log("Biometric auth failed", error);
      }
    }
  }
  f7ready(async () => {
    if (!window.init) {
      window.init = true;
      SafeAreaController.injectCSSVariables();
      f7.setColorTheme(store.state.currentUser.theme);
      f7.setDarkMode(store.state.currentUser.scheme === "dark");
      setTimeout(() => {
        updateStatusBars();
      }, 750);
      if (Capacitor.isNativePlatform()) {
        await notificationHandler.init();
      }
      if (locked) {
        await authenticate();
      }
      // Register service worker for web
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

      if (Capacitor.isNativePlatform()) {
        // Handle mobile push notifications setup
        if (localStorage.getItem('notifications') != "dontshow") {
          window.f7alert = f7.dialog.confirm(
            "This app uses notifications to notify you of new grades and assignments.",
            "Notifications",
            async () => {
              try {
                await subscribe();
                window.f7alert = f7.dialog.alert("Notifications enabled successfully", "Notifications");
                localStorage.setItem('notifications', "dontshow");
              } catch (error) {
                localStorage.setItem('notifications', "dontshow");
                window.f7alert = f7.dialog.alert("Notifications not enabled. You can enable them in your system settings later on.", "Notifications");
              }
            },
            () => {
              localStorage.setItem('notifications', "dontshow");
              window.f7alert = f7.dialog.alert("You can enable notifications in your system settings later on.", "Notifications");
            }
          );
        }
      } else if ("Notification" in window && localStorage.getItem('notifications') != "dontshow") {
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

      if (store.state.currentUser.anim) {
        document.documentElement.classList.add("animated");
      }
      history.replaceState({ path: "/" }, "", "/");

      const hideTabsRoutes = routes.filter(route => route.hideTabbar).map(route => route.path);

      f7.on("routeChange", (route) => {
        setShowTabbar(!hideTabsRoutes.includes(route.route.path));
        setTimeout(() => {
          if (!f7.views.current.history.includes(route.url)) {
            return;
          }
          else {
            if (location.pathname != route.path) {
              history.pushState({}, "", route.path);
            }
          }
        }, 0)
      });

      ['#view-home', '#view-todo', '#view-grades', '#view-settings'].forEach(id => {
        f7.$(id).on("tab:show", () => {
          const path = f7.views.current.router.currentRoute.path;
          history.pushState({}, "", path);
        });
      });

      window.onpopstate = (event) => {
        const current = f7.views.current.router.currentRoute.path;
        if (window?.f7alert?.opened) {
          window.f7alert.close();
          setTimeout(() => history.pushState({}, "", current), 10);
          return;
        }
        else {
          let backLink = document.querySelector('a.link.back')
          if (backLink) {
            backLink.click();
          }
          else {
            document.querySelector('.tab-link[data-tab="#view-home"]').click();
          }
        }
      }
      f7.on('userChanged', () => {
        if (store.state.currentUser.biometrics) {
          setLocked(true);
          authenticate();
        }
      });
      f7.on('login', () => {
        setShowLogin(false);
        updateStatusBars();
      })
    }

  });

  const [showTabbar, setShowTabbar] = useState(true);

  return (
    <App {...f7params} store={store} className='safe-areas'>
      {!showTabbar &&
        <style>
          {`
        .page-content {
          padding-bottom: 0px;
        }
      `}
        </style>
      }
      <div className={"biometric-lock" + (locked ? " biometric-lock-visible" : "")}>
        <Icon ios="material:lock" md="material:lock"></Icon>
        <Button onClick={authenticate} outline small>Unlock</Button>
      </div>
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

        <View iosSwipeBack={false} id="view-home" tab tabActive main url="/" />

        <View iosSwipeBack={false} id="view-grades" name="grades" tab url="/grades/" />

        <View iosSwipeBack={false} id="view-todo" name="todo" tab url="/todo/" />

        <View iosSwipeBack={false} id="view-settings" name="settings" tab url="/settings/" />
      </Views>
    </App>
  );
};
Gradexis.propTypes = {
  f7router: PropTypes.any,
};
export default Gradexis;
