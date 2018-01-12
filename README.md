# peer-crdt-bind-codemirror

Binds a [Codemirror](http://codemirror.net) editor and [peer-crdt](https://github.com/ipfs-shipyard/peer-crdt#readme).

## Install

```bash
$ npm install peer-crdt-bind-codemirror
```

## API

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

See [example](example/src/index.js).


# License

MIT
