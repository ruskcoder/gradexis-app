import { Icon, f7 } from 'framework7-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const OverviewItem = ({ title, subtitle }) => {
  return (
    <>
      <div style={{ flex: 1 }}>
        <div className="item-title-row"><div className="item-title" style={{ fontSize: "var(--f7-list-item-title-font-size)" }}>{title}</div></div>
        <div className="item-subtitle" style={{ fontSize: "var(--f7-list-item-subtitle-font-size)" }}>{subtitle}</div>
      </div>
      <div className="chevron" style={{
      }}>

      </div>
    </>
  );
};

OverviewItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

const OverviewIcon = ({ iconIos, iconMd }) => {
  return (
    <>
      <div
        slot="media"
        className='overview-icon'
        style={{ backgroundColor: 'var(--f7-theme-color)' }}
      >
        <Icon ios={iconIos} md={iconMd} style={{ color: "var(--f7-text-editor-bg-color)" }} />
      </div>
    </>
  );
};

OverviewIcon.propTypes = {
  iconIos: PropTypes.string.isRequired,
  iconMd: PropTypes.string.isRequired,
};


export default { OverviewItem };
export { OverviewItem, OverviewIcon };
