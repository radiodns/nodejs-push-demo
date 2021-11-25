/**
 * Destination object represents a Service which generates events and has
 * subscribed clients. It holds an array of identifiers for identification
 * against incoming subscription requests and also incoming metadata events.
 */

/* eslint-disable no-underscore-dangle */
module.exports = class Destination {
  constructor(identifier, options = {}) {
    const {
      retroactive = true,
      maxHeartbeatFrequency = 15000,
    } = options;
    this.identifiers = !Array.isArray(identifier) ? [identifier] : identifier;
    this.maxHeartbeatFrequency = maxHeartbeatFrequency;
    this.retroactive = retroactive;
    this._clients = [];
    this._lastEvents = {};
    this._resetHeartbeat();
  }

  get clients() {
    return this._clients;
  }

  get maxHeartbeatFrequency() {
    return this._maxHeartbeatFrequency;
  }

  set maxHeartbeatFrequency(frequency) {
    this._maxHeartbeatFrequency = frequency;
  }

  subscribe(client) {
    this._clients = [...this._clients, client];
    client.on('close', () => this.unsubscribe(client));
    if (this.retroactive) {
      Object.entries(this._lastEvents)
        .forEach(([event, params]) => this.sendEvent(event, params, { client }));
    }
  }

  unsubscribe(client) {
    this._clients = this._clients.filter((existingClient) => existingClient !== client);
  }

  sendEvent(event, params, options) {
    this._lastEvents[event] = params;
    this._sendRaw(`event:${event}\ndata:${JSON.stringify(params)}\n\n`, options);
  }

  _resetHeartbeat() {
    clearTimeout(this._heartbeatTimeout);
    this._heartbeatTimeout = setTimeout(() => this._sendRaw(':'), this.maxHeartbeatFrequency);
  }

  _sendRaw(payload, options = {}) {
    this._resetHeartbeat();
    const data = `${payload}\n\n`;
    if (options.client) {
      options.client.write(data);
      return;
    }
    this._clients.forEach((client) => client.write(data));
  }
};
/* eslint-enable no-underscore-dangle */
