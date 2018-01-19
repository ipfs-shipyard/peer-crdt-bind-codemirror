'use strict'

const pLimit = require('p-limit')
const debounce = require('lodash.debounce')
const Diff = require('fast-diff')

const defaultOptions = {
  debounceMS: 2000
}

module.exports = bindCodeMirror

function bindCodeMirror (crdt, cm, opts) {
  const options = Object.assign({}, defaultOptions, opts)
  const selfChanges = new Set()
  let hasPendingChanges = false
  const changes = {
    adds: [],
    removes: []
  }
  let saving = false
  let hasMoreChanges = false
  let crdtChanges = []

  const limit = pLimit(1)
  const saveChanges = debounce(_saveChanges, options.debounceMS)

  cm.setValue(crdt.value())
  cm.on('beforeChange', codeMirrorBeforeChange)
  crdt.on('change', crdtChanged)

  return unbind

  function codeMirrorBeforeChange (cm, change) {
    if (change.origin === 'crdt' || change.origin === 'setValue') {
      return
    }
    hasPendingChanges = true
    let pos = cm.indexFromPos(change.from)
    const to = cm.indexFromPos(change.to)
    const length = to - pos
    for (let i = to; i > pos; i--) {
      const remove = findOrCreateRemoveStartingAtPos(i)
      remove.start--
      remove.length++
    }
    const text = change.text.join('\n')
    const add = findOrCreateAddFinishingAtPos(pos)
    add.chars.push(text)
    add.stop++
    saveChanges()
  }

  function findOrCreateAddFinishingAtPos (pos) {
    const adds = changes.adds.filter((add) => add.stop === pos)
    let add
    if (adds.length) {
      add = adds[0]
    } else {
      add = {
        start: pos,
        stop: pos,
        chars: []
      }
      changes.adds.push(add)
    }

    return add
  }

  function findOrCreateRemoveStartingAtPos (pos) {
    const removes = changes.removes.filter((remove) => remove.start === pos)
    let remove
    if (removes.length) {
      remove = removes[0]
    } else {
      remove = {
        start: pos,
        length: 0
      }
      changes.removes.push(remove)
    }

    return remove
  }

  async function _saveChanges () {
    if (saving) {
      hasMoreChanges = true
      return
    }
    saving = true

    // removes
    const removes = changes.removes
    changes.removes = []
    let actions = removes.map(
      (remove) => limit(() => {
        return crdt.removeAt(remove.start, remove.length).then(pushToSelfChanges)
      }))

    // adds
    const adds = changes.adds.filter((add) => add.chars.length)
    changes.adds = []
    actions = actions.concat(
      adds.map(
        (add) => limit(() => crdt.insertAt(add.start, add.chars.join('')).then(pushToSelfChanges))))

    const results = await Promise.all(actions)
    saving = false
    if (hasMoreChanges) {
      hasMoreChanges = false
      _saveChanges()
    } else {
      hasPendingChanges = false
      flushCrdtChanges()
    }
  }

  function crdtChanged (event) {
    return limit(() => _crdtChanged(event))
  }

  function _crdtChanged (event) {
    if (wasChangeFromSelf(event.id)) {
      return
    }

    crdtChanges.push(event)

    if (!hasPendingChanges) {
      flushCrdtChanges()
    }
  }

  function flushCrdtChanges () {
    const changes = crdtChanges
    crdtChanges = []

    changes.forEach((event) => {
      const fromIndex = cm.posFromIndex(event.pos)
      let toIndex
      if (event.type === 'insert') {
        toIndex = fromIndex
      } else if (event.type === 'delete') {
        toIndex = cm.posFromIndex(event.pos + event.deleted.length)
      }

      cm.replaceRange(event.atom || '', fromIndex, toIndex, 'crdt')
    })

    const content = crdt.value()
    const editorContent = cm.getValue()
    if (content !== editorContent) {
      converge(content, editorContent)
    }
  }

  function unbind () {
    cm.removeListener('beforeChange', codeMirrorBeforeChange)
    crdt.removeListener('change', crdtChanged)
  }

  function pushToSelfChanges (ids) {
    for (let id of ids) {
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

  function converge (content, editorContent) {
    const diff = Diff(editorContent, content)
    let index = 0
    diff.forEach((change) => {
      const op = change[0]
      const str = change[1]
      if (op === Diff.INSERT) {
        const fromIndex = cm.posFromIndex(index)
        cm.replaceRange(str, fromIndex, fromIndex, 'crdt')
      } else if (op === Diff.DELETE) {
        const fromIndex = cm.posFromIndex(index)
        const toIndex = cm.posFromIndex(index + str.length)
        cm.replaceRange(str, fromIndex, toIndex, 'crdt')
      }
      index += str.length
    })
  }
}
