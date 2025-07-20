import React, { useEffect, useState, useRef } from 'react';
import { Page, Navbar, Block, Segmented, Button, Gauge, Card, List, ListItem, useStore, f7, Preloader, Link, NavRight, Range, Popup } from 'framework7-react';
import { ClassGradeItem } from '../components/grades-item.jsx';
import { createRoot } from 'react-dom/client';
import { errorDialog, primaryFromColor, updateRouter, roundGrade } from '../components/app.jsx';
import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import { getGrades } from '../js/grades-api.js';
import store from '../js/store.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const colorFromCategory = (category) => {
  category = category.toLowerCase();
  if (category == "major") { return "#9338db" }
  if (category == "minor") { return "#00de63" }
  if (category == "other") { return "#fa9917" }
  else {
    let hash = 0;
    category.split('').forEach(char => {
      hash = char.charCodeAt(0) + ((hash << 5) - hash)
    })
    let colour = '#'
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      colour += value.toString(16).padStart(2, '0')
    }
    return colour
  }
}

export const gaugeBackgroundColor = (user) => {
  return (
    hexFromArgb(themeFromSourceColor(argbFromHex(user.theme), []).schemes[user.scheme].secondaryContainer)
  )
}

const ClassGradesPage = ({ f7router, ...props }) => {
  const [activeMainTabs, setactiveMainTabs] = useState(0);
  const [activeSubTabs, setactiveSubTabs] = useState(0);

  const user = useStore('currentUser');

  updateRouter(f7router);

  const [scores, setScores] = useState([]);
  const [categories, setCategories] = useState({});
  const [average, setAverage] = useState(0);
  const [history, setHistory] = useState({});
  const [historyDate, setHistoryDate] = useState("");
  const [loading, setLoading] = useState(true);

  const [popupOpened, setPopupOpened] = useState(false);

  const color = getComputedStyle(document.body).getPropertyValue(`--f7-${user.layout}-primary`);
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--f7-md-surface-variant');
  const gridTextColor = getComputedStyle(document.documentElement).getPropertyValue('--f7-md-on-surface-variant');

  const formatHistoryDate = (dateStr) => {
    if (!dateStr || dateStr === "No history available") return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const datePart = date.toLocaleDateString(undefined, options);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minuteStr = minutes.toString().padStart(2, '0');
    return `${datePart} at ${hours}:${minuteStr}${ampm}`;
  };

  const formatTimelineDate = (dateStr) => {
    if (!dateStr || dateStr === "No history available") return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeNoAmPm = time.replace(/(AM|PM)/, '').trim();
    return [day, month, timeNoAmPm];
  };

  useEffect(() => {
    if (user.username) {
      if (user.scoresIncluded || user.useCache) {
        setLoading(false);
        setScores(user.gradelist[user.term][props.course].scores);
        setCategories(user.gradelist[user.term][props.course].categories);
        setAverage(user.gradelist[user.term][props.course].average);
      }
      else {
        getGrades(props.course, user.term).then((data) => {
          if (data.success != false) {
            setScores(data.scores);
            setCategories(data.categories);
            setAverage(data.average);
            let updatedGradelist = { ...user.gradelist };
            updatedGradelist[user.term][props.course] = {
              ...updatedGradelist[user.term][props.course],
              scores: data.scores,
              categories: data.categories,
              averageType: data.averageType,
              average: data.average,
            };
            store.dispatch('changeUserData', {
              item: 'gradelist',
              value: updatedGradelist,
            });
            setLoading(false);
          }
          else {
            errorDialog(data.message);
          }
        })
          .catch(() => { errorDialog() })
      }
      let historyData = user.gradelist[user.term][props.course].history || {};
      let historyDeepClone = JSON.parse(JSON.stringify(historyData));
      setHistory(historyDeepClone);
      setHistoryDate(Object.keys(historyDeepClone)[Object.keys(historyDeepClone).length - 1])
    }
  }, [user.username]);

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
              <p className="info-category-data">{`${assignment.weightedScore} / ${assignment.weightedTotalPoints}`}</p>
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
            <div>
              <p className="info-category-title">Badges</p>
              <p className="info-category-data">{
                assignment.badges.length > 0 ? assignment.badges.map((badge, i) => {
                  if (badge == "missing") {
                    return <span key={i} className="badge color-red">Missing</span>
                  }
                  if (badge == "exempt") {
                    return <span key={i} className="badge color-blue">Exempt</span>
                  }
                  if (badge == "late") {
                    return <span key={i} className="badge color-yellow">Late</span>
                  }
                  if (badge == "absent") {
                    return <span key={i} className="badge color-green">Absent</span>
                  }
                }) : "None"
              }</p>
            </div>
          </div>
        </>
      );

      setTimeout(() => {
        window.f7alert = f7.dialog.create({
          title: assignment.name,
          closeByBackdropClick: true,
          cssClass: 'extra-info-dialog',
          content: container.innerHTML,
        });
        window.f7alert.open();
      }, 0);
    }
  };

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
        window.f7alert = f7.dialog.create({
          title: category.name,
          closeByBackdropClick: true,
          cssClass: 'extra-info-dialog',
          content: container.innerHTML,
        })
        window.f7alert.open();
      }, 0);
    }
  }

  const createGrades = (scores, click = true) => {
    var assignmentList = [];
    scores.forEach((assignment, i) => {
      assignmentList.push(
        <ListItem link='#' onClick={click ? infoDialog(assignment) : undefined} key={i}>
          <ClassGradeItem
            name={assignment.name}
            date={assignment.dateAssigned ? assignment.dateAssigned : (assignment.dateDue ? assignment.dateDue : "None")}
            grade={assignment.percentage.slice(0, -1)}
            score={assignment.score}
            color={colorFromCategory(assignment.category)}
            badges={assignment.badges}
          />
        </ListItem>
      )
    });
    return assignmentList;
  }

  const createCategories = (categories) => {
    let categoryCards = []

    for (let category of Object.keys(categories)) {
      categoryCards.push(
        <div
          style={{ display: "contents", cursor: "pointer" }}
          onClick={categoryDialog({ name: category, ...categories[category] })}
          key={category}
        >
          <Card className="no-margin grade-category-item">
            <h4 className="no-margin">{category}</h4>
            <h1 className="no-margin category-number">
              {roundGrade(parseFloat(categories[category].percent.slice(0, -1)).toPrecision(4), false)}
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

  const generateBarChart = (category, color) => {
    const labels = Object.keys(history).map(date => formatHistoryDate(date));
    let averages = [];
    if (category == 'overall') {
      averages = Object.keys(history).map(date => history[date]?.average);
    }
    else {
      averages = Object.keys(history).map(date => history[date]?.categories[category]?.percent ? parseFloat(history[date].categories[category].percent.slice(0, -1)) : 0);
    }
    const minAvg = Math.min(...averages);

    const chartOptions = {
      responsive: true,
      scales: {
        x: {
          ticks: {
            display: false,
          },
          maxBarThickness: 20,
          grid: {
            display: false,
            color: gridColor,
          },
        },
        y: {
          min: Math.round((minAvg - 20) / 10) * 10,
          step: 10,
          ticks: {
            callback: (value) => `${value}%`,
            color: gridTextColor,
          },
          grid: {
            color: gridColor,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
    };

    const data = {
      labels,
      datasets: [
        {
          data: averages,
          backgroundColor: color,
          borderRadius: 5,
          maxBarThickness: 40
        },
      ],
    };
    return (<Bar options={chartOptions} data={data} />);
  }

  const changedScores = (date) => {
    let currentScores = history[date] ? history[date].scores : [];
    let currentDateIndex = Object.keys(history).indexOf(date);
    let prevScores = history[Object.keys(history)[currentDateIndex - 1]]?.scores || [];

    const prevScoresMap = {};
    prevScores.forEach(score => {
      prevScoresMap[score.name] = score;
    });

    const changedOrAdded = currentScores.filter(score => {
      const prevScore = prevScoresMap[score.name];
      if (!prevScore) {
        return true;
      }
      return (
        score.score !== prevScore.score ||
        score.percentage !== prevScore.percentage ||
        score.totalPoints !== prevScore.totalPoints ||
        score.weightedScore !== prevScore.weightedScore ||
        score.weightedTotalPoints !== prevScore.weightedTotalPoints ||
        score.category !== prevScore.category ||
        score.dateAssigned !== prevScore.dateAssigned ||
        score.dateDue !== prevScore.dateDue ||
        score.weight !== prevScore.weight ||
        JSON.stringify(score.badges) !== JSON.stringify(prevScore.badges)
      );
    });

    return changedOrAdded;
  }

  const changedCategories = (date) => {
    let currentCategories = history[date] ? history[date].categories : {};
    let currentDateIndex = Object.keys(history).indexOf(date);
    let prevCategories = history[Object.keys(history)[currentDateIndex - 1]]?.
      categories || {};
    const prevCategoriesMap = {};
    Object.keys(prevCategories).forEach(category => {
      prevCategoriesMap[category] = prevCategories[category];
    });
    const changedOrAdded = Object.keys(currentCategories).filter(category => {
      const prevCategory = prevCategoriesMap[category];
      if (!prevCategory) {
        return true;
      }
      return (
        currentCategories[category].categoryWeight !== prevCategory.categoryWeight ||
        currentCategories[category].studentsPoints !== prevCategory.studentsPoints ||
        currentCategories[category].maximumPoints !== prevCategory.maximumPoints ||
        currentCategories[category].categoryPoints !== prevCategory.categoryPoints ||
        currentCategories[category].percent !== prevCategory.percent
      );
    });

    return changedOrAdded.map(category => {
      return {
        name: category,
        ...currentCategories[category],
      };
    });
  }

  const changedAverage = (date) => {
    let currentAverage = history[date] ? history[date].average : 0;
    let currentDateIndex = Object.keys(history).indexOf(date);
    let prevAverage = history[Object.keys(history)[currentDateIndex - 1]]?.average || 0;
    if (currentAverage !== prevAverage) {
      if (prevAverage == null || prevAverage == undefined) {
        prevAverage = 0;
      }
      return {
        current: currentAverage,
        previous: prevAverage,
        changed: currentAverage - prevAverage,
        changedUpDown: currentAverage - prevAverage > 0 ? 'up' : 'down',
      };
    }
    return false;
  }

  const setTimeTravel = (value) => {
    setHistoryDate(Object.keys(history)[value - 1]);
  }

  const switchTab = (tabClass) => {
    const tab = document.querySelector(`.${tabClass}`);
    tab.classList.add('active');
    const otherTab = document.querySelector(`.${tabClass === 'grades-tab' ? 'analyze-tab' : 'grades-tab'}`);
    otherTab.classList.remove('active');
    setactiveMainTabs(tabClass === 'grades-tab' ? 0 : 1);
  }

  const switchSubTab = (tabClass) => {
    const allTabs = document.querySelectorAll('.analyze-subtabs');
    allTabs.forEach((tab) => {
      tab.classList.remove('active');
    });
    const selectedTab = document.querySelector(`.${tabClass}`);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
    setactiveSubTabs(tabClass === 'statistics-tab' ? 0 : 1);
  }



  return (
    <Page className='class-grades'>
      <Navbar title={props.course} backLink="Back" />

      <Block className="margin-top margin-bottom mode-switcher" >
        <div style={{ display: "flex", flexWrap: "nowrap" }}>
          <Segmented strong inset small className="no-margin no-padding" style={{ flex: "0 0 calc(66% - calc(var(--f7-typography-margin) / 2))" }}>
            <Button small active={activeMainTabs === 0} onClick={() => switchTab('grades-tab')}>
              Grades
            </Button>
            <Button small active={activeMainTabs === 1} onClick={() => switchTab('analyze-tab')}>
              Analyze
            </Button>
          </Segmented>
          <Button small className="margin-left" tonal
            onClick={() => f7router.navigate(`/whatif/${encodeURIComponent(props.course)}/`)}
            style={{ flex: "0 0 calc(34% - calc(var(--f7-typography-margin) / 2))" }}
            aria-label="GetWhatIf"
            disabled={loading}
          >
            What If
          </Button>
        </div>
      </Block>

      <div className='class-grades-tab grades-tab active'>
        {loading &&
          <Block className='display-flex align-items-center justify-content-center'>
            <Preloader />
          </Block>
        }
        {!loading &&
          <>
            <Block className="margin-top margin-bottom no-padding">
              <div className="assignment-grade-container margin-top">
                <Card className="no-margin assignment-grade-item">
                  <Gauge
                    className="margin-half"
                    type="circle"
                    value={parseFloat(average).toPrecision(4) / 100}
                    borderColor={color}
                    borderBgColor={gaugeBackgroundColor(user)}
                    borderWidth={20}
                    valueText={`${parseFloat(average).toPrecision(4)}`}
                    valueFontSize={50}
                    valueTextColor={color}
                    labelText={user.letterGrades ? parseFloat(average).toPrecision(4) : "Overall"}
                    labelFontSize={20}
                  />
                </Card>
                {createCategories(categories)}
              </div>
            </Block>
            <List dividersIos mediaList strongIos strong inset className="scores-list no-chevron mod-list margin-top">
              {createGrades(scores)}
            </List>
          </>
        }
      </div>

      <div className='class-grades-tab analyze-tab'>
        <Block className="margin-top margin-bottom">
          <Segmented tabbar strong inset small className="no-margin no-padding">
            {/* <Button small active={activeSubTabs === 0} onClick={() => switchSubTab('time-travel-tab')}>
              TimeTravel
            </Button> */}
            <Button small active={activeSubTabs === 0} onClick={() => switchSubTab('statistics-tab')}>
              Statistics
            </Button>
            <Button small active={activeSubTabs === 1} onClick={() => switchSubTab('timeline-tab')}>
              Timeline
            </Button>
          </Segmented>
        </Block>

        <Popup swipeToClose opened={popupOpened} onPopupClosed={() => setPopupOpened(false)}>
          <Page>
            <Navbar title="TimeTravel">
              <NavRight>
                <Link popupClose>Close</Link>
              </NavRight>
            </Navbar>

            <Block className="margin-top margin-bottom" inset strong>
              <p className='margin-bottom-half' style={{ fontSize: '20px' }}>
                <strong>{formatHistoryDate(historyDate)}</strong>
              </p>
              <Range min={1} key={Object.keys(history).length} max={Object.keys(history).length} step={1} value={Object.keys(history).indexOf(historyDate) + 1} onRangeChange={setTimeTravel} />
            </Block>
            <Block className="margin-top margin-bottom no-padding">
              <div className="assignment-grade-container margin-top">
                <Card className="no-margin assignment-grade-item">
                  <Gauge
                    className="margin-half"
                    type="circle"
                    value={history[historyDate] ? parseFloat(history[historyDate].average).toPrecision(4) / 100 : 0}
                    borderColor={color}
                    borderBgColor={gaugeBackgroundColor(user)}
                    borderWidth={20}
                    valueText={`${roundGrade((parseFloat(history[historyDate] ? history[historyDate].average : 0)).toPrecision(4))}`}
                    valueFontSize={50}
                    valueTextColor={color}
                    labelText={user.letterGrades ? parseFloat(history[historyDate] ? history[historyDate].average : 0).toPrecision(4) : "Overall"}
                    labelFontSize={20}
                  />
                </Card>
                {createCategories(history[historyDate] ? history[historyDate].categories : {})}
              </div>
            </Block>
            <List dividersIos mediaList strongIos strong inset className="scores-list no-chevron mod-list margin-top">
              {createGrades(history[historyDate] ? history[historyDate].scores : [])}
            </List>
          </Page>
        </Popup>

        <div className="analyze-subtabs statistics-tab active padding-bottom">
          <Block inset strong className='margin-top margin-bottom'>
            <p className="margin-bottom-half" style={{ fontSize: 'var(--f7-table-title-font-size)' }}><strong>Past Averages: </strong></p>
            {generateBarChart('overall', color)}
          </Block>
          {Object.keys(history[Object.keys(history)[Object.keys(history).length - 1]]?.categories || {}).map((category, index) => (
            <Block inset strong className='margin-top margin-bottom' key={index}>
              <p className="margin-bottom-half" style={{ fontSize: 'var(--f7-table-title-font-size)' }}><strong>{category}: </strong></p>
              {generateBarChart(category, colorFromCategory(category))}
            </Block>
          ))}
        </div>

        <div className="analyze-subtabs timeline-tab">
          <div className="timeline margin-top">
            {Object.keys(history).toReversed().map((date, index) => (
              <div className="timeline-item" key={date} onClick={() => { setHistoryDate(date); setPopupOpened(true); }}>
                <div className="timeline-item-date">
                  {formatTimelineDate(date)[0]} <small>{formatTimelineDate(date)[1]}</small>
                  <br />
                  {formatTimelineDate(date)[2]}
                </div>
                <div className="timeline-item-divider"></div>
                <div className="timeline-item-content" style={{ width: '100%', height: '100%' }}>
                  {(changedCategories(date).length > 0 || changedAverage(date)) && (
                    <div className='timeline-info margin-bottom-half'>
                      {changedAverage(date) && (
                        <Card className='mini-grade-display'>
                          <div className={`grades-number changed-${changedAverage(date).changedUpDown}`} style={{ padding: '4px 4px' }}>
                            {changedAverage(date).changedUpDown === 'up' ? '+' : ''}{parseFloat(changedAverage(date).changed).toPrecision(3)}%
                          </div>
                          <h1 className="no-margin">
                            {parseFloat(changedAverage(date).current).toPrecision(4)}
                          </h1>
                        </Card>
                      )}

                      {changedCategories(date).map((category, i) => (
                        <Card className="no-margin grade-category-item category-mini" key={i} onClick={categoryDialog(category)}>
                          <h4 className="no-margin">{category.name}</h4>
                          <h1 className="no-margin category-number">
                            {parseFloat(category.percent.slice(0, -1)).toPrecision(4)}
                            <i
                              style={{
                                backgroundColor: `${colorFromCategory(category.name)}`,
                                width: '20px',
                                height: '20px',
                                borderRadius: '30%',
                              }}
                              className="icon demo-list-icon wheel-picker-target"
                            />
                          </h1>
                        </Card>
                      ))}
                    </div>
                  )}

                  <List dividersIos mediaList strongIos strong inset className="scores-list mod-list no-margin-top">
                    {createGrades(changedScores(date), false)}
                  </List>
                  {/* <div className="timeline-item-inner">Some text goes here</div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  )
}

export default ClassGradesPage;