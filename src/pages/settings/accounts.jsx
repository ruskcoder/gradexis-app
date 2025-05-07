import React, { useState, useEffect } from 'react';
import {
  Page,
  Navbar,
  Block,
  Button,
  Card,
  CardContent,
  f7,
  useStore
} from "framework7-react";
import store from "../../js/store.js";
import { primaryFromColor, updateRouter } from "../../components/app.jsx";

const AccountsPage = ({ f7router }) => {
  var users = useStore('users');
  updateRouter(f7router);
  const logout = (username) => {
    return () => {
      window.f7alert = f7.dialog.confirm("Are you sure you want to logout of this account?", "Logout", () => {
        if (store.state.currentUser.username == username) {
          store.dispatch("removeUser", username);
          location.href = "/";
        }
        else {
          store.dispatch("removeUser", username);
          f7router.refreshPage();
        }
        
      });
    } 
  }

  return (
    <Page name="settings">
      <Navbar small title="Accounts" backLink="Back"/>
      {
        users.map(function(user, index){
          return (
            <Card key={index}>
              <CardContent>
                  <div className='display-flex margin-bottom-half align-items-center'>
                      <img
                      src={user.pfp}
                      className="profile-image"
                      style={{
                        width: "50px",
                        borderRadius: "50%",
                        aspectRatio: "1/1",
                        border: `4px solid var(--f7-${user.layout}-primary)`,
                        marginBottom: 2,
                      }}
                    />
                    <div className='padding-left user-info'>
                      <p className="no-margin item-title">{user.name}</p>
                      <p className="no-margin item-subtitle">{user.username}</p>
                    </div>
                  </div>
                  <Button fill color="red" onClick={logout(user.username)}>
                    Logout
                  </Button>
              </CardContent>
            </Card>
          )
        })
      }
      <Block>
        <Button
            round
            fill
            onClick={() => {
              f7.dialog.confirm("Do you want to proceed to login?", "Confirmation", () => {
                f7router.navigate('/login/', {
                  props: {
                    onPopupClose: () => {
                      f7router.navigate('/settings/accounts/');
                    },
                  },
                });
              });
            }}
        >
          Add Account
        </Button>
      </Block>
    </Page>
  );
};

export default AccountsPage;