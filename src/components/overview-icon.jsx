import { Link, f7} from 'framework7-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getColorTheme } from './app';


const OverviewIcon = ({iconIos, iconMd}) => {
  const [backgroundColor, setBackgroundColor] = useState('');

    useEffect(() => {
      const fetchColorTheme = async () => {
        const color = await getColorTheme();
        setBackgroundColor(color);
      };

      fetchColorTheme();
    }, []);
      return (
          <div
            slot="media" 
            className='overview-icon'
            style={{backgroundColor: backgroundColor}}
          >
            <Link iconIos={iconIos} iconMd={iconMd} style={{color: f7.darkMode ? "white" : "black"}}/>
          </div>
    );
};

OverviewIcon.propTypes = {
    iconIos: PropTypes.string.isRequired,
    iconMd: PropTypes.string.isRequired,
};

export default OverviewIcon;
