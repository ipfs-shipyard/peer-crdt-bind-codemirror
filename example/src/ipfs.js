'use strict'

const IPFS = require('ipfs')//window.Ipfs
if (!IPFS) {
  throw new Error('no IPFS!')
}

module.exports = () => {
  return new IPFS({
    EXPERIMENTAL: {
      pubsub: true
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
        ]
      }
    }
  })
}