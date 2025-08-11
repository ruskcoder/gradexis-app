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
import { apiUrl, login } from "../js/grades-api";
import ClasslinkLogo from "../assets/classlink-logo.png";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from "@hugotomazi/capacitor-navigation-bar";
import { InAppBrowser } from "@capgo/inappbrowser";
import { errorDialog } from "../components/app";

const LoginPage = ({ f7router, ...props }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [clSession, setCLSession] = useState("");
  const [platform, setPlatform] = useState("");
  const [district, setDistrict] = useState("");
  const [useClasslink, setUseClasslink] = useState(false);
  const [classlink, setClasslink] = useState("");
  const [link, setLink] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [reloginMode, setReloginMode] = useState(props.f7route.hash === "relogin");
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
      district: district,
      useClasslink: useClasslink,
      clsession: clSession,
    }
    if (useClasslink) {
      data.link = "";
      if (clSession == "") {
        f7.dialog.alert("Please log in with ClassLink first.", "Login Failed");
        setLoginLoading(false);
        return;
      }
    }
    else {
      data.clsession = "";
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
      if (!reloginMode) {
        store.dispatch("addUser",
          data
        ).then((result) => {
          setLoginLoading(false)
          if (result) {
            f7.emit('login');
            f7router.back();
          }
          else {
            setCLSession("")
            setPassword("")
          }
        })
      } else {
        store.dispatch('changeUserData', {
          item: "clsession",
          value: clSession
        });
        login(data).then((userData) => {
          if (userData.success == false) {
            f7.dialog.alert(userData.message, "Login Failed");
            setLoginLoading(false);
            setCLSession("");
            setPassword("");
          }
          else {
            f7.emit('login');
            f7.emit('refetch')
            f7router.back();
          }
        });
      }
    }, 0);
  };

  const [popupOpened, setPopupOpened] = useState(false);

  const selectDistrict = (key) => {
    if (key === "custom") {
      setCustomMode(true);
      setClasslink("");
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

  const loginClassLinkWebView = async () => {
    try {
      if (store.state.loggedInOnce) {
        await InAppBrowser.clearAllCookies()
      }

      await InAppBrowser.openWebView({
        url: "https://launchpad.classlink.com/" + (classlink ? classlink : ""),
        title: "Login With ClassLink",
        // toolbarType: "navigation",
        buttonNearDone: {
          ios: { iconType: 'asset', icon: "home.svg" },
          android: { iconType: 'asset', icon: "home.svg" }
        },
        closeModal: true,
        closeModalTitle: "Close Without Logging In",
        closeModalDescription: "Are you sure you want to close the browser without logging in?",
      });

      InAppBrowser.addListener('urlChangeEvent', async function (event) {
        if (event.url.includes('myapps.classlink.com')) {
          InAppBrowser.close();
          const cookies = await InAppBrowser.getCookies({
            url: 'https://myapps.classlink.com/',
            includeHttpOnly: true,
          });
          setCLSession(cookies.clsession);
          store.state.loggedInOnce = true;
        }
      });

      InAppBrowser.addListener('buttonNearDoneClick', async function (event) {
        await InAppBrowser.clearAllCookies()
        await InAppBrowser.executeScript({
          code: "window.location.href = 'https://launchpad.classlink.com/'"
        });
      });

    } catch (error) {
      alert('Failed to open Login: ' + error.message);
    }
  };

  const classlinkLogin = async () => {
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      await loginClassLinkWebView();
    } else {
      window.open('/classlink-signin.html');
      const storageHandler = (e) => {
        if (e.key === "clsession") {
          const clsession = e.newValue;
          localStorage.removeItem("clsession");
          if (clsession) {
            setCLSession(clsession);
            f7.dialog.alert("Successfully logged in with ClassLink!", "Login Successful");
            window.removeEventListener('storage', storageHandler);
          }
        }
      };
      window.addEventListener('storage', storageHandler);
    }

    // const ssoUrl = `${apiUrl}/auth/classlink/`;
    // const ssoUrl = "https://launchpad.classlink.com/"
    // const popup = window.open(ssoUrl, '_blank', 'width=600,height=700');
    // const handler = (event) => {
    //   if (event.data && event.data.type === 'classlink-auth') {
    //     window.removeEventListener('message', handler);
    //     setCLSession(event.data.access_token);
    //     console.log("Received ClassLink access token:", event.data.access_token);
    //   }
    // };
    // window.addEventListener('message', handler);
  }

  useEffect(() => {
    localStorage.removeItem("clsession");
    if (props.f7route.hash == "relogin") {
      let user = store.state.currentUser
      setReloginMode(true);
      setDistrict(user.district ? user.district : "Unknown District");
      setLink(user.link ? user.link.replace('https://', '').replace('/', "") : "Unknown Link");
      setPlatform(user.platform);
      setUseClasslink(user.useClasslink);
    }
    // let newColor = store.state.currentUser.scheme == "dark" ? "#1b1b1f" : "#d9eeff";
    // await StatusBar.setStyle({ style: store.state.currentUser.scheme == "dark" ? Style.Dark : Style.Light });
    // await StatusBar.setBackgroundColor({ color: newColor });
    // await NavigationBar.setColor({ color: newColor, darkButtons: store.state.currentUser.scheme == "light" });
    // await StatusBar.setOverlaysWebView({ overlay: false });
    // await StatusBar.show();

    const params = new URLSearchParams(window.location.search);
    if (params.get("district")) {
      const district = params.get("district");
      if (presets[district]) {
        selectDistrict(district);
      }
    }
  }, []);

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

      {!reloginMode && <Block className="margin-bottom margin-top-half">
        <Button className={"select-button"} color={f7.theme == "ios" ? "blue" : ""} outline small onClick={() => { setPopupOpened(true); }}>
          Select District
        </Button>
      </Block>}

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

      {!customMode && <List mediaList inset strong noChevron className="margin preview-district">
        <ListItem
          link=""
          title={district || "Select a district"}
          subtitle={useClasslink && !reloginMode ? "launchpad.classlink.com/" + classlink : link}
          after={platformNames[platform]}
        />
      </List>}

      {useClasslink &&
        <Button outline className="select-button margin" onClick={classlinkLogin} disabled={clSession !== ""}>
          <img src={ClasslinkLogo} alt="ClassLink Logo" className="classlink-logo margin-right-half" style={{ height: "80%" }} />
          Login with ClassLink
        </Button>
      }
      {!useClasslink && <List form className={`login-form margin-top-half margin-bottom ${platform == "demo" ? "display-none" : ""}`}>
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
      </List>}

      <Button preloader
        loading={loginLoading}
        label="Login" aria-label="Login"
        onClick={signIn} large fill
        disabled={loginLoading || platform === "" || (platform !== "demo" && !useClasslink && (username === "" || password === "")) || (useClasslink && clSession === "")}
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
