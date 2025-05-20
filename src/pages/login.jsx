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
  useStore,
  Searchbar,
  Subnavbar,
  Navbar,
  ListButton
} from "framework7-react";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from 'react-dom/client';
import store from "../js/store";

const LoginPage = ({ f7router }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState("hac");
  const [useClasslink, setUseClasslink] = useState(false);
  const [classlink, setClasslink] = useState("");
  const [link, setLink] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);
  const platformDefaults = {
    "hac": "homeaccess.katyisd.org",
    "powerschool": "hisdconnect.houstonisd.org"
  }
  const platformNames = {
    "hac": "HAC",
    "powerschool": "PowerSchool SIS"
  }
  const defaults = {
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

    setTimeout(() => {
      console.log(data)
      store.dispatch("addUser",
        data
      ).then((result) => {
        setLoginLoading(false)
        if (result) {
          f7.emit('login')
          f7router.back()
        }
      })
    }, 0);
  };
  const createPopup = () => {
    if (!popup.current) {
      const PopupContent = ({ callback }) => {
        return (
          <Page>
            <div className="navbar">
              <div className="navbar-inner">
                <div className="navbar-bg"></div>
                <div className="title margin-left">Districts</div>
                <div className="right">
                  <a className="link popup-close" onClick={() => popup.current.close()}>Close</a>
                </div>
              </div>
            </div>
            <div className="page-content no-margin no-padding" style={{ height: "100%" }}>
              <div className="block no-margin-top padding-top" style={{ height: "100%" }}>
                <Searchbar
                  searchContainer=".default-list"
                  searchIn=".item-title"
                  inline
                  className="searchbar-districts"
                />
                <List mediaList inset strong noChevron className="default-list no-margin margin-top searchbar-found">
                  {Object.keys(defaults).map((key) => (
                    <ListItem
                      key={key}
                      link="#"
                      title={key}
                      subtitle={defaults[key].classlink ? `launchpad.classlink.com/${defaults[key].link}`: defaults[key].link}
                      after={platformNames[defaults[key].platform]}
                      onClick={() => { callback(key); }}
                    />
                  ))}
                </List>
              </div>
            </div>
          </Page>
        );
      };
      const selectDistrict = (key) => {
        setPlatform(defaults[key].platform);
        setLink(defaults[key].link);
        setUseClasslink(defaults[key].classlink);
        setClasslink(defaults[key].classlink ? defaults[key].link : "");
        popup.current.close();
      }

      popup.current = f7.popup.create({
        content: `<div id="popup-districts" class="popup popup-districts"></div>`,
      });
      popup.current.open();

      const root = createRoot(document.getElementById('popup-districts'));
      root.render(
        <PopupContent callback={(key) => selectDistrict(key)} />
      );
      f7.searchbar.create({
        el: '.searchbar-districts',
        inputEl: '.searchbar-districts input',
        searchContainer: '.default-list',
        searchIn: '.item-title',
      });
    }
    else {
      popup.current.open();
    }
  };
  const onPageBeforeRemove = () => {
    // Destroy popup when page removed
    if (popup.current) popup.current.destroy();
  };
  const [popupOpened, setPopupOpened] = useState(false);
  const popup = useRef(null);

  return (
    <Page loginScreen onPageBeforeRemove={onPageBeforeRemove}>
      <LoginScreenTitle>Login</LoginScreenTitle>
      <List form className="login-form">
        <ListInput label="Platform" name="platform" className="platform-input"
          type="select"
          outline
          value={platform}
          onChange={(e) => { setPlatform(e.target.value); setLink("") }}
          tabindex={-1}
        >
          <option value="hac">HAC</option>
          <option value="powerschool">PowerSchool SIS</option>
        </ListInput>

        <ListItem checkbox className="classlink-sso" aria-label="ClasslinkOption"
          checked={useClasslink}
          onChange={(e) => { setUseClasslink(e.target.checked); setLink("") }}>
          Use ClassLink SSO Login
        </ListItem>

        {useClasslink &&
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
        {!useClasslink &&
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

        <li>
          <Block className="margin-bottom margin-top-half">
            <Button outline small onClick={createPopup}>
              Select District
            </Button>
          </Block>
          <hr />
        </li>
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
        >
          <div slot="right">hi</div>
        </ListInput>
      </List>
      <Block>
        <Button preloader loading={loginLoading} label="Login" aria-label="Login" onClick={signIn} large fill>
          Login
        </Button>
      </Block>
    </Page>
  )
};

export default LoginPage;
