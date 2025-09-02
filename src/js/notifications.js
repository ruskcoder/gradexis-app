import { apiUrl } from './grades-api.js';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import notificationHandler from './notification-handler.js';

export default async function subscribe() {
    if (Capacitor.isNativePlatform()) {
        // Handle native platform (Android/iOS)
        await setupMobilePushNotifications();
    } else if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Handle web platform (both regular web and Capacitor web builds)
        await setupWebPushNotifications();
    } else {
        console.error('Push notifications not supported on this platform');
    }
}

async function setupMobilePushNotifications() {
    try {
        // Create notification channel first
        await notificationHandler.createNotificationChannel();
        
        // Request permission
        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }
        
        if (permStatus.receive !== 'granted') {
            throw new Error('User denied permissions!');
        }
        
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        
        // Listen for registration token
        PushNotifications.addListener('registration', async (token) => {
            console.log('Push registration success, token: ' + token.value);
            
            // Send token to your backend
            try {
                const response = await fetch(`${apiUrl}/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        payload: { token: token.value },
                        platform: 'android'
                    })
                });
                console.log('Push token sent to server successfully. Response:', await response.json());
            } catch (error) {
                console.error('Failed to send token to server:', error);
            }
        });
        
        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });
        
    } catch (error) {
        console.error('Mobile push notification setup failed:', error);
    }
}

async function setupWebPushNotifications() {
    // Detect platform more precisely
    const isCapacitorWeb = !Capacitor.isNativePlatform() && 
                          (window.location.protocol === 'capacitor:' || 
                           window.Capacitor?.platform === 'web' ||
                           document.querySelector('meta[name="capacitor-initial-focus"]'));
    
    const platform = isCapacitorWeb ? 'web-firebase' : 'web';

    try {
        // Get the appropriate public key from server
        const keyResponse = await fetch(`${apiUrl}/vapid-public-key?platform=${platform}`);
        const { publicKey } = await keyResponse.json();
        
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
        
        console.log(`Push Subscription (${platform}):`, subscription);
        
        await fetch(`${apiUrl}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payload: subscription,
                platform: platform
            })
        });
        
        console.log(`Push subscription object sent to server successfully as ${platform}.`);
    } catch (error) {
        console.error('Push subscription failed:', error);
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
