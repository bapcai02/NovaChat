import { AppRegistry } from 'react-native';
import App from './App';

// Register the app for web
AppRegistry.registerComponent('NovaChatMobile', () => App);

// Run the app on web
AppRegistry.runApplication('NovaChatMobile', {
  rootTag: document.getElementById('root'),
});

