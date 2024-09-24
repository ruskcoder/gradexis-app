import React from 'react';
import { Page, Navbar, List, ListItem, Block, Button, useStore } from 'framework7-react';
import store from '../js/store';

const GpaPage = () => {
  const users = useStore('users');

  return (
    <Page name="catalog">
      <Navbar title="aasdasd" />
      <List strong dividersIos outlineIos insetMd>
        {users.map((user) => (
          <ListItem
            key={user.username}
            title={user.username}
            link={`/product/${user.username}/`}
          />
        ))}
      </List>
      <Block>
        <Button
          fill
          onClick={() =>
            store.dispatch("addUser", {
              username: "k2429602",
              password: "Kisd08232010",
              platform: "hac",
              link: 'https://homeaccess.katyisd.org'
            })
          }
        >
          Add Product
        </Button>
      </Block>
    </Page>
  );
};

export default GpaPage;
