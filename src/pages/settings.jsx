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
  ListButton
} from "framework7-react";
import $ from "dom7";

var globalScheme;
var globalThemeColor;
var globalAppTheme;

const SettingsPage = () => {
  const [theme, changeScheme] = useState(globalScheme);
  const [themeColor, changeThemeColor] = useState(globalThemeColor);
  const [appTheme, changeAppTheme] = useState(globalThemeColor);

  useEffect(() => {
    f7ready(() => {
      const savedScheme = localStorage.getItem('theme');
      const savedThemeColor = localStorage.getItem('themeColor');
      const savedAppTheme = localStorage.getItem('appTheme');

      if (savedScheme) {
        changeScheme(savedScheme);
        f7.setDarkMode(savedScheme === "dark");
      } else {
        changeScheme($("html").hasClass("dark") ? "dark" : "light");
      }

      if (savedThemeColor) {
        changeThemeColor(savedThemeColor);
        f7.setColorTheme(savedThemeColor);
      } else {
        changeThemeColor($("html").css("--f7-color-primary").trim());
      }

      if (savedAppTheme) {
        changeAppTheme(savedAppTheme);
      } else {
        changeAppTheme($("html").hasClass("md") ? "md" : "ios");
      }
    });
  }, []);

  const setScheme = (newScheme) => {
    f7.setDarkMode(newScheme === "dark");
    globalScheme = newScheme;
    changeScheme(newScheme);
    localStorage.setItem('theme', newScheme);
  };

  const setCustomColor = (newColor) => {
    globalThemeColor = newColor;
    changeThemeColor(globalThemeColor);
    f7.setColorTheme(globalThemeColor);
    localStorage.setItem('themeColor', newColor);
  };

  const setAppTheme = (newAppTheme) => { 
    globalAppTheme = newAppTheme;
    changeAppTheme(globalAppTheme);
    localStorage.setItem('appTheme', newAppTheme);
    f7.dialog.alert("Please restart the app to apply the changes");
  }
  return (
    <Page name="settings">
      <Navbar large title="Settings" />
      <Card>
        <CardContent>
          <div className="profile-top display-flex align-items-center justify-content-center flex-direction-column">
            <img
              src="https://cdn.framework7.io/placeholder/people-160x160-1.jpg"
              className="profile-image"
              style={{
                width: "50px",
                borderRadius: "50%",
                aspectRatio: "1/1",
                border: "4px solid var(--f7-theme-color)",
                marginBottom: 2,
              }}
            />
            <h2 className="no-padding no-margin">Vatsal Sharda</h2>
          </div>
          <p className="grid grid-cols-2 grid-gap" style={{ marginTop: 4 }}>
            <Button small tonal>
              Change Name
            </Button>
            <Button small tonal>
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
              readonly
              label="Theme Color"
              value={{ hex: themeColor }}
              onColorPickerChange={(value) => setCustomColor(value.hex)}
              colorPickerParams={{
                modules: ["hue-slider"],
                targetEl: ".wheel-picker-target",
              }}
              className="theme-color-picker"
            >
              <i
                slot="media"
                style={{
                  backgroundColor: `${themeColor}`,
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
              onClick={() => setScheme(theme === "dark" ? "light" : "dark")}
            >
              <span>Dark Mode</span>
              <Toggle
                checked={theme === "dark"}
                onToggleChange={() =>
                  setScheme(theme === "dark" ? "light" : "dark")
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
                onChange={(selection) => setAppTheme(selection.target.value)}
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
          </List>
        </CardContent>
      </Card>

      <BlockTitle className="settings-block-title">Accounts</BlockTitle>
      <Card>
        <CardContent>
          <List>
            <ListItem link="#" className="no-chevron">
              <Icon
                slot="media"
                ios="material:fingerprint"
                md="material:fingerprint"
              ></Icon>
              <span>Require Biometrics</span>
              <Toggle checked={false} />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <List dividers>
            <ListButton>Review</ListButton>
            <ListButton color="red" fill>
              Logout
            </ListButton>
          </List>
        </CardContent>
      </Card>
    </Page>
  );
};

export default SettingsPage;