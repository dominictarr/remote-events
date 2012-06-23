var RemoteEventEmitter = require('..')
var a = require('assertions')
var A = new RemoteEventEmitter()
var B = new RemoteEventEmitter()

var helloB = false

a.equal(A.connected, false)
a.equal(B.connected, false)

A.getStream().pipe(B.getStream())

a.equal(A.connected, true)
a.equal(B.connected, false)

B.getStream().pipe(A.getStream())

a.equal(B.connected, true)

B.on('hello', function (hi) {
  helloB = true
  a.equal(hi, 'HELLO THERE')
})

A.emit('hello', 'HELLO THERE')

a.equal(helloB, true)

helloB = false

var disconnectA, disconnectB
A.once('disconnect', function () {
  disconnectA = true
})
B.once('disconnect', function () {
  disconnectB = true
})

A.disconnect()

a.equal(disconnectA, true)
a.equal(disconnectB, true)
a.equal(A.connected, false)
a.equal(B.connected, false)


