# RemoteEvents

connect two EventEmitters through a stream!

``` js
var RemoteEventEmitter = require('..')
var net = require('net')

var server = net.createServer(function (con) {
  var ree = new RemoteEventEmitter()
  con.pipe(ree.getStream()).pipe(con)

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

## options

You can pass in `opts.wrap` to `RemoteEventEmitter` to set the
wrapper function that should be used by [`stream-serializer`][1]

  [1]: https://github.com/dominictarr/stream-serializer
