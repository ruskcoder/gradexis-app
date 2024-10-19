import React, { useEffect, useState } from 'react';
import { Page, Navbar, Subnavbar, Segmented, Button, List, ListItem, f7, Preloader, CardHeader, Block, useStore } from 'framework7-react';
import { ClassGradeItem } from '../components/grades-item.jsx';
import { containerColor } from '../js/constants.jsx';
import { averages, assignments, ipr } from '../js/grades-api.js';
import store from '../js/store.js';
const GradesPage = ({ f7router }) => {
  const [activeButtonIndex, setActiveButtonIndex] = useState(0);
  const user = useStore('currentUser');
  const [userChanged, setUserChanged] = useState(false);
  const termChanged = (index) => {
    setUserChanged(true);
    setActiveButtonIndex(index);
    setLoading(true);
    averages(index + 1).then((data) => {
      if (!('success' in data)) {
        store.dispatch('setAverages', data);
        setLoading(false);
      }
    })
    assignments(undefined, index + 1).then((data) => {
      console.log(data)
      if (!('success' in data)) {
        console.log(data)
        store.dispatch('setAssignments', data);
      }
    })
  };
  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(true);
  const storeAverages = useStore('averages');
  const storeTerm = useStore('term');
  useEffect(() => {
    if (!userChanged) {
      if (storeAverages.length != 0) {
        if (storeTerm != 0) {
          setTermsLoading(false)
          setLoading(false);
          setActiveButtonIndex(storeTerm - 1);
        }
      }
    }
  }, [userChanged, storeAverages, storeTerm])

  const createAverages = () => {
    return (Object.entries(storeAverages).map(([title, grade], index) => (
      <ListItem key={index} link={grade != "" ? `/assignments/${title}/` : "#"}>
        <ClassGradeItem title={title} subtitle={""} grade={grade} />
      </ListItem>
    )))
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
          {[...Array(6)].map((_, index) => (
            <Button
              key={index}
              smallMd
              active={activeButtonIndex === index}
              onClick={() => termChanged(index)}
            >
              {`MP${index + 1}`}
            </Button>
          ))}
        </Segmented>
      </Subnavbar>
      }
      {!loading &&
        <>
          
          <List dividersIos mediaList outlineIos strongIos className="gradesList no-chevron list-padding mod-list mt-fix"
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