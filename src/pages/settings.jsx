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
import { terminal } from 'virtual:terminal'

const SettingsPage = ({ f7router }) => {
  const user = useStore('currentUser');
  const [theme, changeTheme] = useState(user.theme);
  const [scheme, changeScheme] = useState(user.scheme);

  const setScheme = (newScheme) => {
    changeScheme(newScheme);
    f7.setDarkMode(newScheme === "dark");
    store.dispatch("changeUserData", {
      userNumber: store.state.currentUserNumber,
      item: "scheme",
      value: newScheme,
    });
  };

  const setTheme = (newColor) => {
    changeTheme(newColor);
    f7.setColorTheme(newColor);
    store.dispatch("changeUserData", {
      userNumber: store.state.currentUserNumber,
      item: "theme",
      value: newColor,
    });
  };

  const setLayout = (newLayout) => { 
    store.dispatch("changeUserData", {
      userNumber: store.state.currentUserNumber,
      item: "layout",
      value: newLayout,
    });
    location.reload();
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
        location.reload()
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