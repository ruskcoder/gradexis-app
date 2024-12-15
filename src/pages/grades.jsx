import React, { useEffect, useState, useMemo } from 'react';
import { Page, Navbar, Subnavbar, Segmented, Button, List, ListItem, f7, Preloader, CardHeader, Block, useStore } from 'framework7-react';
import { ClassGradeItem } from '../components/grades-item.jsx';
import { containerColor } from '../js/constants.jsx';
import { errorDialog, initEmits } from '../components/app.jsx';
import { getClasses } from '../js/grades-api.js';

import store from '../js/store.js';
const GradesPage = ({ f7router }) => {
  // initEmits(f7, f7router);
  const user = useStore('currentUser');
  const classes = useStore('classes');
  const term = useStore('term');
  const termList = useStore('termList');
  useEffect(() => {
    if (term == -1) {
      setTermsLoading(true);
    }
    if (classes.length != 0) {
      setLoading(false);
      setActiveButtonIndex(termList.indexOf(term));
      setTermsLoading(false);
    }
  }, [classes, term, termList]);
  const [activeButtonIndex, setActiveButtonIndex] = useState(-1);

  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(true);
  const switchTerm = (index) => {
    setLoading(true);
    setActiveButtonIndex(index);
    getClasses(termList[index]).then((data) => {
      if (!('success' in data)) {
        store.dispatch('setClasses', data.classes);
        store.dispatch('setTerm', data.term);
      }
    }).catch(() => {errorDialog()})
  }
  const createAverages = () => {
    return classes.map(({ average, course, name }, index) => (
      <ListItem key={index} link={average !== "" ? `/grades/${name}/` : "#"}>
        <ClassGradeItem title={name} subtitle={course} grade={average} />
      </ListItem>
    ));
  }
  return (
    <Page name="grades">
      <Navbar title="Grades">

      </Navbar>
      {loading &&
        <Block className='display-flex align-items-center justify-content-center'>
          <Preloader />
        </Block>
      }

      {!termsLoading &&
        <Subnavbar sliding={true} >
          <Segmented strong>
            {termList.map((_, index) => (
              <Button
                key={index}
                smallMd
                active={activeButtonIndex === index}
                onClick={() => switchTerm(index)}
              >
                {termList[index]}
              </Button>
            ))}
          </Segmented>
        </Subnavbar>
      }

      {!loading &&
        <>
        <List dividersIos mediaList outlineIos strongIos className="gradesList no-chevron list-padding mod-list mt-fix no-handle"
            sortable
            sortableEnabled
            sortableTapHold
          >

            {createAverages()}

          </List>
        </>
      }
    </Page>
  );
};

export default GradesPage; 