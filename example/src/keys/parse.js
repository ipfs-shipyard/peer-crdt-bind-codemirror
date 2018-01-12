'use strict'

const crypto = require('libp2p-crypto')
const B58 = require('bs58')

module.exports = async function parseKeys (_readKey, _writeKey) {
  return new Promise((resolve, reject) => {
    const readKey = B58.decode(_readKey)
    const writeKey = B58.decode(_writeKey)
    const read = crypto.keys.unmarshalPublicKey(readKey)
    const cipher = createAESKeyFromReadKey(readKey)
    crypto.keys.unmarshalPrivateKey(writeKey, (err, write) => {
      if (err) {
        return reject(err)
      }
      resolve({
        read,
        write,
        cipher
      })
    })
  })
}

function createAESKeyFromReadKey (key) {
  const keyBytes = key.slice(0, 16)
  const iv = key.slice(16, 16 + 16)
  return () => {
    return new Promise((resolve, reject) => {
      resolve
      crypto.aes.create(keyBytes, iv, (err, cipher) => {
        if (err) {
          return reject(err)
        }
        resolve(cipher)
      })
    })
  }
}
