'use strict'

const debounce = require('lodash.debounce')
const flatten = require('lodash.flatten')

module.exports = bindCursors

const defaultOptions = {
  debounceMS: 2000
}

function bindCursors (cursors, cm, opts) {
  let peerId
  const options = Object.assign({}, defaultOptions, opts)
  const _onCursorActivity = debounce(onCursorActivity, options.debounceMS)

  cursors.peerId().then((id) => {
    peerId = id
    cm.on('cursorActivity', _onCursorActivity)
  })

  cursors.on('change', (event) => {
    const remotePeer = event.key
    if (remotePeer === peerId) {
      // my own cursor, desmiss
      return
    }
    setSelectionsFromCRDT()
  })

  return unbind

  function getLocalSelection () {
    return {
      anchor: cm.getCursor('from'),
      head: cm.getCursor('head')
    }
  }

  function onCursorActivity (event) {
    const selection = getLocalSelection()
    if (peerId) {
      cursors.set(peerId, selection)
    }
  }

  function setSelectionsFromCRDT () {
    let selfIndex = -1
    const currentSelections = cursors.value()
    let selections = flatten(Array.from(currentSelections.keys()).map((peer, index) => {
      let moreSelections
      let isSelf = peer === peerId
      if (isSelf) {
        selfIndex = index
        moreSelections = [getLocalSelection()]
      } else {
        moreSelections = currentSelections.get(peer)
      }
      return moreSelections
    }))

    if (selfIndex === -1) {
      selfIndex = selections.length
      selections.push(getLocalSelection())
    }

    cm.setSelections(selections, selfIndex)
  }

  function unbind () {
    cm.removeListener('cursorActivity', _onCursorActivity)
  }
}
