'use strict'

const Codemirror = require('codemirror')
const bind = require('../../')
const IPFS = require('./ipfs')
const CRDT = require('./crdt')

const ipfs = IPFS()

Promise.all(
  [
    CRDT(ipfs, 'treedoc-text', 'peer-crdt-bind-codemirror-example-text'),
    CRDT(ipfs, 'mv-register', 'peer-crdt-bind-codemirror-example-cursors')
  ])
  .then(async ([text, cursors]) => {
    const cmOptions = {
      lineNumbers: true
    }
    const codemirror = Codemirror.fromTextArea(document.getElementById('codemirror'), cmOptions)
    bind.editor(text, codemirror)
    bind.cursors(cursors, codemirror)
  }
)
