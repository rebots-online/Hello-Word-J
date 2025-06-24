/**
 * Web entry point for the React Native Web application
 */

import { AppRegistry } from 'react-native';
import App from './App';
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
}

export default App;
