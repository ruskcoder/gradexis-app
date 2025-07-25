import React, { useEffect } from 'react';
import {
  Page,
  Navbar,
  NavRight,
  Link,
  List,
  ListItem,
  NavTitle,
  NavTitleLarge,
  Button,
  f7,
  f7ready,
  useStore
} from 'framework7-react';
import { OverviewItem, OverviewIcon } from '../components/overview-item.jsx';
import store from '../js/store.js';
import { primaryFromColor, errorDialog, updateRouter } from '../components/app.jsx';
import { createRoot } from 'react-dom/client';
import { getClasses } from '../js/grades-api.js';
const HomePage = ({ f7router }) => {
  updateRouter(f7router);
  const users = useStore('users');
  const user = useStore('currentUser');

  const switchAccount = () => {
    return () => {
      var chooseList = []
      const container = document.createElement('div');
      createRoot(container).render(
        <>
          <List dividersIos simpleList>
            <ListItem title="Item 1" />
            <ListItem title="Item 2" />
            <ListItem title="Item 3" />
          </List>
        </>
      )
      for (const user of users) {
        const isCurrentUser = user.username === store.state.currentUser.username;
        chooseList.push(`
        <li class="media-item">
            <a class="item-link dialog-close-button ${isCurrentUser ? 'current-user' : ''}" onclick="window.pickAccount('${user.username}')">
              <div class="item-content">
                <div class="item-media">
                  <img slot="media" src=${user.pfp} 
                  style="
                    width: 44px;
                    border-radius: 50%;
                    aspect-ratio: 1/1;
                    border: 4px solid ${user.theme};
                  ">
                </div>
                <div class="item-inner" style="
                  display: flex;
                  flex-direction: column;
                  align-items: start;
                  justify-content: center;  
                ">
                  <div>
                    <div class="item-title-row">
                      <div class="item-title">${user.name}</div>
                    </div>
                    <div class="item-subtitle" style="text-align: left">${user.username}</div>
                  </div>
                </div>
              </div>
            </a>
          </li>
      `);
      }
      var accountPicker;
      setTimeout(() => {
        accountPicker = f7.dialog.create({
          title: "Account Switcher",
          cssClass: 'account-switcher',
          closeByBackdropClick: true,
          // content: container.outerHTML
          content: `
            <ul class="list" style="list-style: none; padding: 0">
              ${chooseList.join('')}
            </ul>
            <button class="button button-fill margin" onclick="window.accountsPage()"
              style="width: calc(100% - var(--f7-typography-margin) * 2);"
            >
              Add Account
            </button>
          `
        })
        accountPicker.open()
        window.f7alert = accountPicker;
        window.accountsPage = () => {
          accountPicker.close();
          f7router.navigate('/settings/accounts/');
        }
        window.pickAccount = (username) => {
          store.dispatch('switchUser', users.findIndex((user) => user.username === username))
          accountPicker.close();
          f7.emit('userChanged')
          f7router.refreshPage()
          if (store.state.currentUser.layout !== f7.theme) {
            location.href = "/"
          }
        }
      }, 0)
    }
  }

  const today = (`${new Date().toLocaleString("en-US", { month: "long" })} ${new Date().getDate()}, ${new Date().getFullYear()}`);
  return (
    <Page name="home">
      <Navbar large>
        <NavTitle>Overview</NavTitle>
        <NavTitleLarge>
          <div>
            Overview
            <span className="subtitle if-md">{today}</span>
            <span className="subtitle bold if-ios">{today}</span>
          </div>
          <div className="right">
            {/* <Link iconIos="f7:person_crop_circle" iconMd="material:account_circle" /> */}
          </div>
        </NavTitleLarge>
        <NavRight>
          <Link
            iconIos="f7:person_crop_circle"
            iconMd="material:account_circle"
            onClick={switchAccount()}
          />
        </NavRight>
      </Navbar>
      <List
        mediaList
        dividersIos={user.groupLists == true}
        outlineIos={user.groupLists == true}
        strongIos={user.groupLists == true}
        chevronCenter
        // sortable
        // sortableEnabled
        className={`overviewList mod-list mt-fix ${user.groupLists == true ? "" : "iosRound"}`}
      >
        <ListItem
          link="/info/attendance/"
          aria-label="GoToAttendance">
          <OverviewIcon
            slot="media"
            iconIos="f7:calendar"
            iconMd="material:calendar_month"
          />
          <OverviewItem
            title="Calendar & Attendance"
            subtitle="View your absences and calendar"
          ></OverviewItem>
        </ListItem>
        <ListItem link="/info/schedule/"
          aria-label="GoToSchedule">
          <OverviewIcon
            slot="media"
            iconIos="f7:square_list_fill"
            iconMd="material:list_alt"
          />
          <OverviewItem
            title="Class Schedule"
            subtitle="View classes and course requests"
          ></OverviewItem>
        </ListItem>
        <ListItem link="/info/teachers/"
          aria-label="GoToTeachers">
          <OverviewIcon
            slot="media"
            iconIos="f7:at"
            iconMd="material:alternate_email"
          />
          <OverviewItem
            title="Contact Teachers"
            subtitle="Email your teachers"
          ></OverviewItem>
        </ListItem>
        <ListItem link="/info/ipr/"
          aria-label="GoToProgressReport">
          <OverviewIcon
            slot="media"
            iconIos="f7:gauge"
            iconMd="material:speed"
          />
          <OverviewItem
            title="Progress Report"
            subtitle="View interim scores"
          ></OverviewItem>
        </ListItem>
        <ListItem link="/info/reportCard/"
          aria-label="GoToReportCard">
          <OverviewIcon
            slot="media"
            iconIos="f7:doc_chart"
            iconMd="material:query_stats"
          />
          <OverviewItem
            title="Report Card"
            subtitle="View reporting period scores"
          ></OverviewItem>
        </ListItem>
        <ListItem link="/info/transcript/"
          aria-label="GoToTranscript">
          <OverviewIcon
            slot="media"
            iconIos="f7:checkmark_seal_fill"
            iconMd="material:verified"
          />
          <OverviewItem
            title="Transcript"
            subtitle="View your credits"
          ></OverviewItem>
        </ListItem>
      </List>
    </Page>
  );
};

export default HomePage;

