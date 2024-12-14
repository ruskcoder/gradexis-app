import {
  f7,
  Page,
  Block,
  LoginScreenTitle,
  List,
  Button,
  ListInput,
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
  const [link, setLink] = useState("homeaccess.katyisd.org");

  const [loginLoading, setLoginLoading] = useState(false);
  const signIn = () => {
    setLoginLoading(true);
    setLink(link.replace(/^(https?:\/\/)?([^/]+).*/, '$2'));
    store.dispatch("addUser", { username: username, password: password, link: "https://" + link, platform: platform }).then((result) => {
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
          tabindex={-1}
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
          placeholder=""
          value={link}
          onInput={(e) => setLink(e.target.value)}
          className="link-input"
          tabindex={-1}
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
