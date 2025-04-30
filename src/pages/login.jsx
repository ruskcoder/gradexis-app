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
  useStore
} from "framework7-react";
import React, { useState, useEffect } from "react";
import store from "../js/store";

const LoginPage = ({ f7router }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState("hac");
  const [useClasslink, setUseClasslink] = useState(false);
  const [classlink, setClasslink] = useState("");
  const [link, setLink] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);

  const signIn = () => {
    setLoginLoading(true);
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
        data.link = "homeaccess.katyisd.org";
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

  return (
    <Page loginScreen>
      <LoginScreenTitle>Login</LoginScreenTitle>
      <List form>
        <ListInput label="Platform" name="platform"
          type="select"
          outline
          value={platform}
          onChange={(e) => { setPlatform(e.target.value); setLink("") }}
          tabindex={-1}
        >
          <option value="hac">HAC</option>
        </ListInput>

        <ListItem checkbox className="classlink-sso"
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
            className="classlink-input"
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
            placeholder="homeaccess.katyisd.org"
            value={link}
            onInput={(e) => setLink(e.target.value)}
            className="link-input"
            tabindex={-1}
          >
          </ListInput>
        }

        <ListInput
          outline
          floatingLabel
          label="Username"
          type="text"
          name="username"
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
          value={password}
          onInput={(e) => setPassword(e.target.value)}
          clearButton
          tabindex={-1}
        ></ListInput>
      </List>
      <Block>
        <Button preloader loading={loginLoading} onClick={signIn} large fill>
          Login
        </Button>
      </Block>
      <List>
        <BlockFooter>
          Login information may be stored on this
          device.
        </BlockFooter>
      </List>
    </Page>
  )
};

export default LoginPage;
