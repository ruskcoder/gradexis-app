import React from 'react';
import {
  Page,
  Navbar,
  NavRight,
  Link,
  List,
  ListItem,
  NavTitle,
  NavTitleLarge,
  f7
} from 'framework7-react';
import OverviewIcon from '../components/overview-icon.jsx';
import { isMd } from '../components/app.jsx';

const HomePage = () => {
  
  return (
    <Page name="home"> 
      <Navbar large>
        <NavTitle>
          Overview
        </NavTitle>
        <NavTitleLarge>
          <div>
            Overview
            {/* <span className={`subtitle ${f7.theme === 'ios' ? 'bold' : 'bold'}`}>September 21, 2024</span> */}
            <span className="subtitle if-md">September 21, 2024</span>
            <span className="subtitle bold if-ios">September 21, 2024</span>

          </div>
          <div className="right">
            {/* <Link iconIos="f7:person_crop_circle" iconMd="material:account_circle" /> */}
          </div>
        </NavTitleLarge>
        <NavRight>
          <Link iconIos="f7:person_crop_circle" iconMd="material:account_circle" />
        </NavRight>
      </Navbar>

      <List dividersIos mediaList outlineIos strongIos className = {`${isMd ? "mt-list" : "mt-list"}`}>
        <ListItem link="#" title="Attendance" subtitle="View your absences">
          <OverviewIcon slot="media" iconIos="f7:calendar" iconMd='material:calendar_month' />
        </ListItem>
        <ListItem link="#" title="Bell Schedule" subtitle="Track periods and the bell">
          <OverviewIcon slot="media" iconIos="f7:bell_fill" iconMd='material:notifications' />
        </ListItem>
        <ListItem link="#" title="Class Schedule" subtitle="View classes and course requests">
          <OverviewIcon slot="media" iconIos="f7:square_list_fill" iconMd='material:list_alt' />
        </ListItem>
        <ListItem link="#" title="Contact Teachers" subtitle="View email your teachers">
          <OverviewIcon slot="media" iconIos="f7:at" iconMd='material:alternate_email' />
        </ListItem>
        <ListItem link="#" title="Progress Report" subtitle="View interim scores">
          <OverviewIcon slot="media" iconIos="f7:gauge" iconMd='material:speed' />
        </ListItem>
        <ListItem link="#" title="Report Card" subtitle="View reporting period scores">
          <OverviewIcon slot="media" iconIos="f7:doc_chart" iconMd='material:query_stats' />
        </ListItem>
        <ListItem link="#" title="Transcript" subtitle="View your credits">
          <OverviewIcon slot="media" iconIos="f7:checkmark_seal_fill" iconMd='material:verified' />
        </ListItem>
      </List>

    </Page>

  );
};

export default HomePage;

