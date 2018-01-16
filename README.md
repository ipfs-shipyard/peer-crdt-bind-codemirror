# peer-crdt-bind-codemirror

Binds a [Codemirror](http://codemirror.net) editor and [peer-crdt](https://github.com/ipfs-shipyard/peer-crdt#readme).

## Install

```bash
$ npm install peer-crdt-bind-codemirror
```

## Example

```js
const Codemirror = require('codemirror')
const bind = require('peer-crdt-bind-codemirror')
const crdt = ...
const editor = Codemirror.fromTextArea(document.getElementById('codemirror'))

// bind editor to a CRDT
const unbind = bind(crdt, editor)

// some time later ...

unbind()
```

## API

# `bind (crdt, editor [, options])`

Returns an unbind function.

Arguments:

* `crdt`: must be a CRDT of type `treedoc`
* `editor`: an instance of Codemirror
* `options`: optional object with the following shape:
  * `debounceMS`: how long (in miliseconds) after the last edit should the CRDT be updated. Default is `2000`.

See [example](example/src/index.js).


# License

MIT
