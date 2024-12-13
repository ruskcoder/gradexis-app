import React, { useEffect, useState, useMemo } from 'react';
import { Page, Navbar, Subnavbar, Segmented, Button, List, ListItem, f7, Preloader, CardHeader, Block, useStore } from 'framework7-react';
import { ClassGradeItem } from '../components/grades-item.jsx';
import { containerColor } from '../js/constants.jsx';
import store from '../js/store.js';
const GradesPage = ({ f7router }) => {
  const [activeButtonIndex, setActiveButtonIndex] = useState(-1);
  const user = useStore('currentUser');
  const [userChanged, setUserChanged] = useState(false);
  const termList = useMemo(() => ['MP1', 'MP2', 'MP3', 'MP4', 'MP5', 'MP6'], []);
  const [loadedAverages, setLoadedAverages] = useState({});

  const termChanged = (index) => {
    setUserChanged(true);
    setActiveButtonIndex(index);
    setLoading(true);
  };
  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(true);

  const createAverages = () => {
    return (Object.entries({}).map(([title, grade], index) => (
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
            {termList.map((_, index) => (
              <Button
                key={index}
                smallMd
                active={activeButtonIndex === index}
                onClick={() => termChanged(index)}
              >
                {termList[index]}
              </Button>
            ))}
          </Segmented>
        </Subnavbar>
      }
      {
        termList.map((_, index) => (
          (
            <div key={index} style={{ display: (!loading && activeButtonIndex === index) ? "block" : "none" }}>
              <List dividersIos mediaList outlineIos strongIos className="gradesList no-chevron list-padding mod-list mt-fix"
                sortable
                sortableEnabled
                sortableTapHold
              >
                {createAverages()}
              </List>
            </div>
          )
        ))
      }

      {!loading &&
        <>

        </>
      }
    </Page>
  );
};

export default GradesPage;