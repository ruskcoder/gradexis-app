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
import '../css/reports.css';
import '../css/settings.css';
import '../css/class-grades.css';
import '../css/account-switcher.css'
import '../css/what-if.css';
import '../css/login.css';
import '../css/tables.css';

// Import App Component
import App from '../components/app.jsx';


Framework7.use(Framework7React);
const root = createRoot(document.getElementById('app'));
root.render(React.createElement(App));

document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
}, false);

window.addEventListener('beforeinstallprompt', (e) => {
    window.deferredPrompt = e;
});
window.addEventListener("load", function () {
    setTimeout(function () {
        window.scrollTo(0, 1);
    }, 0);
});

window.onerror = function (message, source, lineno, colno, error) {
    // if (confirm('An error occurred. Please clear app data')) {
    //     localStorage.clear();
    //     window.location.reload();
    // }

    alert(`Error: ${message}\nSource: ${source}\nLine: ${lineno}, Column: ${colno}\nError Object: ${error}`);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}


function showNotification() {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
                registration.showNotification('hi', {
                    body: 'Hello world!',
                    icon: '/icons/192x192.png',
                    vibrate: [200, 100, 200],
                    data: {
                        url: 'https://example.com'
                    }
                });
            } else {
                console.error('Service worker registration not found.');
            }
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {

        });
    }
}
// https://web.dev/explore/notifications

// setInterval(() => {showNotification();}, 1000);