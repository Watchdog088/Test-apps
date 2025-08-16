import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
    this.createDefaultChannels();
  }

  configure() {
    PushNotification.configure({
      // Called when Token is generated (iOS and Android)
      onRegister: async (token) => {
        console.log('TOKEN:', token);
        await AsyncStorage.setItem('fcmToken', token.token);
        // Send token to backend for push notifications
        this.sendTokenToServer(token.token);
      },

      // Called when a remote or local notification is opened or received
      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);
        
        if (notification.userInteraction) {
          // User tapped the notification
          this.handleNotificationTap(notification);
        }

        // Required on iOS only
        notification.finish && notification.finish(PushNotification.FetchResult.NoData);
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,
      
      // Request permissions on iOS, does nothing on Android
      requestPermissions: Platform.OS === 'ios',
    });
  }

  createDefaultChannels() {
    PushNotification.createChannel(
      {
        channelId: 'default-channel',
        channelName: 'Default Channel',
        channelDescription: 'A default channel for notifications',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );

    PushNotification.createChannel(
      {
        channelId: 'messages-channel',
        channelName: 'Messages',
        channelDescription: 'Notifications for new messages',
        playSound: true,
        soundName: 'message.mp3',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Messages channel created '${created}'`)
    );

    PushNotification.createChannel(
      {
        channelId: 'matches-channel',
        channelName: 'Matches',
        channelDescription: 'Notifications for new matches',
        playSound: true,
        soundName: 'match.mp3',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Matches channel created '${created}'`)
    );
  }

  async sendTokenToServer(token) {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        await fetch('http://localhost:5000/api/v1/users/push-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({ pushToken: token, platform: Platform.OS }),
        });
      }
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  handleNotificationTap(notification) {
    // Navigate based on notification type
    const { type, data } = notification;
    
    switch (type) {
      case 'new_message':
        // Navigate to messages screen
        // NavigationService.navigate('Messages', { conversationId: data.conversationId });
        break;
      case 'new_match':
        // Navigate to matches screen
        // NavigationService.navigate('Dating', { tab: 'matches' });
        break;
      case 'new_like':
        // Navigate to notifications
        // NavigationService.navigate('Profile', { tab: 'notifications' });
        break;
      default:
        // Navigate to main screen
        // NavigationService.navigate('Home');
        break;
    }
  }

  // Local Notifications
  showLocalNotification(title, message, data = {}) {
    PushNotification.localNotification({
      title,
      message,
      playSound: true,
      soundName: 'default',
      channelId: 'default-channel',
      userInfo: data,
    });
  }

  showMessageNotification(senderName, message, conversationId) {
    PushNotification.localNotification({
      title: `New message from ${senderName}`,
      message,
      playSound: true,
      soundName: 'message.mp3',
      channelId: 'messages-channel',
      userInfo: {
        type: 'new_message',
        conversationId,
      },
    });
  }

  showMatchNotification(matchName) {
    PushNotification.localNotification({
      title: 'New Match! 💕',
      message: `You and ${matchName} liked each other!`,
      playSound: true,
      soundName: 'match.mp3',
      channelId: 'matches-channel',
      userInfo: {
        type: 'new_match',
      },
    });
  }

  // Schedule notification
  scheduleNotification(title, message, date, data = {}) {
    PushNotification.localNotificationSchedule({
      title,
      message,
      date,
      playSound: true,
      soundName: 'default',
      channelId: 'default-channel',
      userInfo: data,
    });
  }

  // Cancel all notifications
  cancelAllLocalNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Cancel notification by ID
  cancelLocalNotification(notificationId) {
    PushNotification.cancelLocalNotifications({ id: notificationId });
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      return settings ? JSON.parse(settings) : {
        messages: true,
        matches: true,
        likes: true,
        comments: true,
        follows: true,
        marketing: false,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {};
    }
  }

  // Save notification settings
  async saveNotificationSettings(settings) {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Badge management
  setBadgeCount(count) {
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(count);
    }
  }

  clearBadge() {
    this.setBadgeCount(0);
  }

  // Permission handling
  async checkPermissions() {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions);
      });
    });
  }

  async requestPermissions() {
    return new Promise((resolve) => {
      PushNotification.requestPermissions().then((permissions) => {
        resolve(permissions);
      });
    });
  }
}

export default new NotificationService();
