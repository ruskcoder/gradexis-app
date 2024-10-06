import React, { useState } from 'react';
import { Page, Navbar, Subnavbar, Segmented, Button, List, ListItem, f7, Icon, CardHeader, CardContent } from 'framework7-react';
import { ClassGradeItem } from '../components/grades-item.jsx';
import { containerColor } from '../js/constants.jsx';

const GradesPage = ({ f7router }) => {
  const [activeButtonIndex, setActiveButtonIndex] = useState(0);

  const handleButtonClick = (index) => {
    setActiveButtonIndex(index);
  };

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

      {/* <Card link="#" className="grade" outlineIos>
        <CardHeader className='flex'>
        <div>
          <div style={{ fontWeight: 600, fontSize: 17, lineHeight: "20px" }}>
            {title}
          </div>
          <div style={{ fontSize: 14, lineHeight: "17px" }}>
            {subtitle}
          </div>
        </div>
        <div
          className='grades-number'
          style={{
            backgroundColor: "lightgreen",
            color: f7.darkMode ? "white" : "black",
          }}
        >
          {grade}
        </div>
      </CardHeader>
    </Card> */}

      <List dividersIos mediaList outlineIos strongIos className="gradesList no-chevron list-padding mod-list mt-fix"
        sortable
        sortableEnabled
        sortableTapHold
      >
        <ListItem link='/assignments/AP COMP SCI/'>
          <ClassGradeItem title={"AP COMP SCI"} subtitle={"Room 1610"} grade={97.84} />
        </ListItem>
        <ListItem link='#'>
          <ClassGradeItem title={"AP COMP SCI"} subtitle={"Room 1610"} grade={97.84} />
        </ListItem>
        <ListItem link='#'>
          <ClassGradeItem title={"AP COMP SCI"} subtitle={"Room 1610"} grade={97.84} />
        </ListItem>
      </List>
    </Page>
  );
};

export default GradesPage;