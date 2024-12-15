import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';
import { updateRouter } from '../../components/app';

const AttendancePage = ({ f7router }) => {
  updateRouter(f7router);
  return (
    <Page>
      <Navbar title="Attendance" backLink="Back" />
      <Block strong inset>
        hi
      </Block>
    </Page>
  )
}

export default AttendancePage;
