import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';
import { updateRouter } from '../../components/app';

const SchedulePage = ({ f7router}) => {
  updateRouter
  return (
    <Page>
      <Navbar title="Schedule" backLink="Back" />
      <Block strong inset>
        hi x2
      </Block>
    </Page>
  )
}

export default SchedulePage;
