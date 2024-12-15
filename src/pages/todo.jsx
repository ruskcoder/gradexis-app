import React from 'react';
import { Page, Navbar, List, ListItem, Block, Button, useStore, f7 } from 'framework7-react';
import store from '../js/store';
import logo from '../assets/canvas-logo.png';
const TodoPage = ({ f7router }) => {
  const users = useStore('users');
  return (
    <Page name="todo">
      <Navbar title="Todo" />
      <Block>
        This todo list will link with google calendar and canvas!!!
        <Button outline disabled>
          <img src={logo} alt="Canvas Logo" style={{ width: '1.5em', marginRight: '0.5em' }} />
          Link with Canvas (coming soon!)
        </Button>
      </Block>
    </Page>
  );
};

export default TodoPage;
