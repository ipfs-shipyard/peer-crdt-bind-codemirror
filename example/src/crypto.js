'use strict'

const parse = require('./keys/parse')

module.exports = async (privateKey, publicKey) => {
  const keys = await parse(privateKey, publicKey)

  return { encrypt, decrypt }

  function encrypt (value) {
    return new Promise(async (resolve, reject) => {
      const buf = Buffer.from(JSON.stringify(value))
      keys.write.sign(buf, (err, signature) => {
        if (err) {
          return reject(err)
        }
        const message = [buf.toString('hex'), Buffer.from(signature).toString('hex')]
        const result = Buffer.from(JSON.stringify(message))
        keys.cipher().then((cipher) => {
          cipher.encrypt(result, (err, encrypted) => {
            if (err) {
              return reject(err)
            }
            resolve(encrypted)
          })
        }).catch(reject)
      })
    })
  }

  function decrypt (buf) {
    return new Promise(async (resolve, reject) => {
      (await keys.cipher()).decrypt(buf, (err, decrypted) => {
        if (err) {
          return reject(err)
        }

        const message = JSON.parse(decrypted.toString())
        let [value, signature] = message
        value = Buffer.from(value, 'hex')
        signature = Buffer.from(signature, 'hex')
        keys.read.verify(value, signature, (err, valid) => {
          if (err) {
            return reject(err)
          }
          if (!valid) {
            return reject(new Error('invalid signature'))
          }
          resolve(JSON.parse(value.toString()))
        })
      })
    })
  }
}
