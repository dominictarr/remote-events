var EventEmitter = require('events').EventEmitter
var through = require('through')
var serializer = require('stream-serializer')
var util = require('util');
var events = require('events');

module.exports = RemoteEventEmitter

function RemoteEventEmitter (opts) {
  EventEmitter.call(this)
  this.buffer = []
  //XXX RemoteEventEmitters start off disconnected!
  //THIS IS MORE REALISTIC
  //REMEMBER to call connect() !
  this.connected = false
  var self = this
  this._opts = opts || {}
  this.on('connect', this.flush.bind(this))
}

util.inherits(RemoteEventEmitter, events.EventEmitter);

RemoteEventEmitter.prototype.flush = function () {
  while(this.buffer.length && this.connected)
    this.emit.apply(this, this.buffer.shift())
}

RemoteEventEmitter.prototype.getStream = function (raw) {

  if (this.stream && !this._stream.ended)
    return this.stream
  var self = this
  this._stream = through(function (data) {
   self.localEmit.apply(self, data)
  }, function () {
    this.emit('end')
    self.disconnect()
  })

  this.stream = raw ? this._stream
    : serializer(this._opts.wrap)(this._stream)

  var pipe = this.stream.pipe
  this.stream.pipe = function (other, opts) {
    var r = pipe.call(this, other, opts)
    process.nextTick(function () {
      self.connected = true
      self.localEmit('connect')
    })
    return r
  }
  return this.stream
}

RemoteEventEmitter.prototype.disconnect = function () {
  if(!this.connected) return
  this.connected = false
  if(this._stream && this._stream.writable && !this._stream.ended)
  this._stream.emit('end')
  this._stream = null
  this.stream.destroy()
  this.stream = null
  this.localEmit('disconnect')
}

RemoteEventEmitter.prototype.emit = function () {
  var args = [].slice.call(arguments)
  if(this.connected)
    return this._stream.emit('data', args)
  else
    this.buffer.push(args)
}

/*
  sometimes you need to access this, so I'm not using
  _emit ... that means this is a part of the API.

*/
RemoteEventEmitter.prototype.localEmit = function () {
  var args = [].slice.call(arguments)
  return EventEmitter.prototype.emit.apply(this, args)
}
