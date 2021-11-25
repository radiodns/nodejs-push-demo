#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const http = require('http');
const http2 = require('http2');

const Destination = require('./lib/Destination');
const createRequestListener = require('./lib/http');
const createStompRelay = require('./lib/slideshow');
const createMockPubSubRelay = require('./lib/pubsub');

/**
 * This script sets up the destinations for the example, creates the HTTP
 * server(s) and then a Stomp relay and example PubSub relay.
 *
 * All of these are connected together to provide the example environment.
 */

const stompRelay = { host: 'stomp.radiovis.api.bbci.co.uk', port: 61613 };

// create destinations

const destinations = [
  new Destination('fm/ce1/c201/09710'),
  new Destination(['fm/ce1/c202/08810', 'dab/ce1/ce15/c222/0']),
];

// setup HTTP servers

const requestListener = createRequestListener(destinations);

http.createServer(requestListener).listen(80);
console.log('HTTP/1 listening on port 80');

if (fs.existsSync('./cert.pem') && fs.existsSync('./key.pem')) {
  const options = {
    allowHTTP1: true,
    cert: fs.readFileSync('./cert.pem'),
    key: fs.readFileSync('./key.pem'),
  };
  http2.createSecureServer(options, requestListener).listen(443);
  console.log('HTTP/2 listening on port 443');
} else {
  console.error('no cert/key pair found, launching HTTP/1.x support only');
}

// relay an existing Slideshow Stomp server to SSE

createStompRelay(stompRelay.host, stompRelay.port, destinations);
console.log(`Slideshow Stomp relay connected to ${stompRelay.host}:${stompRelay.port}`);

// forward received pub/sub payloads to SSE

createMockPubSubRelay(destinations);
