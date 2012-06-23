var RemoteEventEmitter = require('..')
var es = require('event-stream')
var net = require('net')

var server = net.createServer(function (con) {
  var ree = new RemoteEventEmitter()
  con
    .pipe(es.split())       //to lines
    .pipe(es.parse())       //to objects
    .pipe(ree.getStream())  //to events
    .pipe(es.stringify())   //to json-lines
    .pipe(con)              //to network

  ree.on('ping', function (time) {
    console.log('PING', time)
    ree.emit('pong', Date.now())
  })
}).listen(2468, function () {
 
  var con = net.connect(2468)
  var ree = new RemoteEventEmitter()
  var str
  con
    .pipe(es.split())
    .pipe(es.parse())
    .pipe(ree.getStream())
    .pipe(es.stringify())
    .pipe(con)

  var time = Date.now()
  ree.on('pong', function (_time) {
    console.log('PONG', _time, _time - time)
    ree.disconnect()
    server.close()
  })
  ree.emit('ping', time)
})


