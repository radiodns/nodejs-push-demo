const path = require('path');
const { Stomp } = require('node-stomp');

/**
 * Subscribes to Stomp Slideshow server and, using the identifiers in the
 * supplied destinations, attempts to subscribe to the relevant topics and
 * forward received events back to the relevant destination.
 */

const topicSuffixes = {
  image: '/image',
  text: '/text',
};

module.exports = function createStompRelay(host, port, destinations) {
  const client = new Stomp({ host, port });
  client.on('connected', () => {
    destinations.forEach(({ identifiers: [identifier] }) => {
      if (identifier === undefined) return;
      client.subscribe({ destination: `/topic/${path.join(identifier, topicSuffixes.image)}` });
      client.subscribe({ destination: `/topic/${path.join(identifier, topicSuffixes.text)}` });
    });
  });
  client.on('message', (frame) => {
    if (frame.command !== 'MESSAGE') {
      return;
    }
    const [, topic, type] = (frame.headers.destination.match(/^\/topic\/(.+?)\/(image|text)$/) || []);
    const destination = destinations.find(({ identifiers: [id] }) => id.startsWith(topic));
    if (destination === undefined) {
      return;
    }
    if (String(frame.body).startsWith('SHOW') && type === 'image') {
      const [, src] = (String(frame.body).match(/^SHOW (.+?)$/) || []);
      if (src === undefined) {
        return;
      }
      // TODO: headers
      destination.sendEvent('image', { src: src.replace('http:', 'https:') });
    }
    if (String(frame.body).startsWith('TEXT') && type === 'text') {
      const [, body] = (String(frame.body).match(/^TEXT (.+?)$/) || []);
      // TOOD: headers
      destination.sendEvent('text', { body });
    }
  });
  client.connect();

  return client.disconnect;
};
