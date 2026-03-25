const fs = require('fs');

const files = [
  'ConnectHub-Frontend/src/services/firebase-service.js',
  'ConnectHub-Frontend/src/services/auth-service.js',
  'ConnectHub-Frontend/src/services/feed-api-service.js',
  'ConnectHub-Frontend/src/services/friends-api-service.js',
  'ConnectHub-Frontend/src/services/messaging-service.js',
  'ConnectHub-Frontend/src/services/notification-service.js',
  'ConnectHub-Frontend/src/services/profile-api-service.js',
  'ConnectHub-Frontend/src/js/dating.js',
  'ConnectHub-Frontend/src/js/dating-feature-integration.js'
];

files.forEach(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    if (!content.startsWith('(function()')) {
      fs.writeFileSync(f, '(function(){\n' + content + '\n})();', 'utf8');
      console.log('Wrapped: ' + f);
    } else {
      console.log('Already OK: ' + f);
    }
  } catch(e) {
    console.error('ERROR on ' + f + ': ' + e.message);
  }
});
console.log('Done.');
