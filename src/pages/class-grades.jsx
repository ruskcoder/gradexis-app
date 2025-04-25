import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, Segmented, Button, Gauge, Card, List, ListItem, useStore, f7, Preloader } from 'framework7-react';
import { AssignmentGradeItem } from '../components/grades-item.jsx';
import { createRoot } from 'react-dom/client';
import { errorDialog, primaryFromColor, updateRouter, roundGrade } from '../components/app.jsx';
import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import { getGrades } from '../js/grades-api.js';
import store from '../js/store.js';

export const colorFromCategory = (category) => {
  category = category.toLowerCase();
  if (category == "major") { return "#9338db" }
  if (category == "minor") { return "#00de63" }
  if (category == "other") { return "#fa9917" }
  else {
    return `hsl(${Array.from(category).reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % 360}, 100%, 45%)`;
  }
}
export const gaugeBackgroundColor = (user) => {
  return (
    hexFromArgb(themeFromSourceColor(argbFromHex(user.theme), []).schemes[user.scheme].secondaryContainer)
  )
}
const ClassGradesPage = ({ f7router, ...props }) => {
  const [activeStrongButton, setActiveStrongButton] = useState(0);
  const user = useStore('currentUser');

  updateRouter(f7router);

  useEffect(() => {
   if (user.username) {
      if (!user.scoresIncluded) {
        getGrades(props.course).then((data) => {
          if (data.success != false) {
            setScores(data.assignments);
            setCategories(data.categories);
            setAverage(data.average.slice(0, -1));
            setLoading(false);
          }
          else {
            errorDialog(data.message);
          }
        }).catch(() => { errorDialog() })
      }
      else {
        setLoading(false);
        setScores(user.gradelist[user.term][props.course].scores);
        setCategories(user.gradelist[user.term][props.course].categories);
        setAverage(user.gradelist[user.term][props.course].average.slice(0, -1));
      }
    }
  }, [user.username, user.gradelist, user.term, props.course]);


  const [scores, setScores] = useState([]);
  const [categories, setCategories] = useState({});
  const [average, setAverage] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.anim != false) {
      const targetValue = average;
      let currentValue = 0;
      const step = targetValue / 17;
      const interval = setInterval(() => {
        currentValue += step;
        if (currentValue >= targetValue) {
          currentValue = parseFloat(targetValue);
          clearInterval(interval);
        }
        setAnimatedValue(currentValue);
      }, 5);
      return () => clearInterval(interval);
    }
  }, [average, user.anim]);

  const infoDialog = (assignment) => {
    return () => {
      assignment = { ...assignment };
      const container = document.createElement('div');
      Object.keys(assignment).forEach(key => {
        if (assignment[key] === "") {
          assignment[key] = "None";
        }
      });
      createRoot(container).render(
        <>
          <div className="extra-info grid grid-cols-1 margin-top">
            <div>
              <p className="info-category-title">Category</p>
              <p className="info-category-data">{assignment.category}</p>
            </div>
            {assignment.date &&
              <div>
                <p className="info-category-title">Date</p>
                <p className="info-category-data">{assignment.date}</p>
              </div>
            }
          </div>

          <div className="extra-info last-info grid grid-cols-2 grid-gap">
            {assignment["dateAssigned"] &&
              <div>
                <p className="info-category-title">Date Assigned</p>
                <p className="info-category-data">{assignment["dateAssigned"]}</p>
              </div>
            }
            {assignment["dateDue"] &&
              <div>
                <p className="info-category-title">Date Due</p>
                <p className="info-category-data">{assignment["dateDue"]}</p>
              </div>
            }
            <div>
              <p className="info-category-title">Score</p>
              <p className="info-category-data">{`${assignment.score} / ${assignment.totalPoints}`}</p>
            </div>
            <div>
              <p className="info-category-title">Weighted Points</p>
              <p className="info-category-data">{`${(parseFloat(assignment.weightedScore)).toPrecision(4)} / ${parseFloat(assignment.weightedTotalPoints).toPrecision(4)}`}</p>
            </div>
            <div>
              <p className="info-category-title">Weight</p>
              <p className="info-category-data">{assignment.weight}</p>
            </div>
            <div>

              <p className="info-category-title">Percentage</p>
              <p className="info-category-data">{assignment.percentage}</p>
            </div>
          </div>
          <div className="extra-info grid grid-cols-1 margin-top-half">
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
        window.f7alert = f7.dialog.create({
          title: assignment.name,
          closeByBackdropClick: true,
          cssClass: 'extra-info-dialog',
          content: container.innerHTML,
        })
        window.f7alert.open();
      }, 0);
    }
  };

  const createGrades = () => {
    var assignmentList = [];
    scores.forEach((assignment, i) => {
      assignmentList.push(
        <ListItem link='#' onClick={infoDialog(assignment)} key={i}>
          <AssignmentGradeItem
            name={assignment.name}
            date={assignment.dateAssigned ? assignment.dateAssigned : (assignment.dateDue ? assignment.dateDue : "None")}
            grade={assignment.percentage.slice(0, -1)}
            color={colorFromCategory(assignment.category)}
            badges={assignment.badges}
          />
        </ListItem>
      )
    });
    return assignmentList;
  }

  const categoryDialog = (category) => {
    return () => {
      const container = document.createElement('div');
      createRoot(container).render(
        <>
          <div className="extra-info last-info grid grid-cols-2 grid-gap margin-top">
            <div>
              <p className="info-category-title">Weight</p>
              <p className="info-category-data">{category.categoryWeight}</p>
            </div>
            <div>
              <p className="info-category-title">Percentage</p>
              <p className="info-category-data">{`${parseFloat(category.percent.slice(0, -1)).toPrecision(3)}%`}</p>
            </div>
            <div>
              <p className="info-category-title">Weighted Points</p>
              <p className="info-category-data">{parseFloat(category.categoryPoints).toPrecision(4)}</p>
            </div>
            <div>
              <p className="info-category-title">Points</p>
              <p className="info-category-data">{`${parseFloat(category.studentsPoints).toPrecision(4)} / ${parseFloat(category.maximumPoints).toPrecision(4)}`}</p>
            </div>
          </div>
        </>
      );

      setTimeout(() => {
        f7.dialog.create({
          title: category.name,
          closeByBackdropClick: true,
          cssClass: 'extra-info-dialog',
          content: container.innerHTML,
        }).open();
      }, 0);
    }
  }

  const createCategories = () => {
    let categoryCards = []

    for (let category of Object.keys(categories)) {
      categoryCards.push(
        <div
          style={{ display: "contents", cursor: "pointer" }}
          onClick={categoryDialog({ name: category, ...categories[category] })}
        >
          <Card className="no-margin grade-category-item">
            <h4 className="no-margin">{category}</h4>
            <h1 className="no-margin category-number">
              {roundGrade(parseFloat(categories[category].percent.slice(0, -1)).toPrecision(4))}
              <i
                style={{
                  backgroundColor: `${colorFromCategory(category)}`,
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
            <Button disabled small active={activeStrongButton === 1} onClick={() => setActiveStrongButton(1)}>
              Analysis
            </Button>
          </Segmented>
          <Button small className="margin-left" tonal
            onClick={() => f7router.navigate(`/whatif/${props.course}/`)}
            style={{ flex: "0 0 calc(34% - calc(var(--f7-typography-margin) / 2))" }}
          >
            What If
          </Button>
        </div>
        {loading &&
          <Block className='display-flex align-items-center justify-content-center'>
            <Preloader />
          </Block>
        }
        {(!loading || store.state.useCache) &&
          <div className="assignment-grade-container margin-top">
            <Card className="no-margin assignment-grade-item">
              <Gauge
                className="margin-half"
                type="circle"
                value={user.anim != false ? animatedValue / 100 : average / 100} // Use animated value here
                borderColor={`var(--f7-${user.layout}-primary)`}
                borderBgColor={gaugeBackgroundColor(user)}
                borderWidth={20}
                valueText={`${roundGrade((user.anim != false ? animatedValue : parseFloat(average)).toPrecision(4))}`}
                valueFontSize={50}
                valueTextColor={`var(--f7-${user.layout}-primary)`}
                labelText="Overall"
                labelFontSize={20}
              />
            </Card>
            {createCategories()}
          </div>
        }
      </Block>

      {!loading &&
        <List dividersIos mediaList strongIos strong inset className="scores-list no-chevron mod-list margin-top">
          {createGrades()}
        </List>
      }
    </Page>
  )
}

export default ClassGradesPage;