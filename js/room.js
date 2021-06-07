class Room {

    constructor() {
        this.preload()
        this.ownerId = ''
        this.players = []
        this.gameId = ''
    }

    preload() {

        /**
         * Handle room creation
         */
        client.socket.on('newRoomCreated', (data) => {
            document.getElementById('privateCode').value = data.gameId
            room.gameId = data.gameId
            client.joinRoomByCode()
        })

        /**
         * Handle new player in the room
         */
        client.socket.on('newPlayerJoined', (players) => {
            document.getElementById('home').style.display = 'none'
            document.getElementById('room').style.display = 'flex'
            document.getElementById('room-players').innerHTML = ''
            this.listPlayers(players)
        })

        /**
         * Handle player disconnection
         */
        client.socket.on('disconnection', (players) => {
            document.getElementById('room-players').innerHTML = ''
            if (this.ownerId !== players[0].socketId)
                this.ownerId = players[0].socketId
            this.listPlayers(players)
        })

        /**
         * Handle game start
         */
        client.socket.on('gameStarted', () => {
            document.getElementById('room').style.display = 'none'
            document.getElementById('game').style.display = 'flex'
        })
    }

    /**
     * Display all players in the room
     */
    listPlayers(players) {
        this.players = players
        players.forEach((player, i) => {
            let user = document.createElement('div')
            if (player.isOwner)
                this.ownerId = player.socketId
            user.innerHTML = 'Player '+(i+1)+' : '+player.username+(player.isOwner ? ' (Hôte)' : '')+'\n'
            document.getElementById('room-players').appendChild(user)
        })
        if (this.players.length > 1 && this.ownerId === client.socketId)
            document.getElementById('startButton').style.display = 'flex'
        else
            document.getElementById('startButton').style.display = 'none'
    }

    /**
     * Start the game
     */
    startGame() {
        client.socket.emit('hostStartGame', {gameId: this.gameId})
    }
}