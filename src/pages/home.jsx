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
import { OverviewItem, OverviewIcon } from '../components/overview-item.jsx';
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

      <List dividersIos mediaList outlineIos strongIos
        sortable
        // sortableEnabled
        className="overviewList mod-list mt-fix">
        <ListItem link="#">
          <OverviewIcon slot="media" iconIos="f7:calendar" iconMd='material:calendar_month' />
          <OverviewItem title="Attendance" subtitle="View your absences"></OverviewItem>
        </ListItem>
        <ListItem link="#">
          <OverviewIcon slot="media" iconIos="f7:bell_fill" iconMd='material:notifications' />
          <OverviewItem title="Bell Schedule" subtitle="Track periods and the bell"></OverviewItem>
        </ListItem>
        <ListItem link="#">
          <OverviewIcon slot="media" iconIos="f7:square_list_fill" iconMd='material:list_alt' />
          <OverviewItem title="Class Schedule" subtitle="View classes and course requests"></OverviewItem>
        </ListItem>
        <ListItem link="#">
          <OverviewIcon slot="media" iconIos="f7:at" iconMd='material:alternate_email' />
          <OverviewItem title="Contact Teachers" subtitle="View email your teachers"></OverviewItem>
        </ListItem>
        <ListItem link="#">
          <OverviewIcon slot="media" iconIos="f7:gauge" iconMd='material:speed' />
          <OverviewItem title="Progress Report" subtitle="View interim scores"></OverviewItem>
        </ListItem>
        <ListItem link="#">
          <OverviewIcon slot="media" iconIos="f7:doc_chart" iconMd='material:query_stats' />
          <OverviewItem title="Report Card" subtitle="View reporting period scores"></OverviewItem>
        </ListItem>
        <ListItem link="#">
          <OverviewIcon slot="media" iconIos="f7:checkmark_seal_fill" iconMd='material:verified' />
          <OverviewItem title="Transcript" subtitle="View your credits"></OverviewItem>
        </ListItem>
      </List>

    </Page>

  );
};

export default HomePage;

