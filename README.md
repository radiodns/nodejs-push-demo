RadioDNS Server-sent Events Push Transport Demo
===============================================

This repository contains a Node.js app which provides an HTTP server (v1 and v2
when the required SSL certs are provided) with a Server-sent Event resource
endpoint.

It also contains a Stomp relay and "faked" PubSub relay example to generate
events to observe operation.

A frontend HTML and JS file is included (and served from the server's root) to
showcase the feeds being subscribed and parsed.

To get started run `npm install` from the project root, then `npm start`.

To setup HTTP/2 and HTTPS on v1, you need to add a `cert.pem` and `key.pem` file
to the same path as `index.js`.
