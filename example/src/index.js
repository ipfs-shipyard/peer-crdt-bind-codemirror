'use strict'

const Codemirror = require('codemirror')
const bind = require('../../')
const CRDT = require('./crdt')

CRDT('treedoc', 'peer-crdt-bind-codemirror-example').then(async (crdt) => {
  const cmOptions = {
    lineNumbers: true
  }
  const codemirror = Codemirror.fromTextArea(document.getElementById('codemirror'), cmOptions)
  const unbind = bind(crdt, codemirror)
})
