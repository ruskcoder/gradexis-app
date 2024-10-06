import React, { useState } from 'react';
import { Page, Navbar, Block, Segmented, Button, Gauge, Card, List, ListItem, Icon } from 'framework7-react';
import terminal from 'virtual:terminal';
import { AssignmentGradeItem } from '../components/grades-item.jsx';

const AssignmentsPage = ({ f7router, ...props }) => {
  const [activeStrongButton, setActiveStrongButton] = useState(0);
  const [gaugeValue, setGaugeValue] = useState(0.5);

  return (
    <Page>
      <Navbar title={props.course} backLink="Back" />

      <Block className="margin-top margin-bottom" >
        <div style={{ display: "flex", flexWrap: "nowrap" }}>
          <Segmented strong tag="p" inset small className="no-margin no-padding" style={{ flex: "0 0 calc(66% - calc(var(--f7-typography-margin) / 2))" }}>
            <Button small active={activeStrongButton === 0} onClick={() => setActiveStrongButton(0)}>
              Grades
            </Button>
            <Button small active={activeStrongButton === 1} onClick={() => setActiveStrongButton(1)}>
              Analysis
            </Button>
          </Segmented>
          <Button small className="margin-left" tonal active={activeStrongButton === 2} onClick={() => setActiveStrongButton(2)} style={{ flex: "0 0 calc(34% - calc(var(--f7-typography-margin) / 2))" }}>
            What If
          </Button>
        </div>
        <div className="assignment-grade-container margin-top">
          <Card className="no-margin padding assignment-grade-item">
            <Gauge
              type="circle"
              value={gaugeValue}
              borderColor="#2196f3"
              borderWidth={20}
              valueText={`${gaugeValue * 100}`}
              valueFontSize={60}
              valueTextColor="#2196f3"
              labelText="Overall"
            />
          </Card>
          <div className="grade-categories assignment-grade-item">
            <Card className="no-margin grade-category-item">
              <h4 className="no-margin">Major</h4>
              <h1 className="no-margin category-number ">
                96.00
                <i
                  style={{
                    backgroundColor: `#ff00ff`,
                    width: "20px",
                    height: "20px",
                    borderRadius: "30%",
                  }}
                  className="icon demo-list-icon wheel-picker-target"
                />
              </h1>
            </Card>
            <Card className="no-margin grade-category-item">
              <h4 className="no-margin">Major</h4>
              <h1 className="no-margin category-number ">
                96.00
                <i
                  style={{
                    backgroundColor: `#ff00ff`,
                    width: "20px",
                    height: "20px",
                    borderRadius: "30%",
                  }}
                />
              </h1>
            </Card>
          </div>
          <Card className="no-margin padding assignment-grade-item">
            <Gauge
              type="circle"
              value={gaugeValue}
              borderColor="#2196f3"
              borderWidth={20}
              valueText={`${gaugeValue * 100}`}
              valueFontSize={60}
              valueTextColor="#2196f3"
              labelText="Overall"
            />
          </Card>
        </div>
      </Block>

      <List dividersIos mediaList outlineIos strongIos strong inset className="assignments-list no-chevron mod-list margin-top">
        <ListItem link='/assignments/AP COMP SCI/'>

          <AssignmentGradeItem name={"AP COMP SCI"} date={"15/12/2024"} grade={80.84} color={"magenta"} />
        </ListItem>
        <ListItem link='/assignments/AP COMP SCI/'>
          <AssignmentGradeItem name={"AP COMP SCI"} date={"15/12/2024"} grade={70.84} color={"green"} />
        </ListItem>
        <ListItem link='/assignments/AP COMP SCI/'>
          <AssignmentGradeItem name={"AP COMP SCI"} date={"15/12/2024"} grade={60.84} color={"orange"} />
        </ListItem><ListItem link='/assignments/AP COMP SCI/'>
          <AssignmentGradeItem name={"AP COMP SCI"} date={"15/12/2024"} grade={97.84} color={"skyblue"} />
        </ListItem>
      </List>
    </Page>
  )
}

export default AssignmentsPage;
