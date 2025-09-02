import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { apiUrl } from './grades-api.js';
import storageManager from './storage.js';

class NotificationHandler {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.init();
  }

  async init() {
    console.log('NotificationHandler: Initializing...');
    if (this.isNative) {
      console.log('NotificationHandler: Setting up mobile handlers');
      
      // Store API URL for Android service to access
      await storageManager.setItem('apiUrl', apiUrl);
      console.log('NotificationHandler: Stored API URL:', apiUrl);
      
      await this.setupMobileHandlers();
    }
  }

  async setupMobileHandlers() {
    console.log('NotificationHandler: Setting up mobile handlers');
    
    // Listen for foreground notifications (when app is active)
    PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      console.log('NotificationHandler: Push notification received while app active:', notification);
      
      // All grade check notifications are now handled by native Android service
      if (notification.data?.trigger === 'grade_check') {
        console.log('NotificationHandler: Grade check notification received - handled by native service');
      } else {
        console.log('NotificationHandler: Processing other notification type');
        // Handle other notification types here if needed
      }
    });

    // Handle notification taps
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('NotificationHandler: Push notification tapped:', notification);
      
      // Navigate based on notification type
      if (notification.notification?.data?.className) {
        console.log('Navigate to class:', notification.notification.data.className);
      }
    });

    // Request notification permissions for local notifications
    const result = await LocalNotifications.requestPermissions();
    console.log('LocalNotifications permission result:', result);
    
    // Create notification channel
    await this.createNotificationChannel();
  }

  // Method to create notification channel (call this during app initialization)
  async createNotificationChannel() {
    if (this.isNative) {
      try {
        await LocalNotifications.createChannel({
          id: 'gradexis-channel',
          name: 'Gradexis Notifications',
          description: 'Notifications for grade updates',
          importance: 5,
          visibility: 1,
          sound: 'default'
        });
        console.log('Notification channel created successfully');
      } catch (error) {
        console.error('Failed to create notification channel:', error);
      }
    }
  }
}

export default new NotificationHandler();
