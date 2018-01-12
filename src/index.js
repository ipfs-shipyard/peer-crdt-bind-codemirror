'use strict'

const pLimit = require('p-limit')

module.exports = bindCodeMirror

function bindCodeMirror (crdt, cm) {
  const selfChanges = new Set()

  const limit = pLimit(1)

  cm.setValue(value())
  cm.on('beforeChange', codeMirrorBeforeChange)
  crdt.on('change', crdtChanged)

  return unbind

  function codeMirrorBeforeChange (cm, change) {
    if (change.origin === 'crdt') {
      return
    }
    const pos = cm.indexFromPos(change.from)
    console.log('POS:', pos)
    const to = cm.indexFromPos(change.to)
    for(let i = pos; i < to; i++) {
      limit(() => crdt.removeAt(i).then(pushToSelfChanges))
    }
    const text = change.text.join('\n')
    limit(() => crdt.insertAt(pos, text).then(pushToSelfChanges))
  }

  function crdtChanged (event) {
    return limit(() => _crdtChanged(event))
  }

  function _crdtChanged (event) {
    if (wasChangeFromSelf(event.id)) {
      console.log('was change from self')
      return
    }
    const fromIndex = cm.posFromIndex(event.pos)
    let toIndex
    if (event.type === 'insert') {
      toIndex = fromIndex
    } else if (event.type === 'delete') {
      toIndex = cm.posFromIndex(event.pos + event.deleted.length)
    }

    cm.replaceRange(event.atom || '', fromIndex, toIndex, 'crdt')
  }

  function value() {
    return crdt.value().join('')
  }

  function unbind () {
    cm.removeListener('beforeChange', codeMirrorBeforeChange)
    crdt.removeListener('change', crdtChanged)
  }

  function pushToSelfChanges(ids) {
    for(let id of ids) {
      selfChanges.add(id)
    }
  }

  function wasChangeFromSelf (id) {
    if (selfChanges.has(id)) {
      selfChanges.delete(id)
      return true
    }
    return false
  }
}
