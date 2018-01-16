'use strict'

const IPFS = window.Ipfs
if (!IPFS) {
  throw new Error('no IPFS!')
}

const PeerCRDT = require('peer-crdt')
const PeerCrdtIpfs = require('peer-crdt-ipfs')
const Crypto = require('./crypto')

const KEYS = {
  read: '4XTTMBxvmEXsM4Duxfdjxji8p3hkRy61BUpwZVqgiEoVPdrxe',
  write: 'K3TgU5kyotRdrj7YD8WzStUAPmo9AqxKAPD1X73QvA2mHhCX6yu2zWiYZpAHGwMSMdWwQCHnjWPunj6xqX3DfeKYFPfVnJgSnFTM5UBHMQFtB6EhNmpx6uVSn2LXHtc6TVyiq47g'
}

module.exports = async (type, id) => {
  const { encrypt, decrypt } = await Crypto(KEYS.read, KEYS.write)
  const ipfs = new IPFS({
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

  const peerCrdtIpfs = PeerCrdtIpfs(ipfs)
  const CRDT = PeerCRDT
    .defaults(peerCrdtIpfs)
    .defaults({
      signAndEncrypt: encrypt,
      decryptAndVerify: decrypt
    })
  const crdt = CRDT.create(type, id)
  await crdt.network.start()
  return crdt
}
