import React from 'react';
import { Page, Navbar, List, ListItem, Block, Button, useStore } from 'framework7-react';
import store from '../js/store';

const TodoPage = () => {
  const users = useStore('users');

  return (
    <Page name="todo">
      <Navbar title="Todo" />
    </Page>
  );
};

export default TodoPage;
