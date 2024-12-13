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
import React, { useState, useEffect } from "react";
import { terminal } from 'virtual:terminal'
import store from "../js/store";

const LoginPage = ({ f7router }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState("hac");
  const [link, setLink] = useState("https://homeaccess.katyisd.org/");

  const [loginLoading, setLoginLoading] = useState(false);
  const signIn = () => {
    setLoginLoading(true);
    store.dispatch("addUser", { username: username, password: password, link: link, platform: platform }).then((result) => {
      setLoginLoading(false)
      if (result) {
        f7.emit('login')
        f7router.back()
      }
    })
  };

  return (
    <Page loginScreen>
      <div style={{height: "40px"}}></div>
      <LoginScreenTitle>Login</LoginScreenTitle>
      <List form>
        <ListInput label="Platform" name="platform" 
          type="select"
          outline
          value={platform}
          onChange={(e) => {setPlatform(e.target.value); setLink("")}}
        >
          <option value="hac">HAC</option>
          <option value="powerschool">PowerSchool SIS</option>
        </ListInput>

        <ListInput
          outline
          floatingLabel
          label="Link"
          type="text"
          name="link"
          placeholder="Type link here..."
          value={link}
          onInput={(e) => setLink(e.target.value)}
        >
        </ListInput>

        <ListInput
          outline
          floatingLabel
          label="Username"
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onInput={(e) => setUsername(e.target.value)}
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
