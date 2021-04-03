const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

var SerialPort = require('serialport')
const PORT = '/dev/ttyS0'
const BAUDRATE = 115200

const port = process.env.PORT || 3000;

const app = express()

const server = http.createServer(app)
const io = socketIo(server)

// return by line 
// ,parser: new SerialPort.parsers.Readline("\n")
var serialport = new SerialPort(PORT,{baudRate:BAUDRATE,parser: new SerialPort.parsers.Readline("\n")})

var buf = Buffer.alloc(0)

serialport.on('open', function() {
  console.log("serialport open ",serialport.isOpen);
});


serialport.on('data', function (data) {
  //console.log("data Buf",data);
  //console.log('data str',data.toString('utf-8'));
 
  buf = Buffer.concat([buf,data])
  console.log('buf',buf)
  if(buf.length>0)
  {

    var index = buf.lastIndexOf(0x0a)
    //var index = buf.indexOf(0x0a)
    var indexlast = buf.length

    

    console.log('index',index)
    console.log('indexlast',indexlast)

    var newbuf = buf.slice(0,index)
    console.log('newbuf',newbuf)
    io.emit('message', newbuf.toString('utf-8'));

    buf= buf.slice(index,indexlast)

  }
    //console.log('receive',data.toString('utf-8'));
    //
  
});



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

  //socket.emit('chat message','welcome')

  //socket.broadcast.emit('chat message','broadcast welcome')


  socket.on('message', msg => {
    //console.log('message',msg)
    io.emit('message', msg);
    serialport.write(msg+'\n')
  });
  
  // socket.on('disconnect',() => {
  //   io.emit('chat message','A user has left the chat')
  // })

});

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});


