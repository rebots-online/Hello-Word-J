/**
 * Web entry point for the React Native Web application
 */

import { AppRegistry } from 'react-native';
import App from './src/platforms/web/App';
import { name as appName } from './app.json';

// Register the app component
AppRegistry.registerComponent(appName, () => App);

// Mount the app for web
if (window.document) {
  // Get the root element
  const rootTag = document.getElementById('root');
  
  // Run the app
  AppRegistry.runApplication(appName, {
    rootTag,
    initialProps: {}
  });

  // Register service worker for offline functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch(err => console.error('Service worker registration failed:', err));
    });
  }
}

export default App;
