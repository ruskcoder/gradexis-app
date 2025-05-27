import { apiUrl } from './grades-api.js';

export default async function subscribe(login) {
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
                            body: JSON.stringify({
                                payload: subscription,
                                username: login.username,
                                password: login.password
                            })
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

}