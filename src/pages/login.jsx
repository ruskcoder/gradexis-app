import {
  f7,
  Page,
  Block,
  LoginScreenTitle,
  List,
  Button,
  ListInput,
  BlockFooter,
  ListItem,
  Checkbox,
  Icon,
  Link,
  Searchbar,
  Popup,
  Navbar,
  NavRight
} from "framework7-react";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from 'react-dom/client';
import store from "../js/store";

const LoginPage = ({ f7router }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState("");
  const [district, setDistrict] = useState("");
  const [useClasslink, setUseClasslink] = useState(false);
  const [classlink, setClasslink] = useState("");
  const [link, setLink] = useState("");
  const [customMode, setCustomMode] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);
  const platformDefaults = {
    "hac": "homeaccess.katyisd.org",
    "powerschool": "hisdconnect.houstonisd.org",
    "demo": "demo.gradexis.com"
  }
  const platformNames = {
    "hac": "HAC",
    "powerschool": "PowerSchool SIS",
    "demo": "Demo Platform"
  }
  const presets = {
    "Katy ISD": { platform: "hac", link: "homeaccess.katyisd.org", classlink: false },
    "Houston ISD": { platform: "powerschool", link: "hisdconnect.houstonisd.org", classlink: false },
    "Cypress-Fairbanks ISD": { platform: "hac", link: "home-access.cfisd.net", classlink: false },
    "Conroe ISD": { platform: "hac", link: "conroeisd", classlink: true },
  }

  const signIn = () => {
    setLoginLoading(true);
    const existingUser = store.state.users.find(user => user.username === username);
    if (existingUser) {
      f7.dialog.alert("This account already exists.", "Login Failed", () => {
        try {
          f7router.back();
        }
        catch (error) {
          /* Do nothing since this shouldn't happen */
        }
      });
      setLoginLoading(false);
      return;
    }
    let data = {
      username: username,
      password: password,
      link: link,
      platform: platform,
      useClasslink: useClasslink,
      classlink: classlink,
    }
    if (useClasslink) {
      data.link = "";
      if (classlink == "") {
        data.classlink = "katyisd";
      }
    }
    else {
      data.classlink = "";
      if (link === "") {
        data.link = platformDefaults[platform];
      }
      data.link = 'https://' + data.link.replace(/^(https?:\/\/)?([^/]+).*/, '$2') + "/";
    }

    if (data.platform == "demo") {
      data.username = "demo";
      data.password = "demo";
    }

    setTimeout(() => {
      console.log(data)
      store.dispatch("addUser",
        data
      ).then((result) => {
        setLoginLoading(false)
        if (result) {
          f7.emit('login');
          f7router.back();
        }
      })
    }, 0);
  };

  const [popupOpened, setPopupOpened] = useState(false);

  const selectDistrict = (key) => {
    if (key === "custom") {
      setCustomMode(true);
    }
    else if (key === "demo") {
      setCustomMode(false);
      setDistrict("Demo Platform");
      setPlatform("demo");
      setLink("demo.gradexis.com");
      setUseClasslink(false);
      setClasslink("");
    }
    else {
      setCustomMode(false);
      setDistrict(key);
      setPlatform(presets[key].platform);
      setLink(presets[key].link);
      setUseClasslink(presets[key].classlink);
      setClasslink(presets[key].classlink ? presets[key].link : "");
    }
    setPopupOpened(false);
  }

  f7.searchbar.create({
    el: '.searchbar-districts',
    inputEl: '.searchbar-districts input',
    searchContainer: '.default-list',
    searchIn: '.item-title',
  });

  return (
    <Page className="login-page" dark={false}>
      <LoginScreenTitle>
        Gradexis
      </LoginScreenTitle>
      {customMode && <List className="no-margin-top no-margin-bottom login-form">
        <ListInput label="Platform" name="platform" className="platform-input"
          type="select"
          outline
          value={platform}
          onChange={(e) => { setPlatform(e.target.value); setLink(""); if (e.target.value === "demo") { selectDistrict("demo"); } }}
          tabindex={-1}
        >
          {Object.keys(platformNames).map((key) => (
            <option key={key} value={key}>{platformNames[key]}</option>
          ))}
        </ListInput>

        {platform !== "demo" && <ListItem checkbox className="classlink-sso" aria-label="ClasslinkOption"
          checked={useClasslink}
          onChange={(e) => { setUseClasslink(e.target.checked); setLink("") }}>
          Use ClassLink SSO Login
        </ListItem>
        }

        {platform !== "demo" && useClasslink &&
          <ListInput
            outline
            label="ClassLink Link"
            type="text"
            name="classlink"
            placeholder="katyisd"
            value={classlink}
            onInput={(e) => setClasslink(e.target.value)}
            className="classlink-input link-input"
            tabindex={-1}
          >
          </ListInput>
        }
        {platform !== "demo" && !useClasslink &&
          <ListInput
            outline
            label="Link"
            type="text"
            name="link"
            placeholder={
              platformDefaults[platform]
            }
            value={link}
            onInput={(e) => setLink(e.target.value)}
            className="link-input"
            tabindex={-1}
          >
          </ListInput>
        }

      </List>}

      <Block className="margin-bottom margin-top-half">
        <Button className={"select-button"} color={f7.theme == "ios" ? "blue" : ""} outline small onClick={() => { setPopupOpened(true); }}>
          Select District
        </Button>
      </Block>

      {!customMode && <List mediaList inset strong noChevron className="default-list margin preview-district">
        <ListItem
          link=""
          title={district || "Select a district"}
          subtitle={useClasslink ? classlink : link}
          after={platformNames[platform]}
        />
      </List>}

      <List form className={`login-form margin-top-half margin-bottom ${platform == "demo" ? "display-none" : ""}`}>
        <ListInput
          outline
          floatingLabel
          label="Username"
          type="text"
          name="username"
          aria-label="EnterUsername"
          placeholder="Username"
          value={username}
          onInput={(e) => setUsername(e.target.value)}
          tabindex={-1}
        ></ListInput>
        <ListInput
          outline
          floatingLabel
          label="Password"
          type="password"
          name="password"
          placeholder="Password"
          aria-label="EnterPassword"
          value={password}
          onInput={(e) => setPassword(e.target.value)}
          tabindex={-1}
        ></ListInput>
      </List>

      <Button preloader
        loading={loginLoading}
        label="Login" aria-label="Login"
        onClick={signIn} large fill
        disabled={loginLoading || platform === "" || (platform !== "demo" && (username === "" || password === ""))}
        className="margin no-margin-top login-btn"
        color={f7.theme == "ios" ? "blue" : ""}
      >
        Login
      </Button>
      <Popup
        className="demo-popup"
        opened={popupOpened}
        onPopupClosed={() => setPopupOpened(false)}
      >
        <Page colorTheme="blue">
          <Navbar title="Select District">
            <NavRight>
              <Link popupClose>Close</Link>
            </NavRight>
          </Navbar>
          <Block className="no-margin-top no-margin-bottom padding-top" style={{ height: "100%" }}>
            <Searchbar
              searchContainer=".default-list"
              searchIn=".item-title"
              inline
              className="searchbar-districts"
            />
            <List mediaList inset strong noChevron className="default-list no-margin margin-top">
              <ListItem
                link="#"
                title={"Custom"}
                subtitle={"https://"}
                after={"Custom"}
                onClick={() => { selectDistrict("custom"); }}
              />
              <ListItem
                link="#"
                title={"Demo Platform"}
                subtitle={"https://demo.gradexis.com/"}
                after={"Demo"}
                onClick={() => { selectDistrict("demo"); }}
              />
            </List>

            <List mediaList inset strong noChevron className="default-list no-margin margin-top searchbar-found">
              {Object.keys(presets).map((key) => (
                <ListItem
                  key={key}
                  link="#"
                  title={key}
                  subtitle={presets[key].classlink ? `launchpad.classlink.com/${presets[key].link}` : presets[key].link}
                  after={platformNames[presets[key].platform]}
                  onClick={() => { selectDistrict(key); }}
                />
              ))}
            </List>
          </Block>
        </Page>
      </Popup>
    </Page>
  )
};

export default LoginPage;
