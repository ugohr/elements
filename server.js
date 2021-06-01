const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
const PORT = process.env.PORT || 80

app.use('/css',express.static(__dirname + '/css'))
app.use('/js',express.static(__dirname + '/js'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

server.listen(PORT, function() {
  console.log('listening on *:'+PORT)
})

var rooms = []
var playerRooms = []

io.on('connection', function(socket) {

  console.log('A user connected')

  // Create a new private game and generate random access code
  socket.on('hostCreateNewRoom', function(data) {
    let gameId = generateRoomId(6)
    this.emit('newRoomCreated', {gameId: gameId, socketId: this.id})
    socket.join(gameId)
    let players = [{username: data.username, socketId: this.id}]
    rooms.push({gameId: gameId, players: players})
    playerRooms.push({
        socketId: this.id,
        gameId: gameId
    })

    console.log(rooms)
    console.log(playerRooms)
  })

  socket.on('joinRoomByCode', function(data) {
    var room = rooms.find((e) => e.gameId === data.gameId)
    var index = rooms.indexOf(room)
    if (room) {
      let hasAlreadyJoined = false
      room.players.forEach((player, i) => {
        if (player.socketId === this.id)
          hasAlreadyJoined = true
      })
      if (!hasAlreadyJoined) {
        this.join(data.gameId)
        room.players.push({username: data.username, socketId: this.id})
        rooms[index] = room
        playerRooms.push({
            socketId: this.id,
            gameId: data.gameId
        })
      }
      io.in(data.gameId).emit('currentPlayers', room.players)
    }

    console.log(rooms)
    console.log(playerRooms)
  })

  socket.on('disconnecting', function() {

    console.log('A user disconnected')

    // Get gameId by socketId, then remove player from playerRooms
    var playerRoom = playerRooms.find((e) => e.socketId === this.id)
    var gameId = playerRoom.gameId
    var playerRoomIndex = playerRooms.indexOf(playerRoom)
    playerRooms.splice(playerRoomIndex, 1)

    // Get room by gameId, then remove player from room
    var room = rooms.find((e) => e.gameId === gameId)
    var index = rooms.indexOf(room)
    var player = room.players.find((e) => e.socketId === this.id)
    var playerIndex = room.players.indexOf(player)
    room.players.splice(playerIndex, 1)
    rooms[index] = room

    socket.broadcast.to(gameId).emit('disconnection', room.players)

    console.log(rooms)
    console.log(playerRooms)
  })
})

generateRoomId = (length) => {
   let result = ''
   let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
   let charactersLength = characters.length
   for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
   }
   return result
}
