//secret=legit
const SmeeClient = require('smee-client');

const smee = new SmeeClient({
  source: 'https://smee.io/dIYRLywTcJKdDx7',
  target: 'http://localhost:3000/events',
  logger: console
});

const events = smee.start();
// Stop forwarding events
// events.close();