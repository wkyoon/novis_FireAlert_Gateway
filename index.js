
const io = require("socket.io-client");

var SerialPort = require('serialport')
const PORT = '/dev/ttyS0'
const BAUDRATE = 115200


// return by line 
// ,parser: new SerialPort.parsers.Readline("\n")
var serialport = new SerialPort(PORT,{baudRate:BAUDRATE,parser: new SerialPort.parsers.Readline("\n")})

var buf = Buffer.alloc(0)

serialport.on('open', function() {
  console.log("serialport open ",serialport.isOpen);
});

var uartcheck_rx =false

serialport.on('data', function (data) {
  //console.log("data Buf",data);
  //console.log('data str',data.toString('utf-8'));
 
  
  console.log('data',data)
  if(data.length>0)
  {
    if(data[0] == 0x55 )
    {
      if(data.length<16)
      {
        uartcheck_rx = true
        buf = Buffer.concat([buf,data])
      }
      else
      {
        var sid = data.slice(4,6)
        //console.log('on / off :',sid.toString('hex'))
        //console.log('on / off :',data[11])
        //console.log('temp :',data[14])
        socket.emit('chat message', data.toString('hex'));
        if(data[11] === 1)
        {
          socket.emit('fire', sid.toString('hex')+","+data[14]);
          
        }
        else
        {
          socket.emit('alive', sid.toString('hex')+","+data[14]);
        }
        
      }
      
      
    }
    else
    {
      buf = Buffer.concat([buf,data])

      if(uartcheck_rx)
      {
        socket.emit('chat message', buf.toString('hex'));
        var sid = buf.slice(4,6)
        //console.log('on / off :',sid.toString('hex'))
        //console.log('on / off :',buf[11])
        //console.log('temp :',buf[14])
        if(buf[11] === 1)
        {
          //console.log('send to server!!!!')
          socket.emit('fire', sid.toString('hex')+","+buf[14]);
        }
        else
        {
          socket.emit('alive', sid.toString('hex')+","+buf[14]);
        }
        uartcheck_rx = false
        buf = Buffer.alloc(0)
        return
      }

      var index = buf.lastIndexOf(0x0a)
      //var index = buf.indexOf(0x0a)
      var indexlast = buf.length
  
      console.log('index',index)
      console.log('indexlast',indexlast)
  
      var newbuf = buf.slice(0,index)
      console.log('newbuf',newbuf)
      console.log('newbuf length',newbuf.length)

      if(newbuf.length>0)
          socket.emit('chat message', newbuf.toString('utf-8'));
  
      buf= buf.slice(index,indexlast)
    }

    

  }
    //console.log('receive',data.toString('utf-8'));
    //
  
});

//serialport.write(msg+'\n')

//const socket = io("http://15.164.102.170:3000/");
var socket = require('socket.io-client')('http://novisfirealert.ga:3001');
//console.log(socket.id); // undefined

socket.on("connect", () => {
  console.log(socket.id); // "G5p5..."

  socket.emit("chat message", "Gateway Connect");
});


socket.on("chat message", (data) => {
  console.log(data);
  serialport.write(data+'\n')
});
