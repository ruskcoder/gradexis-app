import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, Segmented, Button, Gauge, Card, List, ListItem, useStore, f7, Preloader } from 'framework7-react';
import terminal from 'virtual:terminal';
import { AssignmentGradeItem } from '../components/grades-item.jsx';
import { createRoot } from 'react-dom/client';
import { primaryFromColor } from '../components/app.jsx';
import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import { assignments } from '../js/grades-api.js';
import store from '../js/store.js';
import { EffectCoverflow } from 'swiper/modules';

const AssignmentsPage = ({ f7router, ...props }) => {
  const [activeStrongButton, setActiveStrongButton] = useState(0);
  const user = useStore('currentUser');
  const gaugeBackgroundColor = (theme) => {
    return (
      hexFromArgb(themeFromSourceColor(argbFromHex(user.theme), []).schemes[user.scheme].secondaryContainer)
    )
  }
  const colorFromCategory = (category) => {
    category = category.toLowerCase();
    if (category == "major") {return "#9338db"}
    if (category == "minor") {return "#00de63"}
    if (category == "other") {return "#fa9917"}
    else {
      return `hsl(${Array.from(category).reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % 360}, 100%, 45%)`;
    }
  }
  const [storedAssignments, setStoredAssignments] = useState(store.state.assignments);
  const [loading, setLoading] = useState(storedAssignments.length === 0);
  const [currentAssignments, setCurrentAssignments] = useState(storedAssignments[props.course]);

  useEffect(() => {
    if (storedAssignments.length === 0) {
      setLoading(true);
      assignments().then((data) => {
        store.dispatch('setAssignments', data);
        const updatedAssignments = store.state.assignments;
        setStoredAssignments(updatedAssignments);
        setCurrentAssignments(updatedAssignments[props.course]);
        setLoading(false);
      });
    }
  }, [storedAssignments, props.course]);

  const infoDialog = (assignment) => {
    return () => {
      const container = document.createElement('div');
      Object.keys(assignment).forEach(key => {
        if (assignment[key] === "") {
          assignment[key] = "None";
        }
      });
      createRoot(container).render(
        <>
          <div className="assignment-info grid grid-cols-1 margin-top">
            <div>
              <p className="info-category-title">Category</p>
              <p className="info-category-data">{assignment.Category}</p>
            </div>
            {assignment.Date && 
              <div>
              <p className="info-category-title">Date</p>
              <p className="info-category-data">{assignment.Date}</p>
            </div>
            }
          </div>

          <div className="assignment-info last-info grid grid-cols-2 grid-gap">
            {assignment["Date Assigned"] &&
            <div>
              <p className="info-category-title">Date Assigned</p>
              <p className="info-category-data">{assignment["Date Assigned"]}</p>
            </div>
            }
            {assignment["Date Due"] &&
            <div>
              <p className="info-category-title">Date Due</p>
              <p className="info-category-data">{assignment["Date Due"]}</p>
            </div>
            }
            <div>
              <p className="info-category-title">Score</p>
              <p className="info-category-data">{`${assignment.Score} / ${assignment["Total Points"]}`}</p>
            </div>
            <div>
              <p className="info-category-title">Weighted Points</p>
              <p className="info-category-data">{`${(parseFloat(assignment["Weight"])*100).toPrecision(4)} / ${parseFloat(assignment["Weighted Total Points"]).toPrecision(4)}`}</p>
            </div>
            <div>
              <p className="info-category-title">Weight</p>
              <p className="info-category-data">{assignment.Weight}</p>
            </div>
            <div>
              <p className="info-category-title">Percentage</p>
              <p className="info-category-data">{assignment.Percentage}</p>
            </div>
          </div>
          <div className="assignment-info grid grid-cols-1 margin-top-half">
            {assignment['Average Score'] && 
              <div>
              <p className="info-category-title">Average Score</p>
              <p className="info-category-data">{assignment['Average Score']}</p>
            </div>
            }
          </div>
        </>
      );

      setTimeout(() => {
        f7.dialog.create({
          title: assignment.Assignment,
          closeByBackdropClick: true,
          cssClass: 'assignment-info-dialog',
          content: container.innerHTML,
        }).open();
      }, 0);
    }
  }

  const createAssignments = () => {
    var assignmentList = [];
    for (let i = 1; i < currentAssignments.assignments.length - 1; i++) {
      var currentAssignment = Object.fromEntries(
        currentAssignments.assignments[0].map((key, index) => [key, currentAssignments.assignments[i][index]])
      );
      assignmentList.push(
        <ListItem link='#' onClick={infoDialog(currentAssignment)} key={i}>
          <AssignmentGradeItem name={currentAssignment["Assignment"]} date={currentAssignment["Date Assigned"] ? currentAssignment["Date Assigned"] : (currentAssignment["Date Due"] ? currentAssignment["Date Due"] : "None")} grade={currentAssignment["Score"]} color={colorFromCategory(currentAssignment.Category)} />
        </ListItem>
      )
    }
    return assignmentList;
  }

  const categoryDialog = (category) => {
    return () => {
      const container = document.createElement('div');
      createRoot(container).render(
        <>
          <div className="assignment-info last-info grid grid-cols-2 grid-gap margin-top">
            <div>
              <p className="info-category-title">Weight</p>
              <p className="info-category-data">{category.CategoryWeight}</p>
            </div>
            <div>
              <p className="info-category-title">Percentage</p>
              <p className="info-category-data">{`${parseFloat(category.Percent.slice(0, -1)).toPrecision(3)}%`}</p>
            </div>
            <div>
              <p className="info-category-title">Weighted Points</p>
              <p className="info-category-data">{parseFloat(category.CategoryPoints).toPrecision(4)}</p>
            </div>
            <div>
              <p className="info-category-title">Points</p>
              <p className="info-category-data">{`${parseFloat(category.StudentsPoints).toPrecision(4)} / ${parseFloat(category.MaximumPoints).toPrecision(4)}`}</p>
            </div>
          </div>
        </>
      );

      setTimeout(() => {
        f7.dialog.create({
          title: category["Category"],
          closeByBackdropClick: true,
          cssClass: 'assignment-info-dialog',
          content: container.innerHTML,
        }).open();
      }, 0);
    }
  }

  const createCategories = () => {
    let categoryCards = []
    currentAssignments.categories[0] = currentAssignments.categories[0].map(item => item.replace(/[^a-z0-9]/gi, ''));
    for (let i = 1; i < currentAssignments.categories.length - 1; i++) {
      const currentCategory = Object.fromEntries(
        currentAssignments.categories[0].map((key, index) => [key, currentAssignments.categories[i][index]])
      );
      categoryCards.push(
        <div
          style={{ display: "contents", cursor: "pointer" }}
          onClick={categoryDialog(currentCategory)}
        >
          <Card className="no-margin grade-category-item">
            <h4 className="no-margin">{currentAssignments.categories[i][0]}</h4>
            <h1 className="no-margin category-number">
              {parseFloat(currentAssignments.categories[i][3].slice(0, -1)).toPrecision(4)}
              <i
                style={{
                  backgroundColor: `${colorFromCategory(currentAssignments.categories[i][0])}`,
                  width: '20px',
                  height: '20px',
                  borderRadius: '30%',
                }}
                className="icon demo-list-icon wheel-picker-target"
              />
            </h1>
          </Card>
        </div>
      )
    }
    let categoryDivs = [];
    for (let i = 0; i < categoryCards.length; i += 2) {
      categoryDivs.push(
        <div className="grade-categories assignment-grade-item" key={i}>
          {categoryCards[i]}
          {categoryCards[i + 1] ? categoryCards[i + 1] : ""}
        </div>
      );
    }
    return categoryDivs;
  }

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
        {loading &&
          <Block className='display-flex align-items-center justify-content-center'>
            <Preloader />
          </Block>
        }
        {!loading &&
          <div className="assignment-grade-container margin-top">
            <Card className="no-margin assignment-grade-item">
              <Gauge
                className="margin-half"
                type="circle"
                value={parseFloat(currentAssignments.average.slice(0, -1)) / 100}
                borderColor={primaryFromColor(user.theme)}
                borderBgColor={gaugeBackgroundColor(user.theme)}
                borderWidth={20}
                valueText={`${parseFloat(currentAssignments.average.slice(0, -1)).toPrecision(4)}`}
                valueFontSize={50}
                valueTextColor={primaryFromColor(user.theme)}
                labelText="Overall"
                labelFontSize={20}
              />
            </Card>
            {createCategories()}
          </div>
        }
      </Block>

      {!loading &&
      <List dividersIos mediaList strongIos strong inset className="assignments-list no-chevron mod-list margin-top">
        {createAssignments()}
      </List>
      }
    </Page>
  )
}

export default AssignmentsPage;