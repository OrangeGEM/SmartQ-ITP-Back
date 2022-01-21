const express = require('express');
const http = require('http');
const config = require('config');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');
const fileUpload = require('express-fileupload');
const app = express();
const server = http.createServer(app);
const QueueModel = require('./models/Queue')
const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
})

app.use(fileUpload({}));
app.use(express.json({ extended: true }))
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/landing', require('./routes/landing.routes'));
app.use('/api/files', require('./routes/files.routes'));

let queueCount = 0;
async function start() {
    try{
        await mongoose.connect(config.get('mongoUrl'), {
            useNewUrlParser : true,
            useUnifiedTopology : true
        }, async ()=> {
            console.log("[MongoDB] -> Initialized");
            queueCount = await (await QueueModel.find({})).length;
            console.log("[MongoDB] -> Queue count: ", queueCount)
        });
    } catch (e) {
        console.log('Server Error', e.message);
        process.exit(1);
    }
}
start();

io.on('connection', (socket) => {
    console.log('[SocketIO] -> Client connected with id: ', socket.id)

    socket.on('changeQueueCount', (data) => {
        console.log('[SocketIO] -> Emited from client (changeQueueCount)')
        queueCount += data;
        socket.broadcast.emit('changeQueueCount', queueCount);
    })

    socket.on('getQueueCount', () => { 
        //console.log(`[SocketIO] -> Emited from client (getQueueCount : ${queueCount})`)
        socket.emit('getQueueCount', queueCount)
    })
    
    socket.on('disconnect', (reason) => {
        console.log('[SocketIO] -> Client disconnected with reason: ', reason)
    })

    socket.on('connect_error', (err) => {
        console.log(`connect_error due to ${err.message}`);
    })
})


const PORT = config.get('port') || 5000;
server.listen(PORT, ()=> { console.log('App has been started on port ' + PORT) } );