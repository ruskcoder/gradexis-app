import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

class StorageManager {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async setItem(key, value) {
    const stringValue = JSON.stringify(value);
    if (this.isNative) {
      await Preferences.set({ key, value: stringValue });
    } else {
      localStorage.setItem(key, stringValue);
    }
  }

  async getItem(key, defaultValue = null) {
    try {
      let stringValue;
      if (this.isNative) {
        const result = await Preferences.get({ key });
        stringValue = result.value;
      } else {
        stringValue = localStorage.getItem(key);
      }
      
      if (stringValue === null || stringValue === undefined) {
        return defaultValue;
      }
      
      return JSON.parse(stringValue);
    } catch (error) {
      console.error('Error getting storage item:', error);
      return defaultValue;
    }
  }

  async removeItem(key) {
    if (this.isNative) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear() {
    if (this.isNative) {
      await Preferences.clear();
    } else {
      localStorage.clear();
    }
  }
}

export default new StorageManager();
