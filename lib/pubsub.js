/**
 * This gives an example of how a PubSub feed could be consumed and integrated
 * with the example SSE server.
 *
 * Instead of subscribing to a topic, an array of example messages are iterated
 * on a regular interval to simulate incoming realtime messages.
 */

const exampleMessages = [
  {
    message: {
      attributes: {
        identifier: 'fm/ce1/c201/09710',
        artist_name: 'Lil Nas X',
        song_name: 'That\'s What I Want',
        album_name: 'Montero',
        artwork: {
          url: 'https://m.media-amazon.com/images/I/81ZxRJm7zKL._SS500_.jpg',
        },
      },
      messageId: '2070443601311540',
      message_id: '2070443601311540',
      publishTime: '2021-02-26T19:13:55.749Z',
      publish_time: '2021-02-26T19:13:55.749Z',
    },
    subscription: 'projects/myproject/subscriptions/mysubscription',
  },
  {
    message: {
      attributes: {
        identifier: 'fm/ce1/c201/09710',
        artist_name: 'LISA',
        song_name: 'MONEY',
        album_name: 'LALISA',
        artwork: {
          url: 'https://m.media-amazon.com/images/I/81nno2dowSL._SS500_.jpg',
        },
      },
      messageId: '2070443601311541',
      message_id: '2070443601311541',
      publishTime: '2021-02-26T19:13:55.749Z',
      publish_time: '2021-02-26T19:13:55.749Z',
    },
    subscription: 'projects/myproject/subscriptions/mysubscription',
  },
  {
    message: {
      attributes: {
        identifier: 'fm/ce1/c201/09710',
        artist_name: 'Mr. Probz',
        song_name: 'Waves (Robin Schulz Remix)',
        artwork: {
          url: 'https://m.media-amazon.com/images/I/91SKkuZVF6L._SS500_.jpg',
        },
      },
      messageId: '2070443601311542',
      message_id: '2070443601311542',
      publishTime: '2021-02-26T19:13:55.749Z',
      publish_time: '2021-02-26T19:13:55.749Z',
    },
    subscription: 'projects/myproject/subscriptions/mysubscription',
  },
];

function* createArrayGenerator(array) {
  let index = 0;
  while (true) {
    if (index >= array.length) index = 0;
    yield array[index++]; // eslint-disable-line no-plusplus
  }
}

function update(generator, destinations) {
  // grab next message from our fake PubSub receiver
  const { message } = generator.next().value;
  // translate to RadioDNS meta payload format
  const event = {
    item: {
      artist: message.attributes.artist_name,
      title: message.attributes.song_name,
      artwork: message.attributes.artwork?.url,
      album: message.attributes.album_name,
    },
  };
  // dispatch to relevant destination
  const destination = destinations
    .find(({ identifiers }) => identifiers.some((id) => id === message.attributes.identifier));
  destination.sendEvent('meta', event);
}

module.exports = function createMockPubSubRelay(destinations) {
  const generator = createArrayGenerator(exampleMessages);
  update(generator, destinations);
  setInterval(() => update(generator, destinations), 5000);
};
