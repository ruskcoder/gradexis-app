// Import React and ReactDOM
import React, {useState} from 'react';
import { createRoot } from 'react-dom/client';

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

import $ from 'dom7';

// Import App Component
import App from '../components/app.jsx';

// Init F7 React Plugin with configuration
Framework7.use(Framework7React);

// Mount React App
const root = createRoot(document.getElementById('app'));
root.render(React.createElement(App));