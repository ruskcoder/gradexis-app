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
    const [loginLoading, setLoginLoading] = useState(false);
    const signIn = () => {
        setLoginLoading(true);
        store.dispatch("addUser", { username: username, password: password, link: "https://homeaccess.katyisd.org/", platform: "hac"}).then((result) => {
          setLoginLoading(false)
          if (result) {
            f7.emit('login')
            f7router.back()
          }
        })
      };

    return (
      <Page loginScreen>
        <LoginScreenTitle>Login</LoginScreenTitle>
        <List form>
          <ListInput
            outline
            floatingLabel
            label="Username"
            type="text"
            name="username"
            placeholder="Your username"
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
            className=""
          ></ListInput>
        </List>
        <Block>
          <Button preloader loading={loginLoading} onClick={signIn} large fill>
            Login
          </Button>
        </Block>
        <List>
          <ListItem></ListItem>
          <BlockFooter>
            Login information may be stored on this
            <br />
            device.
          </BlockFooter>
        </List>
      </Page>
  )
};

export default LoginPage;
