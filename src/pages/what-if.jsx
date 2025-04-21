import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, Checkbox, ListInput, Gauge, Card, List, ListItem, useStore, f7, Preloader } from 'framework7-react';
import { errorDialog, primaryFromColor, updateRouter } from '../components/app.jsx';
import { gaugeBackgroundColor, colorFromCategory } from '../pages/class-grades.jsx';
import { WhatIfGradeItem } from '../components/grades-item.jsx';
import { createRoot } from 'react-dom/client';
import { WhatIfEditDialog } from '../components/custom-dialogs.jsx';

const WhatIfPage = ({ f7router, ...props }) => {
  updateRouter(f7router);
  const [scores, setScores] = useState([]);
  const [editScores, setEditScores] = useState([]);
  const [categories, setCategories] = useState({});
  const [average, setAverage] = useState(0);
  const [editAverage, setEditAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = useStore('currentUser');

  useEffect(() => {
    if (user.username) {
      setLoading(false);
      setScores(user.gradelist[user.term][props.course].scores);
      setCategories(user.gradelist[user.term][props.course].categories);
      setAverage(user.gradelist[user.term][props.course].average.slice(0, -1));
      setEditAverage(average);
      setEditScores(JSON.parse(JSON.stringify(user.gradelist[user.term][props.course].scores))); // Deep copy
    }
  }, [average, props.course, user.gradelist, user.term, user.username]);

  const editDialog = (assignment, key) => {
    const afterDone = (checked, newGrade) => {
      const newScores = [...editScores];
      newScores[key].score = newGrade;
      newScores[key].percentage = newGrade + "%";
      if (checked) {
        newScores[key].badges = ["exempt"];
      }
      else {
        newScores[key].badges = newScores[key].badges.filter((badge) => badge !== "exempt");
      }
      setEditScores(newScores); 
    }
    return () => {
      const dialog = f7.dialog.create({
        title: assignment.name,
        closeByBackdropClick: true,
        cssClass: 'whatif-edit-dialog',
        content: '<div id="whatif-edit-dialog-container"></div>',
        buttons: user.layout == 'ios' ? [
          {
            text: 'Done',
            strong: true,
            close: true,
            onClick: () => {
              afterDone(window.currentWhatIfEdit.checked, window.currentWhatIfEdit.grade);
            }
          }
        ] : []
      });

      dialog.open();

      createRoot(document.getElementById('whatif-edit-dialog-container')).render(
        <WhatIfEditDialog layout={user.layout} startingGrade={assignment.score} badges={assignment.badges} callback={afterDone} />
      );

      window.f7alert = dialog;
    };
  };
  
  const calculateNewAvg = () => {
    let categoryGrades = {};
    for (let assignment of editScores) {
      if (!assignment.badges.includes('exempt') && assignment.score) {
        if (assignment.badges.includes('missing')) {
          assignment.score = "0.00";
        }
        if (Object.keys(categoryGrades).includes(assignment.category)) {
          categoryGrades[assignment.category].push(assignment.score);
        } else {
          categoryGrades[assignment.category] = [assignment.score];
        }
      }
    }
    for (let category of Object.keys(categoryGrades)) {
      let total = 0;
      for (let score of categoryGrades[category]) {
        total += parseFloat(score);
      }
      categoryGrades[category] = total / categoryGrades[category].length; 
    }

    let weightedSum = 0;
    let totalWeight = 0;

    for (let category of Object.keys(categoryGrades)) {
      if (categories[category] && categories[category].categoryWeight) {
        const weight = parseFloat(categories[category].categoryWeight);
        weightedSum += categoryGrades[category] * weight;
        totalWeight += weight;
      }
    }

    const newAverage = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : 0;
    setEditAverage(newAverage);
  };

  useEffect(() => {
    if (editScores.length > 0) {
      calculateNewAvg();
    }
  }, [editScores]);

  const createGrades = () => {
    return editScores.map((assignment, i) => (
      <ListItem link='#' key={i} onClick={editDialog(assignment, i)}>
        <WhatIfGradeItem
          name={assignment.name}
          date={assignment.dateAssigned ? assignment.dateAssigned : (assignment.dateDue ? assignment.dateDue : "None")}
          grade={assignment.percentage.slice(0, -1)}
          color={colorFromCategory(assignment.category)}
          badges={assignment.badges}
          total={assignment.totalPoints}
        />
      </ListItem>
    ));
  };
  return (
    <Page>
      <Navbar title={"What If: " + props.course} backLink="Back" />
      <Block className="margin-top margin-bottom" >
        <div className="assignment-grade-container margin-top">
          <Card className="no-margin assignment-grade-item">
            <Gauge
              className="margin-half"
              type="circle"
              value={editAverage / 100}
              borderColor={primaryFromColor(user.theme)}
              borderBgColor={gaugeBackgroundColor(user)}
              borderWidth={20}
              valueText={`${parseFloat(editAverage).toPrecision(4)}`}
              valueFontSize={50}
              valueTextColor={primaryFromColor(user.theme)}
              labelText={"from " + parseFloat(average).toPrecision(4)}
              labelFontSize={20}
            />
          </Card>
        </div>
      </Block>
      <List dividersIos mediaList strongIos strong inset className="scores-list no-chevron mod-list margin-top">
        {createGrades()}
      </List>
    </Page>
  )
}

export default WhatIfPage;