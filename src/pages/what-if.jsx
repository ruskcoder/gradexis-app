import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, Checkbox, ListInput, Gauge, Card, List, ListItem, useStore, f7, ListButton, Button } from 'framework7-react';
import { errorDialog, primaryFromColor, updateRouter } from '../components/app.jsx';
import { gaugeBackgroundColor, colorFromCategory } from '../pages/class-grades.jsx';
import { WhatIfGradeItem, roundGrade } from '../components/grades-item.jsx';
import { createRoot } from 'react-dom/client';
import { WhatIfEditDialog, WhatIfAddDialog } from '../components/custom-dialogs.jsx';
import terminal from 'virtual:terminal'

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
      setCategories(JSON.parse(JSON.stringify(user.gradelist[user.term][props.course].categories)));
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
      newScores[key].weightedScore = newGrade;
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
        cssClass: 'whatif-edit-dialog no-padding-bottom',
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
      if (!assignment.badges.includes('exempt') && !assignment.name.trim().endsWith('*') && assignment.score) {
        if (assignment.badges.includes('missing')) {
          assignment.score = "0.00";
        }
        if (Object.keys(categoryGrades).includes(assignment.category)) {
          categoryGrades[assignment.category].push(assignment);
        } else {
          categoryGrades[assignment.category] = [assignment];
        }
      }
    }
    for (let category of Object.keys(categoryGrades)) {
      let total = 0;
      let outOf = 0;
      for (let assignment of categoryGrades[category]) {
        total += parseFloat(assignment.weightedScore);
        outOf += parseFloat(assignment.weightedTotalPoints);
      }
      terminal.log(total, outOf)
      categoryGrades[category] = (total / outOf) * 100;
    }

    let weightedSum = 0;
    let totalWeight = 0;
    let newCategories = {...categories};
    for (let category of Object.keys(categoryGrades)) {
      if (categories[category] && categories[category].categoryWeight) {
        const weight = parseFloat(categories[category].categoryWeight);
        weightedSum += categoryGrades[category] * weight;
        totalWeight += weight;
      }
      newCategories[category].percent = `${categoryGrades[category]}%`;
    }
    const newAverage = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : 0;
    setEditAverage(newAverage);
    setCategories(newCategories);
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

  const createCategories = () => {
    let categoryCards = []

    for (let category of Object.keys(categories)) {
      categoryCards.push(
        <div
          style={{ display: "contents", cursor: "pointer" }}
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

  const addGrade = () => {
    return () => {
      const afterDone = (name, score, category) => {
        if (name === "" || score === "" || category === "") {
          f7.dialog.alert("Please fill out all fields.");
          return;
        }
        const newGrade = {
          name: name,
          score: score,
          percentage: score + "%",
          category: category,
          badges: [],
          dateAssigned: "Custom Grade",
          dateDue: "Custom Grade",
          totalPoints: "100.00",
          weight: 1,
          weightedScore: score,
          weightedTotalPoints: 100,
        };
        setEditScores([newGrade, ...editScores]);
      };

      const dialog = f7.dialog.create({
        title: "Add Grade",
        closeByBackdropClick: true,
        cssClass: 'whatif-edit-dialog',
        content: '<div id="whatif-add-dialog-container"></div>',
        buttons: user.layout == 'ios' ? [
          {
            text: 'Done',
            strong: true,
            close: true,
            onClick: () => {
              afterDone(window.currentWhatIfEdit.name, window.currentWhatIfEdit.score, window.currentWhatIfEdit.category);
            }
          }
        ] : []
      });

      dialog.open();
      createRoot(document.getElementById('whatif-add-dialog-container')).render(
        <WhatIfAddDialog layout={user.layout} categories={Object.keys(categories)} callback={afterDone} />
      );

      window.f7alert = dialog;
    }
  }

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
              borderColor={`var(--f7-${user.layout}-primary)`}
              borderBgColor={gaugeBackgroundColor(user)}
              borderWidth={20}
              valueText={`${parseFloat(editAverage).toPrecision(4)}`}
              valueFontSize={50}
              valueTextColor={`var(--f7-${user.layout}-primary)`}
              labelText={"from " + parseFloat(average).toPrecision(4)}
              labelFontSize={20}
            />
          </Card>
          {createCategories()}
        </div>
      </Block>
      <List dividersIos mediaList strongIos strong inset className="scores-list whatif-list no-chevron mod-list margin-top">
        <ListButton title="Add Grade" onClick={addGrade()} />
        {createGrades()}
      </List>
    </Page>
  )
}

export default WhatIfPage;