import React, { useState } from 'react';
import { Page, Navbar, Subnavbar, Segmented, Button, List, ListItem, f7, Preloader, CardHeader, Block, useStore } from 'framework7-react';
import { ClassGradeItem } from '../components/grades-item.jsx';
import { containerColor } from '../js/constants.jsx';
import { averages, assignments } from '../js/grades-api.js';
import store from '../js/store.js';
const GradesPage = ({ f7router }) => {
  const [activeButtonIndex, setActiveButtonIndex] = useState(0);
  const user = useStore('currentUser');
  const handleButtonClick = (index) => {
    setActiveButtonIndex(index);
  };
  const [loading, setLoading] = useState(true);
  const [classAverages, setAverages] = useState([]);

  // alert(JSON.stringify(user));
  if (user.username) {
    averages().then((data) => {
      setLoading(false);
      setAverages(data);
    })
    assignments().then((data) => {
      store.dispatch('setAssignments', data)
    })
  }
  return (
    <Page name="grades">
      <Navbar title="Grades">
        <Subnavbar sliding={true} >
          <Segmented strong>
            {[...Array(6)].map((_, index) => (
              <Button
                key={index}
                smallMd
                active={activeButtonIndex === index}
                onClick={() => handleButtonClick(index)}
              >
                {`MP${index + 1}`}
              </Button>
            ))}
          </Segmented>
        </Subnavbar>
      </Navbar>
      {loading && 
        <Block className='display-flex align-items-center justify-content-center'>
          <Preloader />
        </Block>
      }
      {!loading && 
        <List dividersIos mediaList outlineIos strongIos className="gradesList no-chevron list-padding mod-list mt-fix"
          sortable
          sortableEnabled
          sortableTapHold
        >
        {Object.entries(classAverages).map(([title, grade], index) => (
          <ListItem key={index} link={`/assignments/${title}/`}>
            <ClassGradeItem title={title} subtitle={""} grade={grade} />
          </ListItem>
        ))}
      </List>
      }
    </Page>
  );
};

export default GradesPage;