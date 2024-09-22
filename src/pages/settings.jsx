import React from 'react';
import {
  Page,
  Navbar,
  List,
  Block,
  ListItem,
  Toggle,
  BlockTitle,
  Button,
  Card,
  CardContent,
} from 'framework7-react';

const SettingsPage = () => (
  <Page name="settings">
    <Navbar large title="Settings" />

    <BlockTitle>Strong Inset List</BlockTitle>
    <Card>
      <CardContent>
        <div className="profile-top display-flex align-items-center justify-content-center flex-direction-column">
          <img src="https://cdn.framework7.io/placeholder/people-160x160-1.jpg" className="profile-image"
          style={
            { width: '50px', borderRadius: '50%', aspectRatio: '1/1', border: '4px solid var(--f7-theme-color)', marginBottom: 2}
          }/>
          <h2 className='no-padding no-margin'>Vatsal Sharda</h2>
        </div>
        <p className="grid grid-cols-2 grid-gap" style={{marginTop: 4}}>
          <Button small fill>Change Name</Button>
          <Button small fill>Profile Picture</Button>
        </p>
      </CardContent>
    </Card>
    <BlockTitle>Large Buttons</BlockTitle>


    <Card>
      <CardContent padding={false}>
        <List>
          <ListItem link="#">Link 1</ListItem>
          <ListItem link="#">Link 2</ListItem>
          <ListItem link="#">Link 3</ListItem>
          <ListItem link="#">Link 4</ListItem>
          <ListItem link="#">Link 5</ListItem>
        </List>
      </CardContent>
    </Card>

  </Page>
);

export default SettingsPage;
