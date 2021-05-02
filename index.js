require('dotenv').config()
const express = require('express')
const socketio = require('socket.io')


const app = express()
app.set('view engine', 'ejs')

app.get('/', (req, res) =>{
    res.render('home')
})



app.get('/login', (req, res) =>{
    res.render('login')
})

app.get('/chat', (req, res) =>{
    res.render('chat')
})



const PORT = process.env.PORT || 8080
const httpServer = app.listen(PORT, () =>{
    console.log(`http://localhost:${PORT}`)
})
const io = socketio(httpServer)

io.on('connection', client =>{
    console.log(`Client ${client.id} connected`)
    client.free = true
    client.loginAt = new Date().toLocaleTimeString();

    client.on('disconnect', () => {
        console.log(`\t\t${client.id} has left`)
        client.broadcast.emit('user-leave', client.id)
    })

    client.on('register-name', username =>{
        client.username = username
        client.broadcast.emit('register-name', {id: client.id, username: username})
    })

    client.emit('list-users', Array.from(io.sockets.sockets.values())
    .map(socket => ({id: socket.id, username: socket.username, free: socket.free, loginAt: socket.loginAt})))
    client.broadcast.emit('new-user', {id: client.id, username: client.username, free: client.free, loginAt: client.loginAt})
})

// .emit('event','data')
// .on('event','data')