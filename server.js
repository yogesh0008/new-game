const app = require('express')()
const http = require('http')
const server = http.createServer(app)
const socket = require('socket.io')
const io = socket(server,{ cors: { origin: '*' , methods: ["GET", "POST"],},})

let socketId = { socket1: null , socket2: null};

let punk = { x1: 165 , x2: 165 }
let ball = { x: 250 , y: 250 , dx: 3 , dy: 2 , score1: 0 , score2: 0 }

const radiusOfBall = 15;
let whoWin = '';
let intervalId = null;

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

    socket.on('moveLeft', () => {
        if ( socketId.socket1 === socket.id )
        {
          if(punk.x1 > 0)
          punk.x1 -= 10;
          io.emit("punk", punk);
        }
        else {
          if( punk.x2 > 0)
          punk.x2 -= 10;
          io.emit("punk", punk);
        }
    });
    socket.on('moveRight', () => {
        if (socketId.socket1 === socket.id)
        {
          if( punk.x1 < 350 )
          punk.x1 += 10;
          io.emit("punk", punk);
        } 
        else 
        {
          if( punk.x2 < 350) 
          punk.x2 += 10;
          io.emit("punk", punk);
        }
    });

    if( whoWin == '' )
    {

    if( intervalId )
    {
        clearInterval(intervalId);
    }

    intervalId = setInterval(() => {
    if( ball.score1 == 15 || ball.score2 == 15 )
    {
        if(ball.score1 == 15)
        {
            // ball.winMessageFor1 = true;
            whoWin = 'Player 1 Win';
            io.emit('message' , whoWin);
        }
        else if( ball.score2 == 15 )
        {
            whoWin = 'Player 2 Win';
            io.emit('message' , whoWin);
        }
    }

    // Check if ball is going out of bounds on left or right side
    if (ball.x + ball.dx > canvas.width - radiusOfBall || ball.x + ball.dx < radiusOfBall) 
    {
        ball.dx = -ball.dx;
    }
  
    // Check if ball is going out of bounds on top or bottom side
    if (ball.y + ball.dy > canvas.height - radiusOfBall || ball.y + ball.dy < radiusOfBall) 
    {
        ball.dy = -ball.dy;
    }
  
    // Check if ball is colliding with punk1
    if (ball.y + ball.dy < 30 + radiusOfBall) 
    {
        if (ball.x + radiusOfBall > punk.x1 && ball.x - radiusOfBall < punk.x1 + 150) 
        {
            ball.dy = -ball.dy;
            ball.y = 30 + radiusOfBall;
        }
    }
  
    // Check if ball is colliding with punk2
    if (ball.y + ball.dy > canvas.height - 30 - radiusOfBall) 
    {
        if (ball.x + radiusOfBall > punk.x2 && ball.x - radiusOfBall < punk.x2 + 150) 
        {
            ball.dy = -ball.dy;
            ball.y = canvas.height - 30 - radiusOfBall;
        }
    }

    if( ball.y - radiusOfBall <= 0 && ball.x >= 130 && ball.x <= 370)
    {
        ball.score1 += 1;
    }
    if( ball.y + radiusOfBall >= 500 && ball.x >= 130 && ball.x <= 370)
    {
        ball.score2 += 1;
    }

    if ( socketId.socket1 !== null && socketId.socket2 !== null )
    {
        ball.x += ball.dx;
        ball.y += ball.dy;
    }

    io.emit('ball',ball)
    
    }, 10);

    }



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
    whoWin = '';
    socket.broadcast.emit('message' , whoWin);
    punk = { x1: 165 , x2: 165 };
    socket.broadcast.emit('punk', punk);
    ball = { x: 250 , y: 250 , dx: 3 , dy: 2 , score1: 0 , score2: 0 , winMessageFor1: false , winMessageFor2: false };
    socket.broadcast.emit('ball', ball);
    })
})
server.listen(3000 , ()=>{
    console.log('listening at 3000')
})
