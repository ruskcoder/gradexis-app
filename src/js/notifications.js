import { apiUrl } from './grades-api.js';

export default async function subscribe() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        const publicKey = "BMsCbudBN3my0pcAZQhVGd6Z1XwloKFdM5Gwv58geE20j-DUbQYCO4xzUeMZsrXiM4a0CYAqqT0KKkrbB3SlJHM";

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });
            console.log('Push Subscription:', subscription);
            await fetch(`${apiUrl}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payload: subscription,
                })
            });
            console.log('Push subscription object sent to the server successfully.');
        } catch (error) {
            console.error('Push subscription failed:', error);
        }
    } else {
        console.error('Service Worker or PushManager not supported.');
    }
}

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
