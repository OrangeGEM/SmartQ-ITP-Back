const express = require('express');
const http = require('http');
const config = require('config');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
})

app.use(express.json({ extended: true }))
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));


async function start() {
    try{
        await mongoose.connect(config.get('mongoUrl'), {
            useNewUrlParser : true,
            useUnifiedTopology : true
        }, ()=> {
            console.log("[MongoDB] -> Initialized");
        });
    } catch (e) {
        console.log('Server Error', e.message);
        process.exit(1);
    }
}
start();

io.on('connection', (socket) => {
    console.log('[SocketIO] -> Client connected with id: ', socket.id)

    socket.on('disconnect', (reason) => {
        console.log('[SocketIO] -> Client disconnected with reason: ', reason)
    })
})


const PORT = config.get('port') || 5000;
server.listen(PORT, ()=> { console.log('App has been started on port ' + PORT) } );