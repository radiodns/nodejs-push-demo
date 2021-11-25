const fs = require('fs');

/**
 * Generates a listener function for the HTTP server.
 */

module.exports = function createRequestListener(destinations) {
  return function httpListener(request, response) {
    if (request.url === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(fs.readFileSync('./public/index.html'));
      return;
    }
    const [, identifier] = (request.url.match(/^\/radiodns\/push\/1\.0\/(.+$)/) || []);
    if (identifier) {
      const destination = destinations.find(({ identifiers }) => identifiers.includes(identifier));
      if (destination !== undefined) {
        response.writeHead(200, { 'Content-Type': 'text/event-stream' });
        destination.subscribe(response);
        return;
      }
    }
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end('<h1>Not Found</h1>');
  };
};
