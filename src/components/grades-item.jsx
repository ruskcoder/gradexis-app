import { Card, ListItem, f7, CardContent, CardHeader, Progressbar, useStore } from 'framework7-react';
import React, { useState, useEffect } from 'react';
import { primaryFromColor, roundGrade } from '../components/app';
import PropTypes from 'prop-types';
import store from '../js/store';
import terminal from 'virtual:terminal';

function colorFromGrade(grade) {
  if (grade == "0.00" || grade == "···") {
    return "#a9a9a9";
  }
  if (grade == "X") {
    return "#3dadfd";
  }
  if (grade >= 90) {
    return "#00cf63";
  } else if (grade >= 80) {
    return "#3dadfd";
  } else if (grade >= 70) {
    return "#feae2b";
  } else {
    return "#ff796a";
  }
}

const ClassGradeItem = ({ title, subtitle, grade }) => {
  grade = grade == "" ? "0.00" : parseFloat(grade.slice(0, -1)).toPrecision(4);
  grade = roundGrade(grade);
  return (
    <>
      <div className="grades-item">
        <div className="item-title-row">
          <div
            className="item-title">
            {title}
          </div>
        </div>
        <div
          className="item-subtitle">
          {subtitle}
        </div>
      </div>
      <span
        className="grades-number"
        style={{
          backgroundColor: colorFromGrade(grade),
        }}
      >
        {grade}
      </span>
      <div className="chevron"></div>
    </>
  );
};

ClassGradeItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired,
};

function cardColor(subtitle, sat, light, theme) {
  let hue;
  if (store.state.currentUser.matchColorCards) {
    let primary = primaryFromColor(theme);
    const rgb = primary.match(/\w\w/g).map((x) => parseInt(x, 16));
    const [r, g, b] = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) {
      hue = 0;
    } else if (max === r) {
      hue = ((60 * ((g - b) / (max - min)) + 360) % 360);
    } else if (max === g) {
      hue = ((60 * ((b - r) / (max - min)) + 120) % 360);
    } else {
      hue = ((60 * ((r - g) / (max - min)) + 240) % 360);
    }
  }
  else {
    const sha = sha256(subtitle);
    const hash = Array.from(sha).reduce((acc, char) => acc + char.charCodeAt(0) / 2, 0);
    // const hash = sha.replace(/\D/g, '');
    hue = hash % 360;
  }
  return `hsl(${hue}, ${sat}%, ${light}%)`;

}

const CardClassGradeItem = ({ index, theme, title, subtitle, grade }) => {
  grade = !grade ? "--" : parseFloat(grade.slice(0, -1)).toPrecision(3);
  grade = roundGrade(grade);
  return (
    <Card className="ripple grade-card">
      <CardHeader
        style={{
          backgroundColor: cardColor(subtitle, 44, 42, theme),
        }}
        className={grade == "--" ? "progress-hidden" : ""}
      >
        <span className='grade-number' style={{color: cardColor(subtitle, 100, 95, theme)}}>{grade}</span>
        <div className='progressbar-container' style={{color: cardColor(subtitle, 100, 95, theme)}}>
          <div className="progress">
            <span className='progress-percent' style={{ textAlign: 'end' }}>0%</span>
            <span className="progressbar" data-progress={grade}>
              <span style={{
                transform: `translate3d(-${100 - grade}%, 0px, 0px)`,
                backgroundColor: cardColor(subtitle, 90, 67, theme)
              }}></span>
            </span>
            <span className='progress-percent' style={{ textAlign: 'start' }}>100%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <span className='title'>{title}</span>
        <span className='subtitle'>{subtitle}</span>
      </CardContent>
    </Card>
  )
}
CardClassGradeItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired,
};

const AssignmentGradeItem = ({ name, date, color, grade, badges }) => {
  grade = grade == "" ? "···" : parseFloat(grade).toPrecision(4);
  if (badges.includes("missing")) {
    grade = "M"
  }
  if (badges.includes("exempt")) {
    grade = "X"
  }
  grade = roundGrade(grade);
  return (
    <>
      <i
        slot="media"
        style={{
          backgroundColor: `${color}`,
        }}
        className="margin-right-half assignments-icon"
      />
      <div className="assignments-item">
        <div className="item-title-row">
          <div
            className="item-title"
          >
            {name}
          </div>
        </div>
        <div
          className="item-subtitle"
        >
          {date}
        </div>
      </div>
      <span
        className="grades-number assignments-number"
        style={{
          backgroundColor: colorFromGrade(grade),
          padding: "2px 6px",
          marginRight: "4px"
        }}
      >
        {grade}
      </span>
      <div className="chevron"></div>
    </>
  );
};

AssignmentGradeItem.propTypes = {
  name: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  grade: PropTypes.any.isRequired,
  badges: PropTypes.array.isRequired,
};

const WhatIfGradeItem = ({ name, date, color, grade, badges, total }) => {
  grade = grade == "" ? "‎" : parseFloat(grade).toPrecision(4);
  if (badges.includes("missing")) {
    grade = "M"
  }
  if (badges.includes("exempt")) {
    grade = "--"
  }
  return (
    <>
      <i
        slot="media"
        style={{
          backgroundColor: `${color}`,
        }}
        className="margin-right-half assignments-icon"
      />
      <div className="assignments-item">
        <div className="item-title-row">
          <div className="item-title">
            {name}
          </div>
        </div>
        <div className="item-subtitle">
          {date}
        </div>
      </div>
      <div className="whatif-grades">
        <span className="whatif-grade">
          {grade}
        </span>
        <span className="whatif-total">
          /{total}
        </span>
      </div>
      <div className="chevron"></div>
    </>
  );
};

WhatIfGradeItem.propTypes = {
  name: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  grade: PropTypes.any.isRequired,
  badges: PropTypes.array.isRequired,
  total: PropTypes.string.isRequired,
};

export { AssignmentGradeItem, ClassGradeItem, WhatIfGradeItem, CardClassGradeItem, roundGrade };
