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
import { apiUrl } from './grades-api.js';


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
  alert(`Error: ${message}\nSource: ${source}\nLine: ${lineno}, Column: ${colno}\nError Object: ${error}`);
  window.alert = function () { };
  location.reload();
}

if ('serviceWorker' in navigator) {
  const publicKey = "BMsCbudBN3my0pcAZQhVGd6Z1XwloKFdM5Gwv58geE20j-DUbQYCO4xzUeMZsrXiM4a0CYAqqT0KKkrbB3SlJHM";

  window.addEventListener('load', () => {
    const serviceWorkerVersion = 'v1'; // Add a version identifier for your service worker
    const swPath = `/sw.js?version=${serviceWorkerVersion}`; // Versioning for cache-busting

    navigator.serviceWorker.register(swPath)
      .then(async (registration) => {
        console.log('Service Worker registered successfully with scope:', registration.scope);

        // Check if Push is supported
        if (!('PushManager' in window)) {
          console.error('Push notifications are not supported.');
          return;
        }

        // Subscribe to Push Notifications
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true, // Ensures notifications are always visible
            applicationServerKey: urlBase64ToUint8Array(publicKey) // Replace with your Public VAPID Key
          });

          console.log('Push Subscription:', subscription);

          await fetch(`${apiUrl}/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
          });

          console.log('Push subscription object sent to the server successfully.');
        } catch (error) {
          console.error('Push subscription failed:', error);
        }
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });

  // Helper function to convert the VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

