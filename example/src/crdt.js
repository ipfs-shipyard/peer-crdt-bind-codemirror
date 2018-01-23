'use strict'

const PeerCRDT = require('peer-crdt')
const PeerCrdtIpfs = require('peer-crdt-ipfs')
const Crypto = require('./crypto')

const KEYS = {
  read: '4XTTMBxvmEXsM4Duxfdjxji8p3hkRy61BUpwZVqgiEoVPdrxe',
  write: 'K3TgU5kyotRdrj7YD8WzStUAPmo9AqxKAPD1X73QvA2mHhCX6yu2zWiYZpAHGwMSMdWwQCHnjWPunj6xqX3DfeKYFPfVnJgSnFTM5UBHMQFtB6EhNmpx6uVSn2LXHtc6TVyiq47g'
}

module.exports = async (ipfs, type, id) => {
  const { encrypt, decrypt } = await Crypto(KEYS.read, KEYS.write)

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
