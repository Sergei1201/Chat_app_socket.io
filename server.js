const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
require('dotenv').config()
const formatMessage = require('./utils/messages')
const {userJoin, userLeaves, getCurrentUser, getRoomUsers} = require('./utils/users')
// Create a server in order to implement socket.io
const server = http.createServer(app)
// Initialize socket.io
const io = socketio(server)

// Create a static folder
app.use(express.static(path.join(__dirname, 'public')))

// ChatCord Bot
  const chatBot = 'Admin'

// Run when a client connects to the server
io.on('connection', socket => {

  // Join room
  socket.on('joinRoom', ({username, room}) => {

    // Create the room user
    const user = userJoin(socket.id, username, room)

    // Join a specific room
    socket.join(user.room)

    
  // Emit a message to the client when he/she connects
socket.emit('message', formatMessage(chatBot, 'Welcome to the chatcord'))

// Broadcast to room users when a certain user joins the room
socket.broadcast.to(user.room).emit('message', formatMessage(chatBot, `${user.username} has joined the chat`))

// Send users information to the sidebar
io.to(user.room).emit('userInfo', {
  room: user.room,
  users: getRoomUsers(user.room)
})

  })
 
// Listen for a message from client
socket.on('chatMessage', msg => {
    // Get the current user by his/her ID and send a message to the specific room
    const user = getCurrentUser(socket.id) 
    
    io.to(user.room).emit('message', formatMessage(user.username, msg))
})

// Broadcast when a client disconnects
socket.on('disconnect', () => {
    // Get the leaving user
    const user = userLeaves(socket.id)
    if(user) {
       io.to(user.room).emit('message', formatMessage(chatBot, `${user.username} has left the chat`))
        io.to(user.room).emit('userInfo', {
          room: user.room,
          users: getRoomUsers(user.room)
        })
    }
   
} ) 
})  







// Initialize the environment variable
const PORT = process.env.PORT || 5000

// listen on a certain port
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))