// Import React and ReactDOM
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { terminal } from 'virtual:terminal'
// Import Framework7
import Framework7 from 'framework7/lite-bundle';

// Import Framework7-React Plugin
import Framework7React, { f7 } from 'framework7-react';

// Import Framework7 Styles
import 'framework7/css/bundle';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.css';
import '../css/quick-styles.css';

import '../css/tabs.css';
import '../css/grades.css';
import '../css/list.css';
import '../css/settings.css';
import '../css/class-grades.css';
import '../css/account-switcher.css'
import * as serviceWorker from './sw.js';
import $ from 'dom7';

// Import App Component
import App from '../components/app.jsx';

document.addEventListener("contextmenu", function (e){
    e.preventDefault();
}, false);
Framework7.use(Framework7React);
const root = createRoot(document.getElementById('app'));
root.render(React.createElement(App));
serviceWorker.register();
