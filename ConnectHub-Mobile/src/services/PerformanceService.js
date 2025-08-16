import { AppState, NetInfo, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

class PerformanceService {
  constructor() {
    this.metrics = {
      appLaunchTime: null,
      screenTransitions: [],
      apiResponseTimes: [],
      memoryUsage: [],
      crashReports: [],
      userSessions: [],
    };

    this.initializeMonitoring();
  }

  initializeMonitoring() {
    this.trackAppLaunchTime();
    this.setupAppStateListener();
    this.setupNetworkListener();
    this.startMemoryMonitoring();
  }

  // App launch time tracking
  trackAppLaunchTime() {
    const launchTime = Date.now();
    this.metrics.appLaunchTime = launchTime;
    
    // Track time to interactive
    setTimeout(() => {
      const timeToInteractive = Date.now() - launchTime;
      this.logMetric('app_launch_time', timeToInteractive);
    }, 100);
  }

  // Screen navigation performance
  trackScreenTransition(screenName, startTime) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const transition = {
      screenName,
      duration,
      timestamp: endTime,
    };
    
    this.metrics.screenTransitions.push(transition);
    this.logMetric('screen_transition', transition);
    
    // Keep only last 50 transitions
    if (this.metrics.screenTransitions.length > 50) {
      this.metrics.screenTransitions = this.metrics.screenTransitions.slice(-50);
    }
  }

  // API call performance tracking
  trackAPICall(endpoint, method, startTime, success, responseSize = 0) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const apiCall = {
      endpoint,
      method,
      duration,
      success,
      responseSize,
      timestamp: endTime,
    };
    
    this.metrics.apiResponseTimes.push(apiCall);
    this.logMetric('api_call', apiCall);
    
    // Keep only last 100 API calls
    if (this.metrics.apiResponseTimes.length > 100) {
      this.metrics.apiResponseTimes = this.metrics.apiResponseTimes.slice(-100);
    }
  }

  // Memory usage monitoring
  startMemoryMonitoring() {
    if (Platform.OS === 'android') {
      // Android memory monitoring would require native module
      return;
    }

    setInterval(async () => {
      try {
        const usedMemory = await DeviceInfo.getUsedMemory();
        const totalMemory = await DeviceInfo.getTotalMemory();
        const memoryUsagePercent = (usedMemory / totalMemory) * 100;
        
        const memoryInfo = {
          used: usedMemory,
          total: totalMemory,
          percentage: memoryUsagePercent,
          timestamp: Date.now(),
        };
        
        this.metrics.memoryUsage.push(memoryInfo);
        
        // Alert if memory usage is high
        if (memoryUsagePercent > 80) {
          this.logMetric('high_memory_usage', memoryInfo);
          this.triggerMemoryCleanup();
        }
        
        // Keep only last 20 memory readings
        if (this.metrics.memoryUsage.length > 20) {
          this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-20);
        }
      } catch (error) {
        console.error('Memory monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  // Memory cleanup
  triggerMemoryCleanup() {
    // Clear image caches, temporary data, etc.
    console.log('Triggering memory cleanup...');
    
    // Example cleanup actions
    this.clearOldCacheData();
    this.compactMetrics();
  }

  async clearOldCacheData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      // Remove cache older than 1 hour
      const oneHourAgo = Date.now() - 3600000;
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const cached = JSON.parse(data);
          if (cached.timestamp < oneHourAgo) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  compactMetrics() {
    // Reduce metrics arrays to save memory
    this.metrics.screenTransitions = this.metrics.screenTransitions.slice(-10);
    this.metrics.apiResponseTimes = this.metrics.apiResponseTimes.slice(-20);
    this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-5);
  }

  // App state monitoring
  setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      const timestamp = Date.now();
      
      if (nextAppState === 'active') {
        this.startSession(timestamp);
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        this.endSession(timestamp);
      }
      
      this.logMetric('app_state_change', { state: nextAppState, timestamp });
    });
  }

  startSession(timestamp) {
    const session = {
      startTime: timestamp,
      endTime: null,
      duration: null,
      screenViews: 0,
      apiCalls: 0,
      crashes: 0,
    };
    
    this.currentSession = session;
  }

  endSession(timestamp) {
    if (this.currentSession) {
      this.currentSession.endTime = timestamp;
      this.currentSession.duration = timestamp - this.currentSession.startTime;
      
      this.metrics.userSessions.push({ ...this.currentSession });
      this.logMetric('user_session', this.currentSession);
      
      // Keep only last 10 sessions
      if (this.metrics.userSessions.length > 10) {
        this.metrics.userSessions = this.metrics.userSessions.slice(-10);
      }
      
      this.currentSession = null;
    }
  }

  // Network monitoring
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      this.logMetric('network_change', {
        type: state.type,
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        details: state.details,
        timestamp: Date.now(),
      });
    });
  }

  // Crash reporting
  reportCrash(error, errorInfo) {
    const crash = {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      userAgent: Platform.constants.systemName,
      appVersion: DeviceInfo.getVersion(),
    };
    
    this.metrics.crashReports.push(crash);
    this.logMetric('crash_report', crash);
    
    // Send to crash reporting service
    this.sendCrashReport(crash);
  }

  async sendCrashReport(crashData) {
    try {
      // Send to backend or crash reporting service
      await fetch('http://localhost:5000/api/v1/analytics/crash-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(crashData),
      });
    } catch (error) {
      console.error('Failed to send crash report:', error);
      // Store locally for later retry
      await AsyncStorage.setItem(
        `crash_${Date.now()}`,
        JSON.stringify(crashData)
      );
    }
  }

  // Performance metrics collection
  async getPerformanceReport() {
    const deviceInfo = {
      brand: await DeviceInfo.getBrand(),
      model: await DeviceInfo.getModel(),
      systemVersion: await DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      bundleId: DeviceInfo.getBundleId(),
    };

    const networkInfo = await NetInfo.fetch();
    
    const report = {
      deviceInfo,
      networkInfo,
      metrics: this.metrics,
      generatedAt: Date.now(),
    };
    
    return report;
  }

  // Send performance data to backend
  async sendPerformanceData() {
    try {
      const report = await this.getPerformanceReport();
      
      await fetch('http://localhost:5000/api/v1/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
      
      // Clear metrics after successful send
      this.resetMetrics();
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }

  resetMetrics() {
    this.metrics = {
      appLaunchTime: this.metrics.appLaunchTime,
      screenTransitions: [],
      apiResponseTimes: [],
      memoryUsage: [],
      crashReports: [],
      userSessions: [],
    };
  }

  // Image caching optimization
  async optimizeImageCache(imageUrl, cacheKey) {
    try {
      const cachedImage = await AsyncStorage.getItem(`image_${cacheKey}`);
      
      if (cachedImage) {
        const cached = JSON.parse(cachedImage);
        const isExpired = Date.now() - cached.timestamp > 86400000; // 24 hours
        
        if (!isExpired) {
          return cached.data;
        }
      }
      
      // Download and cache new image
      const response = await fetch(imageUrl);
      const imageData = await response.blob();
      
      await AsyncStorage.setItem(`image_${cacheKey}`, JSON.stringify({
        data: imageData,
        timestamp: Date.now(),
      }));
      
      return imageData;
    } catch (error) {
      console.error('Image cache optimization error:', error);
      return null;
    }
  }

  // Battery optimization
  enableBatteryOptimization() {
    // Reduce background processes
    this.reduceBackgroundActivity();
    
    // Lower animation frame rates
    this.optimizeAnimations();
    
    // Reduce network polling
    this.optimizeNetworkRequests();
  }

  reduceBackgroundActivity() {
    // Reduce update frequencies when app is backgrounded
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        // Stop non-essential timers and intervals
        this.pauseNonEssentialServices();
      } else if (nextAppState === 'active') {
        this.resumeServices();
      }
    });
  }

  pauseNonEssentialServices() {
    // Pause location updates, reduce sync frequency, etc.
    console.log('Pausing non-essential services for battery optimization');
  }

  resumeServices() {
    console.log('Resuming services');
  }

  optimizeAnimations() {
    // This would integrate with animation libraries to reduce frame rates
    console.log('Optimizing animations for battery');
  }

  optimizeNetworkRequests() {
    // Batch requests, reduce polling frequency
    console.log('Optimizing network requests');
  }

  // Generic metric logging
  logMetric(eventName, data) {
    const logEntry = {
      event: eventName,
      data,
      timestamp: Date.now(),
    };
    
    console.log('Performance Metric:', logEntry);
    
    // Store in local buffer for batch sending
    this.bufferMetric(logEntry);
  }

  async bufferMetric(metric) {
    try {
      const buffer = await AsyncStorage.getItem('metrics_buffer');
      const metrics = buffer ? JSON.parse(buffer) : [];
      
      metrics.push(metric);
      
      // Keep buffer size manageable
      if (metrics.length > 100) {
        metrics.splice(0, 50); // Remove oldest 50 metrics
      }
      
      await AsyncStorage.setItem('metrics_buffer', JSON.stringify(metrics));
      
      // Send buffer if it's large enough
      if (metrics.length >= 50) {
        this.flushMetricsBuffer();
      }
    } catch (error) {
      console.error('Metric buffering error:', error);
    }
  }

  async flushMetricsBuffer() {
    try {
      const buffer = await AsyncStorage.getItem('metrics_buffer');
      if (!buffer) return;
      
      const metrics = JSON.parse(buffer);
      
      await fetch('http://localhost:5000/api/v1/analytics/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
      });
      
      // Clear buffer after successful send
      await AsyncStorage.removeItem('metrics_buffer');
    } catch (error) {
      console.error('Failed to flush metrics buffer:', error);
    }
  }

  // Performance monitoring HOC
  withPerformanceTracking(WrappedComponent, screenName) {
    return (props) => {
      const startTime = Date.now();
      
      React.useEffect(() => {
        this.trackScreenTransition(screenName, startTime);
      }, []);
      
      return React.createElement(WrappedComponent, props);
    };
  }
}

export default new PerformanceService();
