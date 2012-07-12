var RemoteEventEmitter = require('..')
var es = require('event-stream')
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
  var str
  con.pipe(ree.getStream()).pipe(con)

  var time = Date.now()
  ree.on('pong', function (_time) {
    console.log('PONG', _time, _time - time)
    ree.disconnect()
    server.close()
  })
  ree.emit('ping', time)
})


