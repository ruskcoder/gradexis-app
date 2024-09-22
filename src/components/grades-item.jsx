import { Card, ListItem, f7 } from 'framework7-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getColorTheme } from './app';


const GradesItem = ({ title, subtitle, grade }) => {

  return (
    <>
      <div style={{ flex: 1 }}>
        <div className="item-title-row">
          <div
            className="item-title"
            style={{ fontWeight: 600, fontSize: 17, lineHeight: "20px" }}
          >
            {title}
          </div>
        </div>
        <div
          className="item-subtitle"
          style={{ fontSize: 14, lineHeight: "17px" }}
        >
          {subtitle}
        </div>
      </div>
      <div
        className="grades-number"
        style={{
          backgroundColor: "#00cf63",
          color: "white",
        }}
      >
        {grade}
      </div>
      <div className="chevron" style={{}}></div>
    </>
  );
};

GradesItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  grade: PropTypes.number.isRequired,
};

export default GradesItem;
