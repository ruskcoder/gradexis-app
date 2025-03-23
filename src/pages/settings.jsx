import React, { useState, useEffect } from 'react';
import {
  Page,
  Navbar,
  List,
  Toggle,
  ListItem,
  ListInput,
  BlockTitle,
  Button,
  Card,
  CardContent,
  Icon,
  f7,
  f7ready,
  ListButton,
  useStore
} from "framework7-react";
import $, { change } from "dom7";
import store from "../js/store.js";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { terminal } from 'virtual:terminal'
import { initEmits } from '../components/app.jsx';
import { Dom7 } from 'framework7';

export const updateStatusBars = async () => {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const newColor = getComputedStyle(document.body).getPropertyValue('--f7-bars-bg-color');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', newColor);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = newColor;
    document.head.appendChild(meta);
  }
  document.body.style.backgroundColor = newColor;
  try {
    await StatusBar.setStyle({ style: store.state.currentUser.scheme == "dark" ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color: newColor });
    await NavigationBar.setColor({ color: newColor, darkButtons: store.state.currentUser.scheme == "light" });
    await StatusBar.show();
  } catch (error) {
    console.log("Web UI detected, skipping status bar and navigation bar color changes.")
  }
}

const SettingsPage = ({ f7router }) => {
  const user = useStore('currentUser');
  const [theme, changeTheme] = useState(user.theme);
  const [scheme, changeScheme] = useState(user.scheme);
  const [biometrics, changeBiometrics] = useState(user.biometrics ? user.biometrics : false);
  const [groupLists, changeGroupLists] = useState(user.groupLists ? user.groupLists : false);
  const [anim, changeAnim] = useState(user.anim ? user.anim : false);

  function fixHexColor(hex) { let r = 0, g = 0, b = 0; if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); } else if (hex.length === 7) { r = parseInt(hex[1] + hex[2], 16); g = parseInt(hex[3] + hex[4], 16); b = parseInt(hex[5] + hex[6], 16); } r /= 255; g /= 255; b /= 255; let max = Math.max(r, g, b), min = Math.min(r, g, b); let h, s, l = (max + min) / 2; if (max !== min) { let d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; } h /= 6; } else { h = s = 0; } s = 1; l = 0.5; let q = l < 0.5 ? l * (1 + s) : l + s - l * s; let p = 2 * l - q; r = hueToRgb(p, q, h + 1 / 3); g = hueToRgb(p, q, h); b = hueToRgb(p, q, h - 1 / 3); r = Math.round(r * 255); g = Math.round(g * 255); b = Math.round(b * 255); return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`; } function hueToRgb(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
  const restartApp = () => {
    f7.dialog.create({
      title: 'Restart Required',
      text: 'To apply changes, the app must be restarted. Please restart the app.',
      buttons: [
        {
          text: 'Restart',
          onClick: () => {
            location.reload();
          }
        }
      ]
    }).open();
  }
  const setScheme = (newScheme) => {
    changeScheme(newScheme);
    f7.setDarkMode(newScheme === "dark");
    store.dispatch("changeUserData", {
      userNumber: store.state.currentUserNumber,
      item: "scheme",
      value: newScheme,
    });
    updateStatusBars();
  };

  const setTheme = (newColor) => {
    changeTheme(newColor);
    f7.setColorTheme(newColor);
    store.dispatch("changeUserData", {
      userNumber: store.state.currentUserNumber,
      item: "theme",
      value: newColor,
    });
    updateStatusBars();
  };

  const setLayout = (newLayout) => {
    if (newLayout == 'md') {
      setTheme(fixHexColor(theme));
    }
    store.dispatch("changeUserData", {
      userNumber: store.state.currentUserNumber,
      item: "layout",
      value: newLayout,
    });
    restartApp();
  }

  const changeName = () => {
    return () => {
      f7.dialog.prompt("Enter your new name", "Change Name", (name) => {
        store.dispatch("changeUserData", {
          userNumber: store.state.currentUserNumber,
          item: "name",
          value: name,
        });
        f7router.refreshPage();
      });
    };
  }

  const setAnim = (newAnim) => {
    changeAnim(newAnim);
    store.dispatch("changeUserData", {
      userNumber: store.state.currentUserNumber,
      item: "anim",
      value: newAnim,
    });
    restartApp();
  };
  const pickPfp = () => {
    return () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            store.dispatch("changeUserData", {
              userNumber: store.state.currentUserNumber,
              item: "pfp",
              value: e.target.result,
            });
            f7router.refreshPage();
          };
          reader.readAsDataURL(file);
        }
      };
      fileInput.click();
    }
  }

  const logout = () => {
    return () => {
      store.dispatch("removeUser", store.state.currentUser.username);
      f7.dialog.confirm("Are you sure you want to logout?", "Logout", () => {
        location.href = "/"
      });
    };
  }

  return (
    <Page name="settings">
      <Navbar large title="Settings" />
      <Card>
        <CardContent>
          <div className="profile-top display-flex align-items-center justify-content-center flex-direction-column">
            <img
              src={user.pfp}
              className="profile-image"
              style={{
                width: "50px",
                borderRadius: "50%",
                aspectRatio: "1/1",
                border: "4px solid var(--f7-theme-color)",
                marginBottom: 2,
              }}
            />
            <h2 className="no-padding no-margin">{user.name}</h2>
          </div>
          <p className="grid grid-cols-2 grid-gap" style={{ marginTop: 4 }}>
            <Button small tonal onClick={changeName()}>
              Change Name
            </Button>
            <Button small tonal onClick={pickPfp()}>
              Profile Picture
            </Button>
          </p>
        </CardContent>
      </Card>

      <BlockTitle className="settings-block-title">Appearance</BlockTitle>
      <Card>
        <CardContent padding={false}>
          <List className="appearance-settings">
            <ListInput
              outline
              type="colorpicker"
              placeholder="Color"
              label="Theme Color"
              value={{ hex: user.theme }}
              onColorPickerChange={(value) => setTheme(value.hex)}
              colorPickerParams={{
                modules: f7.theme === "md" ? ["hue-slider"] : ["wheel"],
                targetEl: ".wheel-picker-target",
              }}
              className="theme-color-picker"
            >
              <i
                slot="media"
                style={{
                  backgroundColor: `${theme}`,
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                }}
                className="icon demo-list-icon wheel-picker-target"
              />
            </ListInput>
            <ListItem
              link="#"
              className="no-chevron"
              onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}
            >
              <span>Dark Mode</span>
              <Toggle
                checked={scheme === "dark"}
                onToggleChange={() =>
                  setScheme(scheme === "dark" ? "light" : "dark")
                }
              />
            </ListItem>
            <ListItem
              title="App Theme"
              smartSelect
              smartSelectParams={{ openIn: "popover" }}
            >
              <select
                name="app-theme"
                onChange={(selection) => setLayout(selection.target.value)}
                value={f7.theme}
              >
                <option value="md">
                  Google
                </option>
                <option value="ios">
                  Apple
                </option>
              </select>
            </ListItem>
            <ListItem
              link="#"
              className="no-chevron"
              onClick={() => setAnim(!anim)}
            >
              <span>Display Animations</span>
              <Toggle
                checked={anim}
                onToggleChange={() =>
                  setAnim(!anim)
                }
              />
            </ListItem>
            {f7.theme == 'ios' && (
              <ListItem link="#" className="no-chevron"
                onClick={() => {
                  changeGroupLists(!groupLists);
                  store.dispatch("changeUserData",
                    {
                      userNumber: store.state.currentUserNumber,
                      item: "groupLists", value: !groupLists,
                    }
                  );
                  restartApp();
                }}
              >
                <Icon
                  slot="media"
                  ios="f7:list_bullet"
                  md="material:list"
                ></Icon>
                <span>Group Lists</span>
                <Toggle
                  checked={groupLists}
                  onToggleChange={() => {
                    changeGroupLists(!groupLists);
                    store.dispatch("changeUserData",
                      {
                        userNumber: store.state.currentUserNumber,
                        item: "groupLists", value: !groupLists,
                      }
                    );
                    restartApp();

                  }}
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>

      <BlockTitle className="settings-block-title">Accounts</BlockTitle>
      <Card>
        <CardContent>
          <List>
            <ListItem link="#" className="no-chevron"
              onClick={() => {
                changeBiometrics(!biometrics);
                store.dispatch("changeUserData",
                  {
                    userNumber: store.state.currentUserNumber,
                    item: "biometrics", value: !biometrics,
                  });
              }}
              disabled
            >
              <Icon
                slot="media"
                ios="material:fingerprint"
                md="material:fingerprint"
              ></Icon>
              <span>Require Biometrics</span>
              <Toggle
                disabled
                checked={biometrics}
                onToggleChange={() => {
                  changeBiometrics(!biometrics);
                  store.dispatch("changeUserData",
                    {
                      userNumber: store.state.currentUserNumber,
                      item: "biometrics", value: !biometrics,
                    });
                }}
              />
            </ListItem>
            <ListItem link="/settings/accounts/" className="">
              <Icon
                slot="media"
                ios="f7:person_circle"
                md="material:group"
              ></Icon>
              <span>Acount Manager</span>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <List dividers>
            <ListButton>Review</ListButton>
            <ListButton color="red" fill onClick={logout()}>
              Logout
            </ListButton>
          </List>
        </CardContent>
      </Card>
    </Page>
  );
};

export default SettingsPage;