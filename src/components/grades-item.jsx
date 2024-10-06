import { Card, ListItem, f7 } from 'framework7-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function colorFromGrade(grade) { 
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
          color: "white",
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
  grade: PropTypes.number.isRequired,
};

const AssignmentGradeItem = ({ name, date, color, grade }) => {
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
        className="grades-number"
        style={{
          backgroundColor: colorFromGrade(grade),
          padding: "2px 6px",
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
  grade: PropTypes.number.isRequired,
};

export { AssignmentGradeItem, ClassGradeItem };
