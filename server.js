const app = require('express')()
const http = require('http')
const server = http.createServer(app)
const socket = require('socket.io')
const io =  socket(server,{ cors: { origin: '*' , methods: ["GET", "POST"],},})

let socketId = { socket1: null , socket2: null};

let punk = { x1: 165 , x2: 165 }
let ball = { x: 250 , y: 250 , dx: 2 , dy: 1 , score1: 0 , score2: 0 , winMessageFor1: false , winMessageFor2: false }

const radiusOfBall = 15;

const canvas = { width: 500 , height: 500 }

io.on("connection", (socket) => {

    console.log('user connected',socket.id)
    if(socketId.socket1 === null)
    {
        socketId.socket1 = socket.id;
        socket.emit('socketId' , socketId);
    }
    else
    {
        if( socketId.socket2 === null )
        {
            socketId.socket2 = socket.id;
            socket.emit('socketId' , socketId);
        }
    }

    socket.on('punkClient',(abcd)=>{
        punk = abcd
        io.emit('punk', punk)
    })

    // socket.on('socketId',(ID)=>{
    //     socketId = ID;
    //     console.log('hello');
    //     io.emit('socketId', socketId)
    // })

    setInterval(() => {
    if( ball.score1 == 20000 || ball.score2 == 20000 )
    {
        if(ball.score1 == 20000)
        {
            ball.winMessageFor1 = true;
        }
        else if( ball.score2 == 20000 )
        {
            ball.winMessageFor2 = true;
        }
    }

    if ( socketId.socket1 !== null && socketId.socket2 !== null )
    {
        ball.x += ball.dx;
        ball.y += ball.dy;
    }
    if (ball.x + radiusOfBall > canvas.width || ball.x - radiusOfBall < 0) 
    {
        ball.dx = -ball.dx;
    }
    if( ball.y + radiusOfBall >= 450  || ball.y - radiusOfBall >= 450)
    {
        if(ball.x + radiusOfBall >= punk.x2 - 2 && ball.x + radiusOfBall <= punk.x2 + 152)
        {
            ball.dy = -ball.dy;
        }
    }
    if( ball.y - radiusOfBall <= 30 || ball.y + radiusOfBall == 30)
    {
        if(ball.x + radiusOfBall >= punk.x1 - 2 && ball.x + radiusOfBall <= punk.x1 + 152)
        {
            ball.dy = -ball.dy;
        }
    }
    if (ball.y - radiusOfBall < 0 || ball.y + radiusOfBall > canvas.height) 
    {
        ball.dy = -ball.dy;
    }
    if( ball.y - radiusOfBall <= 0 && ball.x >= 130 && ball.x <= 370)
    {
        ball.score1 += 1/3;
    }
    if( ball.y + radiusOfBall >= 500 && ball.x >= 130 && ball.x <= 370)
    {
        ball.score2 += 1/3;
    }
    
    socket.emit('ball',ball)
      
    }, 10);


    socket.on('disconnect',()=>{
    console.log('client disconnected',socket.id)
    if( socketId.socket1 == socket.id)
    {
        socketId.socket1=null
    }
    else
    {
        socketId.socket2=null
    }
    punk = { x1: 165 , x2: 165 };
    socket.broadcast.emit('punkClient', punk);
    ball = { x: 250 , y: 250 , dx: 2 , dy: 1 , score1: 0 , score2: 0 , winMessageFor1: false , winMessageFor2: false };
    socket.broadcast.emit('ball', ball);
    })
})
server.listen(3000 , ()=>{
    console.log('listening at 3000')
})
