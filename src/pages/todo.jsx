import React from 'react';
import { Page, Navbar, List, ListItem, Block, Button, useStore } from 'framework7-react';
import store from '../js/store';

const TodoPage = () => {
  const users = useStore('users');

  return (
    <Page name="todo">
      <Navbar title="Todo" />
      <Block>
        This todo list will link with google calendar and canvas!!!
        <Button outline disabled>
          <img src="./assets/canvas-logo.png" alt="Canvas Logo" style={{ width: '1.5em', marginRight: '0.5em' }} />
          Link with Canvas (coming soon!)
        </Button>
      </Block>
    </Page>
  );
};

export default TodoPage;
