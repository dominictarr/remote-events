# RemoteEvents

connect two EventEmitters through a stream!

``` js
var RemoteEventEmitter = require('..')
var es = require('event-stream')
var net = require('net')

var server = net.createServer(function (con) {
  var ree = new RemoteEventEmitter()
  con.pipe(ree.getStream())

  ree.on('ping', function (time) {
    console.log('PING', time)
    ree.emit('pong', Date.now())
  })
}).listen(2468, function () {

  var con = net.connect(2468)
  var ree = new RemoteEventEmitter()
  con.pipe(ree.getStream()).pipe(con)

  var time = Date.now()
  ree.on('pong', function (_time) {
    console.log('PONG', _time, _time - time)
    ree.disconnect()
    server.close()
  })
  ree.emit('ping', time)
})

```

now, one may wish to subclass `RemoteEventEmitter` wrap `net` or `http` or [shoe](http://github.com/substack/shoe) and provide a `connect` and `createServer` methods.

then you will have a very [socket.io](http://socket.io) like interface (but without the silly bundled RPC, etc)

however, I recommend instead wrap this with [browser-stream](http://github.com/dominictarr/browser-stream) -- which will allow you to multiplex streams through `RemoteEventEmitter`

which will be useful for A) keeping nice `Stream` abstractions when you have a limited budget for connections (like in the browser) and B) seperating interprocess communication abstractions (such as [dnode](http://github.com/substack/dnode) or [crdt](http://github.com/dominictarr/crdt). This has been a problem with libraries using the socket.io api directly.

## options

You can pass in `opts.wrap` to `RemoteEventEmitter` to set the
wrapper function that should be used by [`stream-serializer`][1]

  [1]: https://github.com/dominictarr/stream-serializer
